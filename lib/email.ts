type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function sendEmail({ to, subject, html }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "PathPayX <onboarding@resend.dev>";

  if (!apiKey) {
    console.log("EMAIL SKIPPED: RESEND_API_KEY is not configured");
    return {
      skipped: true,
    };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.log("RESEND EMAIL ERROR:", data);
    throw new Error(data?.message || "Failed to send email");
  }

  return data;
}
