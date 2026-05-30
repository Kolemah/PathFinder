export const USD_TO_NGN_RATE = 1393.23;
export const PLATFORM_FEE_RATE = 0.1;
export const PAYMENT_HOLD_DAYS = 3;

export const PAYMENT_STATUS_PENDING_CLEARANCE = "Pending Clearance";
export const PAYMENT_STATUS_RELEASED = "Released";

export function paymentAvailableAt(paidAt: Date) {
  const availableAt = new Date(paidAt);
  availableAt.setDate(availableAt.getDate() + PAYMENT_HOLD_DAYS);
  return availableAt;
}

export function calculateWalletAmounts(
  amountUsd: number,
  exchangeRate = USD_TO_NGN_RATE
) {
  const safeAmount = Number.isFinite(amountUsd) ? amountUsd : 0;
  const safeExchangeRate =
    Number.isFinite(exchangeRate) && exchangeRate > 0
      ? exchangeRate
      : USD_TO_NGN_RATE;
  const platformFeeUsd = safeAmount * PLATFORM_FEE_RATE;
  const netAmountUsd = safeAmount - platformFeeUsd;
  const netAmountNgn = netAmountUsd * safeExchangeRate;

  return {
    platformFeeRate: PLATFORM_FEE_RATE,
    platformFeeUsd,
    netAmountUsd,
    netAmountNgn,
    exchangeRate: safeExchangeRate,
  };
}

export function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}
