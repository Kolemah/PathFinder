export type PolicySection = {
  title: string;
  body: string[];
};

export type Policy = {
  slug: string;
  title: string;
  summary: string;
  updated: string;
  sections: PolicySection[];
};

export const policies: Policy[] = [
  {
    slug: "terms",
    title: "Terms of Service",
    summary:
      "Rules for using PathPayX to create invoices, receive client payments, manage wallets, and request payouts.",
    updated: "June 6, 2026",
    sections: [
      {
        title: "About PathPayX",
        body: [
          "PathPayX helps freelancers and service providers create invoices, share payment links, track client payments, and manage payout records from one dashboard.",
          "By creating an account or using PathPayX, you agree to these terms and any additional rules shown inside the app.",
        ],
      },
      {
        title: "Account responsibilities",
        body: [
          "You must provide accurate account information and keep your login details safe. You are responsible for activity that happens under your account.",
          "You may not use PathPayX for fraud, illegal activity, fake invoices, unauthorized collections, prohibited goods or services, or any activity that violates payment-provider rules.",
        ],
      },
      {
        title: "Invoices and payments",
        body: [
          "Sellers are responsible for the accuracy of invoice details, including client information, amount, currency, description, and due date.",
          "Payments are processed by third-party payment providers. PathPayX does not store buyer card details and does not control bank, card issuer, or payment-provider approval decisions.",
        ],
      },
      {
        title: "Fees and payout holds",
        body: [
          "PathPayX may charge a platform fee on successful payments. The applicable fee is shown or applied inside the platform before funds become available for payout.",
          "Paid invoices may stay pending for a buyer confirmation period before funds become available. This helps protect both buyers and sellers from disputes and mistaken payments.",
        ],
      },
      {
        title: "Restrictions and termination",
        body: [
          "PathPayX may restrict an account when we detect risk, incomplete verification, suspicious activity, payment disputes, or policy violations. A restricted account may still be able to log in but may be blocked from creating invoices or requesting payouts.",
          "PathPayX may permanently terminate an account for fraud, abuse, repeated policy violations, false KYC information, chargeback abuse, or activity that puts users or the platform at risk.",
        ],
      },
      {
        title: "Changes to these terms",
        body: [
          "We may update these terms as the product, providers, laws, or platform rules change. The updated date on this page shows when the latest version was published.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    summary:
      "How PathPayX collects, uses, stores, and protects account, invoice, payment, and verification information.",
    updated: "June 6, 2026",
    sections: [
      {
        title: "Information we collect",
        body: [
          "We collect information you provide when registering, creating invoices, updating your profile, completing KYC, requesting payouts, or contacting support.",
          "This may include name, email, role, profile photo, invoice details, client details, transaction records, payout records, verification status, and technical information such as device or browser data.",
        ],
      },
      {
        title: "How we use information",
        body: [
          "We use your information to operate PathPayX, create payment links, record transactions, manage payout eligibility, send account emails, prevent fraud, support KYC checks, and improve the product.",
          "We may send service emails such as verification emails, password reset emails, invoice payment updates, payout updates, KYC updates, and account restriction notices.",
        ],
      },
      {
        title: "Payment and KYC partners",
        body: [
          "Payments and identity checks may be handled by third-party providers. These providers process information according to their own terms, privacy policies, compliance rules, and security standards.",
          "PathPayX does not store buyer card details. Card details are handled by the payment provider during checkout.",
        ],
      },
      {
        title: "Data protection",
        body: [
          "We use reasonable technical and organizational measures to protect user data. No system is completely risk-free, so users should also protect their login details and devices.",
          "Access to sensitive account, transaction, and verification data is limited to the app features and admin workflows needed to operate the platform.",
        ],
      },
      {
        title: "Your choices",
        body: [
          "You can update certain profile information from your account settings. You may also contact PathPayX support to request help with account, data, or privacy questions.",
        ],
      },
    ],
  },
  {
    slug: "refunds",
    title: "Refund and Dispute Policy",
    summary:
      "How buyer complaints, refunds, disputes, payment holds, and seller payout releases are handled.",
    updated: "June 6, 2026",
    sections: [
      {
        title: "Service payments",
        body: [
          "PathPayX is designed for freelancers and service providers. Buyers should only pay invoices for work, services, or agreements they understand and accept.",
          "The seller is responsible for delivering the agreed service or project. PathPayX provides records, payment tracking, and payout controls, but does not automatically judge project quality.",
        ],
      },
      {
        title: "Buyer confirmation period",
        body: [
          "Successful payments may be held for a confirmation period before the seller can withdraw. During this time, the buyer may contact the seller or support if there is a serious payment or delivery issue.",
          "If no issue is raised during the hold period, funds may become available for seller payout according to the platform rules.",
        ],
      },
      {
        title: "Refund requests",
        body: [
          "Refund requests are reviewed based on payment status, seller delivery, buyer complaint, payment-provider rules, and available transaction records.",
          "Refunds may be unavailable or delayed when the payment provider, bank, card issuer, or payout status prevents reversal.",
        ],
      },
      {
        title: "Chargebacks and disputes",
        body: [
          "If a buyer opens a bank or card dispute, the payment provider may place funds on hold, debit the transaction, request evidence, or apply dispute fees.",
          "Sellers must provide accurate delivery records, communication, receipts, and project evidence when a dispute is reviewed.",
        ],
      },
      {
        title: "Platform fee",
        body: [
          "Platform fees may apply to successful payments. In some cases, fees may not be refundable if payment providers or processing partners have already charged non-refundable costs.",
        ],
      },
    ],
  },
  {
    slug: "kyc-aml",
    title: "KYC and AML Policy",
    summary:
      "Identity verification, risk review, restricted accounts, prohibited activity, and anti-money-laundering controls.",
    updated: "June 6, 2026",
    sections: [
      {
        title: "Why verification is required",
        body: [
          "PathPayX may require sellers to complete identity verification before requesting payouts. This helps reduce fraud, impersonation, illegal activity, and payment risk.",
          "A seller may still be able to use some app features before verification, but payout access can remain locked until KYC is approved.",
        ],
      },
      {
        title: "Verification information",
        body: [
          "Verification may include identity documents, government identification numbers, liveness checks, business information, address information, or other information required by PathPayX or its verification partners.",
          "Providing false, stolen, expired, mismatched, or misleading information may lead to account restriction or permanent termination.",
        ],
      },
      {
        title: "Prohibited activity",
        body: [
          "PathPayX must not be used for money laundering, terrorist financing, scams, fake invoices, stolen payment methods, illegal services, high-risk prohibited goods, or attempts to hide the true source or purpose of funds.",
          "We may review, delay, reject, hold, or report activity when required by law, provider rules, or risk controls.",
        ],
      },
      {
        title: "Account review",
        body: [
          "Accounts may be reviewed when there are unusual payments, repeated failed payments, suspicious invoice patterns, chargebacks, buyer complaints, or inconsistent KYC information.",
          "During review, PathPayX may restrict invoice creation, disable payout requests, request more information, or terminate access when necessary.",
        ],
      },
      {
        title: "Ongoing monitoring",
        body: [
          "KYC approval does not guarantee permanent access. PathPayX may continue monitoring account activity and may request updated information as the platform grows or regulations change.",
        ],
      },
    ],
  },
];

export function getPolicy(slug: string) {
  return policies.find((policy) => policy.slug === slug);
}
