export const passwordPolicyMessage =
  "Password must be more than 8 characters and include uppercase, lowercase, number, and special character.";

export function getPasswordChecks(password: string) {
  return {
    length: password.length > 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>_\-\\[\];'/`~+=]/.test(password),
  };
}

export function validatePasswordPolicy(password: string) {
  const checks = getPasswordChecks(password);

  return (
    checks.length &&
    checks.lower &&
    checks.upper &&
    checks.number &&
    checks.special
  );
}
