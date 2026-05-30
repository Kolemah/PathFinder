import { prisma } from "@/lib/prisma";
import { getUsdToNgnRate } from "@/lib/exchange-rate";
import {
  PAYMENT_STATUS_PENDING_CLEARANCE,
  PAYMENT_STATUS_RELEASED,
  calculateWalletAmounts,
} from "@/lib/wallet";

export async function releaseMaturedPayments(userId: string) {
  const now = new Date();

  const invoices = await prisma.invoice.findMany({
    where: {
      userId,
      status: "Paid",
      paymentStatus: PAYMENT_STATUS_PENDING_CLEARANCE,
      fundsReleasedAt: null,
      paymentAvailableAt: {
        lte: now,
      },
    },
  });

  if (invoices.length === 0) return { releasedCount: 0, releasedAmountNgn: 0 };

  const { rate } = await getUsdToNgnRate();
  let releasedAmountNgn = 0;

  await prisma.$transaction(async (tx) => {
    for (const invoice of invoices) {
      const walletAmounts = calculateWalletAmounts(invoice.amount, rate);
      const { netAmountNgn } = walletAmounts;

      const releasedInvoice = await tx.invoice.updateMany({
        where: {
          id: invoice.id,
          paymentStatus: PAYMENT_STATUS_PENDING_CLEARANCE,
          fundsReleasedAt: null,
        },
        data: {
          paymentStatus: PAYMENT_STATUS_RELEASED,
          fundsReleasedAt: now,
          ...walletAmounts,
        },
      });

      if (releasedInvoice.count === 0) continue;

      releasedAmountNgn += netAmountNgn;

      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          balance: {
            increment: netAmountNgn,
          },
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: "Payment Released to Naira Wallet",
          amount: netAmountNgn,
        },
      });
    }
  });

  return {
    releasedCount: invoices.length,
    releasedAmountNgn,
  };
}

export async function releaseAllMaturedPayments() {
  const now = new Date();

  const maturedInvoices = await prisma.invoice.findMany({
    where: {
      status: "Paid",
      paymentStatus: PAYMENT_STATUS_PENDING_CLEARANCE,
      fundsReleasedAt: null,
      paymentAvailableAt: {
        lte: now,
      },
    },
    select: {
      userId: true,
    },
    distinct: ["userId"],
  });

  if (maturedInvoices.length === 0) {
    return {
      releasedUsers: 0,
      releasedCount: 0,
      releasedAmountNgn: 0,
    };
  }

  let releasedCount = 0;
  let releasedAmountNgn = 0;

  for (const invoice of maturedInvoices) {
    const result = await releaseMaturedPayments(invoice.userId);
    releasedCount += result.releasedCount;
    releasedAmountNgn += result.releasedAmountNgn;
  }

  return {
    releasedUsers: maturedInvoices.length,
    releasedCount,
    releasedAmountNgn,
  };
}
