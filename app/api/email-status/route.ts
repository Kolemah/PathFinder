export async function GET() {
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  return Response.json({
    resendApiKeyConfigured: Boolean(resendApiKey && !resendApiKey.includes("your_key_here")),
    emailFromConfigured: Boolean(emailFrom),
    emailFrom,
    appUrl,
  });
}
