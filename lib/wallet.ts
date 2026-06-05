export const USD_TO_NGN_RATE = 1393.23;
export const PLATFORM_FEE_RATE = 0.1;
export const PAYMENT_HOLD_DAYS = 3;

export const DEFAULT_INVOICE_CURRENCY = "USD";

export const invoiceCurrencies = [
  { code: "GBP", name: "British Pound Sterling" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "COP", name: "Colombian Peso" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "EUR", name: "Euro" },
  { code: "KES", name: "Kenyan Shilling" },
  { code: "NGN", name: "Nigerian Naira" },
  { code: "ZAR", name: "South African Rand" },
  { code: "USD", name: "United States Dollar" },
] as const;

export type InvoiceCurrency = (typeof invoiceCurrencies)[number]["code"];

export const currencyInputPrefixes: Record<InvoiceCurrency, string> = {
  GBP: "£",
  CAD: "C$",
  COP: "COL$",
  EGP: "E£",
  EUR: "€",
  KES: "KSh",
  NGN: "₦",
  ZAR: "R",
  USD: "$",
};

export function isSupportedInvoiceCurrency(
  currency?: string | null
): currency is InvoiceCurrency {
  return invoiceCurrencies.some((item) => item.code === currency);
}

export function currencyInputPrefix(currency = DEFAULT_INVOICE_CURRENCY) {
  return isSupportedInvoiceCurrency(currency)
    ? currencyInputPrefixes[currency]
    : currencyInputPrefixes[DEFAULT_INVOICE_CURRENCY];
}

export const PAYMENT_STATUS_PENDING_CLEARANCE = "Pending Clearance";
export const PAYMENT_STATUS_PROCESSING = "Processing";
export const PAYMENT_STATUS_RELEASED = "Released";

export function paymentAvailableAt(paidAt: Date) {
  const availableAt = new Date(paidAt);
  availableAt.setDate(availableAt.getDate() + PAYMENT_HOLD_DAYS);
  return availableAt;
}

export function calculateWalletAmounts(
  amount: number,
  exchangeRate = USD_TO_NGN_RATE
) {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
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
  return formatCurrency(amount, "USD");
}

export function formatCurrency(amount: number, currency = DEFAULT_INVOICE_CURRENCY) {
  const safeCurrency = isSupportedInvoiceCurrency(currency)
    ? currency
    : DEFAULT_INVOICE_CURRENCY;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: safeCurrency,
    maximumFractionDigits: 2,
  }).format(amount);
}
