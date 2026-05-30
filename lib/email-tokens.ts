import crypto from "crypto";

export function createEmailToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function tokenExpiry(hours: number) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + hours);
  return expiresAt;
}
