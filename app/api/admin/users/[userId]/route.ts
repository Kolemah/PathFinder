import { requireAdminUser } from "@/lib/admin";
import { sendEmail } from "@/lib/email";
import { kycStatusTemplate } from "@/lib/email-templates";
import { prisma } from "@/lib/prisma";
import { releaseMaturedPayments } from "@/lib/wallet-release";
import { PAYMENT_STATUS_PENDING_CLEARANCE } from "@/lib/wallet";

function sum(items: { amount: number }[]) {
  return items.reduce((total, item) => total + Number(item.amount), 0);
}

async function loadUser(userId: string) {
  await releaseMaturedPayments(userId);

  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      kycVerification: true,
      invoices: {
        include: {
          customer: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      transactions: {
        orderBy: {
          createdAt: "desc",
        },
      },
      payouts: {
        orderBy: {
          requestedAt: "desc",
        },
      },
      customers: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

function formatUser(user: NonNullable<Awaited<ReturnType<typeof loadUser>>>) {
  const paidInvoices = user.invoices.filter((invoice) => invoice.status === "Paid");
  const pendingInvoices = paidInvoices.filter(
    (invoice) => invoice.paymentStatus === PAYMENT_STATUS_PENDING_CLEARANCE
  );
  const platformFeeUsd = paidInvoices.reduce(
    (total, invoice) => total + Number(invoice.platformFeeUsd || 0),
    0
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    photo: user.photo,
    balance: user.balance,
    createdAt: user.createdAt,
    kycVerification: user.kycVerification,
    invoices: user.invoices,
    transactions: user.transactions,
    payouts: user.payouts,
    customers: user.customers,
    stats: {
      invoiceCount: user.invoices.length,
      paidInvoiceCount: paidInvoices.length,
      pendingUsd: sum(pendingInvoices),
      totalPaidUsd: sum(paidInvoices),
      platformFeeUsd,
      totalPayouts: sum(user.payouts),
      customerCount: user.customers.length,
    },
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { response } = await requireAdminUser();

    if (response) return response;

    const { userId } = await params;
    const user = await loadUser(userId);

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({
      user: formatUser(user),
    });
  } catch (error) {
    console.log("GET ADMIN USER ERROR:", error);

    return Response.json(
      { error: "Failed to load admin user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { response } = await requireAdminUser();

    if (response) return response;

    const { userId } = await params;
    const body = await req.json();
    const { role, kycStatus } = body;

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!existingUser) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (role !== undefined) {
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          role,
        },
      });
    }

    if (kycStatus !== undefined) {
      const now = new Date();

      await prisma.kycVerification.upsert({
        where: {
          userId,
        },
        update: {
          status: kycStatus,
          rejectionReason:
            kycStatus === "Rejected" ? "Rejected by admin review" : null,
          submittedAt: kycStatus === "Not Submitted" ? null : now,
          verifiedAt: kycStatus === "Verified" ? now : null,
        },
        create: {
          userId,
          provider: "Admin Review",
          status: kycStatus,
          legalName: existingUser.name,
          dateOfBirth: "",
          phone: "",
          country: "Nigeria",
          idType: "NIN",
          idLast4: "0000",
          submittedAt: kycStatus === "Not Submitted" ? null : now,
          verifiedAt: kycStatus === "Verified" ? now : null,
          rejectionReason:
            kycStatus === "Rejected" ? "Rejected by admin review" : null,
        },
      });

      if (kycStatus === "Verified" || kycStatus === "Rejected") {
        sendEmail({
          to: existingUser.email,
          subject:
            kycStatus === "Verified"
              ? "Your PathPayX KYC has been approved"
              : "Your PathPayX KYC needs attention",
          html: kycStatusTemplate({
            name: existingUser.name,
            status: kycStatus === "Verified" ? "approved" : "rejected",
            reason:
              kycStatus === "Rejected" ? "Rejected by admin review" : undefined,
            kycUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/kyc`,
          }),
        }).catch((error) => {
          console.log("KYC STATUS EMAIL ERROR:", error);
        });
      }
    }

    const user = await loadUser(userId);

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({
      message: "User updated successfully",
      user: formatUser(user),
    });
  } catch (error) {
    console.log("UPDATE ADMIN USER ERROR:", error);

    return Response.json(
      { error: "Failed to update admin user" },
      { status: 500 }
    );
  }
}
