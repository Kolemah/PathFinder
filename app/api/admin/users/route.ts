import { requireAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { releaseMaturedPayments } from "@/lib/wallet-release";
import { PAYMENT_STATUS_PENDING_CLEARANCE } from "@/lib/wallet";

function sum(items: { amount: number }[]) {
  return items.reduce((total, item) => total + Number(item.amount), 0);
}

export async function GET() {
  try {
    const { response } = await requireAdminUser();

    if (response) return response;

    const usersToRelease = await prisma.user.findMany({
      select: {
        id: true,
      },
    });

    await Promise.all(
      usersToRelease.map((user) => releaseMaturedPayments(user.id))
    );

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        kycVerification: true,
        invoices: true,
        transactions: true,
        payouts: true,
        customers: true,
      },
    });

    const formattedUsers = users.map((user) => {
      const paidInvoices = user.invoices.filter(
        (invoice) => invoice.status === "Paid"
      );
      const pendingInvoices = paidInvoices.filter(
        (invoice) => invoice.paymentStatus === PAYMENT_STATUS_PENDING_CLEARANCE
      );
      const platformFeeUsd = paidInvoices.reduce(
        (total, invoice) =>
          total +
          Number(invoice.platformFeeUsd || 0) * Number(invoice.exchangeRate || 1),
        0
      );
      const totalPayouts = sum(user.payouts);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        photo: user.photo,
        balance: user.balance,
        createdAt: user.createdAt,
        kycStatus: user.kycVerification?.status || "Not Submitted",
        invoiceCount: user.invoices.length,
        paidInvoiceCount: paidInvoices.length,
        pendingUsd: pendingInvoices.reduce(
          (total, invoice) => total + Number(invoice.netAmountNgn || 0),
          0
        ),
        totalPaidUsd: sum(paidInvoices),
        platformFeeUsd,
        totalPayouts,
        transactionCount: user.transactions.length,
        customerCount: user.customers.length,
      };
    });

    const summary = formattedUsers.reduce(
      (total, user) => ({
        users: total.users + 1,
        availableNgn: total.availableNgn + Number(user.balance),
        pendingUsd: total.pendingUsd + Number(user.pendingUsd),
        paidUsd: total.paidUsd + Number(user.totalPaidUsd),
        platformFeeUsd: total.platformFeeUsd + Number(user.platformFeeUsd),
        payoutsNgn: total.payoutsNgn + Number(user.totalPayouts),
      }),
      {
        users: 0,
        availableNgn: 0,
        pendingUsd: 0,
        paidUsd: 0,
        platformFeeUsd: 0,
        payoutsNgn: 0,
      }
    );

    return Response.json({
      summary,
      users: formattedUsers,
    });
  } catch (error) {
    console.log("GET ADMIN USERS ERROR:", error);

    return Response.json(
      { error: "Failed to load admin users" },
      { status: 500 }
    );
  }
}
