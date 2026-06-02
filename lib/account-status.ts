export const ACCOUNT_ACTIVE = "Active";
export const ACCOUNT_RESTRICTED = "Restricted";
export const ACCOUNT_TERMINATED = "Terminated";

export const accountStatusOptions = [
  ACCOUNT_ACTIVE,
  ACCOUNT_RESTRICTED,
  ACCOUNT_TERMINATED,
] as const;

export function isRestrictedAccount(status?: string | null) {
  return status === ACCOUNT_RESTRICTED;
}

export function isTerminatedAccount(status?: string | null) {
  return status === ACCOUNT_TERMINATED;
}

export function restrictedAccountMessage(action: "invoice" | "payout") {
  return action === "invoice"
    ? "Your account is restricted. You cannot create invoices at this time."
    : "Your account is restricted. You cannot request payouts at this time.";
}

export const terminatedAccountMessage =
  "Your account has been suspended permanently for violating PathPayX platform rules.";
