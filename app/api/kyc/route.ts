import { prisma } from "@/lib/prisma";
import {
  forbiddenResponse,
  getSessionUserIdFromCookies,
  unauthorizedResponse,
} from "@/lib/session";

function lastFour(value: string) {
  const cleanValue = value.replace(/\D/g, "");
  return cleanValue.slice(-4);
}

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

    const verification = await prisma.kycVerification.findUnique({
      where: {
        userId,
      },
    });

    return Response.json({ verification });
  } catch (error) {
    console.log("GET KYC ERROR:", error);

    return Response.json(
      { error: "Failed to load KYC status" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const sessionUserId = await getSessionUserIdFromCookies();
    const body = await req.json();
    const {
      userId,
      legalName,
      dateOfBirth,
      phone,
      country,
      idType,
      idNumber,
    } = body;

    if (!sessionUserId) return unauthorizedResponse();

    if (!userId || !legalName || !dateOfBirth || !phone || !idType || !idNumber) {
      return Response.json(
        { error: "All KYC fields are required" },
        { status: 400 }
      );
    }

    if (userId !== sessionUserId) return forbiddenResponse();

    const providerRef = `pathpayx-${userId}-${Date.now()}`;
    const verification = await prisma.kycVerification.upsert({
      where: {
        userId,
      },
      update: {
        provider: "Smile ID",
        status: "Pending",
        legalName,
        dateOfBirth,
        phone,
        country: country || "Nigeria",
        idType,
        idLast4: lastFour(idNumber),
        providerRef,
        rejectionReason: null,
        submittedAt: new Date(),
      },
      create: {
        userId,
        provider: "Smile ID",
        status: "Pending",
        legalName,
        dateOfBirth,
        phone,
        country: country || "Nigeria",
        idType,
        idLast4: lastFour(idNumber),
        providerRef,
        submittedAt: new Date(),
      },
    });

    const smileReady = Boolean(
      process.env.NEXT_PUBLIC_SMILE_PARTNER_ID &&
        process.env.NEXT_PUBLIC_SMILE_WEB_TOKEN_URL &&
        process.env.NEXT_PUBLIC_SMILE_PRODUCT
    );

    return Response.json({
      message: smileReady
        ? "KYC submitted. Start Smile ID verification to complete checks."
        : "KYC submitted. Add Smile ID keys to enable live verification.",
      verification,
      provider: {
        ready: smileReady,
        name: "Smile ID",
        partnerId: process.env.NEXT_PUBLIC_SMILE_PARTNER_ID || "",
        webTokenUrl: process.env.NEXT_PUBLIC_SMILE_WEB_TOKEN_URL || "",
        product: process.env.NEXT_PUBLIC_SMILE_PRODUCT || "biometric_kyc",
        reference: providerRef,
      },
    });
  } catch (error) {
    console.log("SUBMIT KYC ERROR:", error);

    return Response.json(
      { error: "Failed to submit KYC" },
      { status: 500 }
    );
  }
}
