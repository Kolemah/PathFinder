export const passwordPolicyMessage =
  "Password must be more than 8 characters and include uppercase, lowercase, number, and special character.";

export function validatePasswordPolicy(password: string) {
  return (
    password.length > 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>_\-\\[\];'/`~+=]/.test(password)
  );
}
