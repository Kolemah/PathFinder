import { prisma } from "@/lib/prisma";
import {
  forbiddenResponse,
  getSessionUserIdFromCookies,
  unauthorizedResponse,
} from "@/lib/session";
import { sendEmail } from "@/lib/email";
import { payoutRequestedTemplate } from "@/lib/email-templates";
import { formatNaira } from "@/lib/wallet";

const MINIMUM_PAYOUT_NGN = 10000;

export async function GET(req: Request) {
  try {
    const sessionUserId = await getSessionUserIdFromCookies();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!sessionUserId) return unauthorizedResponse();

    if (!userId) {
      return Response.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (userId !== sessionUserId) return forbiddenResponse();

    const payouts = await prisma.payout.findMany({
      where: {
        userId,
      },
      orderBy: {
        requestedAt: "desc",
      },
    });

    return Response.json({ payouts });
  } catch (error) {
    console.log("GET PAYOUTS ERROR:", error);

    return Response.json(
      { error: "Failed to load payouts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const sessionUserId = await getSessionUserIdFromCookies();
    const body = await req.json();
    const { userId, amount } = body;

    if (!sessionUserId) return unauthorizedResponse();

    if (!userId) {
      return Response.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (userId !== sessionUserId) return forbiddenResponse();

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        kycVerification: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.kycVerification?.status !== "Verified") {
      return Response.json(
        { error: "KYC verification is required before payout" },
        { status: 403 }
      );
    }

    const payoutAmount =
      amount === undefined ? Number(user.balance) : Number(amount);

    if (!Number.isFinite(payoutAmount) || payoutAmount <= 0) {
      return Response.json(
        { error: "Payout amount is invalid" },
        { status: 400 }
      );
    }

    if (payoutAmount < MINIMUM_PAYOUT_NGN) {
      return Response.json(
        { error: "Minimum payout is ₦10,000" },
        { status: 400 }
      );
    }

    if (payoutAmount > Number(user.balance)) {
      return Response.json(
        { error: "Insufficient available balance" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedUserCount = await tx.user.updateMany({
        where: {
          id: userId,
          balance: {
            gte: payoutAmount,
          },
        },
        data: {
          balance: {
            decrement: payoutAmount,
          },
        },
      });

      if (updatedUserCount.count === 0) {
        throw new Error("Insufficient available balance");
      }

      const payout = await tx.payout.create({
        data: {
          userId,
          amount: payoutAmount,
          status: "Requested",
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: "Payout",
          amount: payoutAmount,
        },
      });

      const updatedUser = await tx.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          photo: true,
          balance: true,
        },
      });

      return {
        payout,
        transaction,
        user: updatedUser,
      };
    });

    sendEmail({
      to: user.email,
      subject: "Payout request received",
      html: payoutRequestedTemplate({
        name: user.name,
        amount: formatNaira(payoutAmount),
        payoutStatus: result.payout.status,
      }),
    }).catch((error) => {
      console.log("PAYOUT EMAIL ERROR:", error);
    });

    return Response.json({
      message: "Payout requested successfully",
      ...result,
    });
  } catch (error) {
    console.log("CREATE PAYOUT ERROR:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to request payout",
      },
      { status: 500 }
    );
  }
}
