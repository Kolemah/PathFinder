type BaseEmailProps = {
  name?: string;
  preview?: string;
};

type LinkEmailProps = BaseEmailProps & {
  actionUrl: string;
};

type InvoicePaidProps = BaseEmailProps & {
  clientName: string;
  amount: string;
  invoiceUrl: string;
  releaseDate?: string;
};

type PayoutRequestedProps = BaseEmailProps & {
  amount: string;
  payoutStatus?: string;
};

type KycStatusProps = BaseEmailProps & {
  status: "approved" | "rejected";
  reason?: string;
  kycUrl: string;
};

const brand = {
  green: "#0f766e",
  teal: "#14b8a6",
  navy: "#102033",
  muted: "#607089",
  border: "#dbe4ee",
  background: "#f6f9fc",
  danger: "#dc2626",
};

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://www.pathpayx.com";
}

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function layout({
  title,
  preview,
  children,
}: {
  title: string;
  preview?: string;
  children: string;
}) {
  return `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:${brand.background};font-family:Arial,sans-serif;color:${brand.navy};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      ${escapeHtml(preview || title)}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${brand.background};padding:28px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid ${brand.border};border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 16px;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding-right:12px;vertical-align:middle;">
                      <img src="${escapeHtml(appUrl())}/pathpayx-icon.png" width="42" height="42" alt="PathPayX" style="display:block;border-radius:10px;" />
                    </td>
                    <td style="vertical-align:middle;">
                      <div style="font-size:24px;font-weight:900;color:${brand.green};letter-spacing:0;">
                        PathPayX
                      </div>
                    </td>
                  </tr>
                </table>
                <div style="margin-top:6px;color:${brand.muted};font-size:13px;">
                  Invoice globally. Receive payments worldwide. Withdraw in naira.
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 30px;">
                ${children}
              </td>
            </tr>
            <tr>
              <td style="background:#f8fafc;border-top:1px solid ${brand.border};padding:20px 28px;color:${brand.muted};font-size:12px;line-height:1.6;">
                You are receiving this email because you use PathPayX.
                If you did not request this, you can safely ignore it.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function paragraph(text: string) {
  return `<p style="margin:0 0 16px;color:${brand.muted};font-size:16px;line-height:1.65;">${text}</p>`;
}

function button(label: string, href: string, color = brand.green) {
  return `
    <a href="${escapeHtml(href)}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;font-weight:800;padding:14px 22px;border-radius:8px;margin:8px 0 18px;">
      ${escapeHtml(label)}
    </a>
  `;
}

function backupLink(href: string) {
  return `
    <p style="margin:0 0 8px;color:${brand.muted};font-size:13px;line-height:1.6;">
      If the button does not work, copy and paste this link into your browser:
    </p>
    <p style="margin:0;color:#2563eb;font-size:13px;line-height:1.6;word-break:break-all;">
      ${escapeHtml(href)}
    </p>
  `;
}

function greeting(name?: string) {
  return `Hi ${escapeHtml(name || "there")},`;
}

function heading(text: string) {
  return `<h1 style="margin:0 0 14px;color:${brand.navy};font-size:28px;line-height:1.2;">${escapeHtml(text)}</h1>`;
}

export function welcomeEmailTemplate({ name, actionUrl, preview }: LinkEmailProps) {
  return layout({
    title: "Welcome to PathPayX",
    preview: preview || "Welcome to PathPayX. Verify your email to secure your account.",
    children: `
      ${heading("Welcome to PathPayX")}
      ${paragraph(greeting(name))}
      ${paragraph("You can now create invoices, receive payments from clients worldwide, hold funds during buyer confirmation, and withdraw cleared earnings in naira.")}
      ${paragraph("Please verify your email address so we can protect your account and send important payment updates.")}
      ${button("Verify email", actionUrl)}
      ${backupLink(actionUrl)}
    `,
  });
}

export function verifyEmailTemplate({ name, actionUrl, preview }: LinkEmailProps) {
  return layout({
    title: "Verify your PathPayX email",
    preview: preview || "Confirm your email address to finish securing your PathPayX account.",
    children: `
      ${heading("Verify your email")}
      ${paragraph(greeting(name))}
      ${paragraph("Confirm this email address so your PathPayX account can receive important security, invoice, wallet, and payout updates.")}
      ${button("Verify email", actionUrl)}
      ${backupLink(actionUrl)}
    `,
  });
}

export function passwordResetTemplate({ name, actionUrl, preview }: LinkEmailProps) {
  return layout({
    title: "Reset your PathPayX password",
    preview: preview || "Use this secure link to reset your PathPayX password.",
    children: `
      ${heading("Reset your password")}
      ${paragraph(greeting(name))}
      ${paragraph("We received a request to reset your PathPayX password. Use the button below to choose a new password.")}
      ${button("Reset password", actionUrl)}
      ${paragraph("This link should expire soon for your security. If you did not request a password reset, ignore this email.")}
      ${backupLink(actionUrl)}
    `,
  });
}

export function invoicePaidTemplate({
  name,
  clientName,
  amount,
  invoiceUrl,
  releaseDate,
  preview,
}: InvoicePaidProps) {
  return layout({
    title: "Invoice payment received",
    preview: preview || `${clientName} paid ${amount}. Funds are now pending clearance.`,
    children: `
      ${heading("Invoice payment received")}
      ${paragraph(greeting(name))}
      ${paragraph(`${escapeHtml(clientName)} has paid an invoice for <strong style="color:${brand.navy};">${escapeHtml(amount)}</strong>. The payment is now in pending balance for buyer confirmation.`)}
      ${paragraph(releaseDate ? `Expected release date: <strong style="color:${brand.navy};">${escapeHtml(releaseDate)}</strong>.` : "Once the 3-day confirmation window is complete, the net amount will be converted and added to your naira balance.")}
      ${button("View invoice", invoiceUrl)}
      ${backupLink(invoiceUrl)}
    `,
  });
}

export function payoutRequestedTemplate({
  name,
  amount,
  payoutStatus = "Requested",
  preview,
}: PayoutRequestedProps) {
  return layout({
    title: "Payout request received",
    preview: preview || `Your payout request for ${amount} has been received.`,
    children: `
      ${heading("Payout request received")}
      ${paragraph(greeting(name))}
      ${paragraph(`Your payout request for <strong style="color:${brand.navy};">${escapeHtml(amount)}</strong> has been received.`)}
      ${paragraph(`Current status: <strong style="color:${brand.green};">${escapeHtml(payoutStatus)}</strong>. We will notify you when the payout is processed.`)}
    `,
  });
}

export function kycStatusTemplate({
  name,
  status,
  reason,
  kycUrl,
  preview,
}: KycStatusProps) {
  const approved = status === "approved";

  return layout({
    title: approved ? "KYC approved" : "KYC update needed",
    preview:
      preview ||
      (approved
        ? "Your PathPayX KYC has been approved."
        : "Your PathPayX KYC needs attention."),
    children: `
      ${heading(approved ? "KYC approved" : "KYC update needed")}
      ${paragraph(greeting(name))}
      ${paragraph(
        approved
          ? "Your seller verification has been approved. You can now request payouts when your available balance meets the minimum withdrawal amount."
          : `Your seller verification could not be approved yet.${reason ? ` Reason: <strong style="color:${brand.danger};">${escapeHtml(reason)}</strong>.` : ""}`
      )}
      ${button(approved ? "Go to wallet" : "Review KYC", kycUrl, approved ? brand.green : brand.danger)}
      ${backupLink(kycUrl)}
    `,
  });
}
