const FLUTTERWAVE_V4_TOKEN_URL =
  "https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token";
const FLUTTERWAVE_V4_LIVE_URL = "https://f4bexperience.flutterwave.com";
const FLUTTERWAVE_V4_SANDBOX_URL = "https://developersandbox-api.flutterwave.com";

type FlutterwaveV4CardInput = {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName?: string;
  phoneNumber?: string;
};

type FlutterwaveV4AuthorizationInput =
  | {
      type: "pin";
      pin: string;
    }
  | {
      type: "otp";
      otp: string;
    }
  | {
      type: "avs";
      city: string;
      country: string;
      line1: string;
      postalCode: string;
      state: string;
    };

type FlutterwaveV4ChargeResponse = {
  status?: string;
  message?: string;
  data?: {
    id?: string;
    status?: string;
    reference?: string;
    amount?: number;
    currency?: string;
    next_action?: {
      type?: string;
      authorization?: {
        type?: string;
      };
      redirect_url?: {
        url?: string;
      };
      payment_instruction?: {
        note?: string;
      };
    };
  };
  error?: {
    message?: string;
  };
};

type FlutterwaveV4Invoice = {
  id: string;
  description: string;
  amount: number;
  currency: string;
  customer: {
    name: string;
    email: string;
    country: string;
    state: string;
    address: string;
    zipcode: string;
  };
};

export function getFlutterwaveV4Credentials() {
  return {
    clientId: process.env.FLUTTERWAVE_V4_CLIENT_ID || "",
    clientSecret: process.env.FLUTTERWAVE_V4_CLIENT_SECRET || "",
    encryptionKey: process.env.FLUTTERWAVE_V4_ENCRYPTION_KEY || "",
  };
}

export function getFlutterwaveV4BaseUrl() {
  return process.env.FLUTTERWAVE_V4_ENV === "sandbox"
    ? FLUTTERWAVE_V4_SANDBOX_URL
    : FLUTTERWAVE_V4_LIVE_URL;
}

export function flutterwaveV4Reference(invoiceId: string) {
  return `PATHPAYX-V4-${invoiceId}-${Date.now()}`;
}

export async function getFlutterwaveV4AccessToken() {
  const { clientId, clientSecret } = getFlutterwaveV4Credentials();

  if (!clientId || !clientSecret) {
    throw new Error(
      "FLUTTERWAVE_V4_CLIENT_ID and FLUTTERWAVE_V4_CLIENT_SECRET are required"
    );
  }

  const res = await fetch(FLUTTERWAVE_V4_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });

  const data = await res.json().catch(() => ({
    error_description: "Flutterwave returned an invalid V4 auth response",
  }));

  if (!res.ok || !data.access_token) {
    throw new Error(
      data.error_description || data.error || "Flutterwave V4 auth failed"
    );
  }

  return {
    accessToken: String(data.access_token),
    expiresIn: Number(data.expires_in || 0),
    tokenType: String(data.token_type || "Bearer"),
  };
}

function randomId() {
  return crypto.randomUUID();
}

function randomNonce() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  return Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map((value) => chars[value % chars.length])
    .join("");
}

async function encryptAES(data: string, nonce: string) {
  const { encryptionKey } = getFlutterwaveV4Credentials();

  if (!encryptionKey) {
    throw new Error("FLUTTERWAVE_V4_ENCRYPTION_KEY is required for V4 card payments");
  }

  const keyBytes = Uint8Array.from(Buffer.from(encryptionKey, "base64"));
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: new TextEncoder().encode(nonce),
    },
    key,
    new TextEncoder().encode(data)
  );

  return Buffer.from(encrypted).toString("base64");
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  return {
    first: parts[0] || "Customer",
    last: parts.slice(1).join(" ") || "Client",
  };
}

function normalizeChargeResponse(data: FlutterwaveV4ChargeResponse) {
  const nextAction = data.data?.next_action;
  const redirectUrl = nextAction?.redirect_url?.url;
  const authorizationType = nextAction?.authorization?.type;
  const actionType = nextAction?.type;

  if (data.data?.status === "succeeded") {
    return {
      status: "succeeded",
      chargeId: data.data.id,
      reference: data.data.reference,
    };
  }

  if (redirectUrl) {
    return {
      status: "redirect",
      chargeId: data.data?.id,
      reference: data.data?.reference,
      redirectUrl,
    };
  }

  if (authorizationType || actionType === "requires_pin") {
    return {
      status: "requires_authorization",
      authorizationType: authorizationType || "pin",
      chargeId: data.data?.id,
      reference: data.data?.reference,
    };
  }

  if (actionType === "requires_otp") {
    return {
      status: "requires_authorization",
      authorizationType: "otp",
      chargeId: data.data?.id,
      reference: data.data?.reference,
    };
  }

  if (actionType === "requires_additional_fields") {
    return {
      status: "requires_authorization",
      authorizationType: "avs",
      chargeId: data.data?.id,
      reference: data.data?.reference,
    };
  }

  if (nextAction?.payment_instruction?.note) {
    return {
      status: "payment_instruction",
      chargeId: data.data?.id,
      reference: data.data?.reference,
      instruction: nextAction.payment_instruction.note,
    };
  }

  return {
    status: data.data?.status || data.status || "unknown",
    chargeId: data.data?.id,
    reference: data.data?.reference,
    message: data.message,
  };
}

async function flutterwaveV4Fetch(path: string, init: RequestInit) {
  const token = await getFlutterwaveV4AccessToken();

  const res = await fetch(`${getFlutterwaveV4BaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      "Content-Type": "application/json",
      "X-Trace-Id": randomId(),
      "X-Idempotency-Key": randomId(),
      ...(init.headers || {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(25000),
  });
  const data = (await res.json().catch(() => ({
    message: "Flutterwave returned an invalid V4 response",
  }))) as FlutterwaveV4ChargeResponse;

  if (!res.ok) {
    throw new Error(data.error?.message || data.message || "Flutterwave V4 request failed");
  }

  return data;
}

export async function createFlutterwaveV4CardCharge({
  invoice,
  card,
}: {
  invoice: FlutterwaveV4Invoice;
  card: FlutterwaveV4CardInput;
}) {
  const nonce = randomNonce();
  const reference = flutterwaveV4Reference(invoice.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const customerName = splitName(invoice.customer.name);

  const data = await flutterwaveV4Fetch("/orchestration/direct-charges", {
    method: "POST",
    body: JSON.stringify({
      amount: Number(invoice.amount.toFixed(2)),
      currency: invoice.currency,
      reference,
      redirect_url: `${appUrl}/api/pay/${invoice.id}/v4/verify`,
      payment_method: {
        type: "card",
        card: {
          nonce,
          encrypted_card_number: await encryptAES(card.cardNumber, nonce),
          encrypted_expiry_month: await encryptAES(card.expiryMonth, nonce),
          encrypted_expiry_year: await encryptAES(card.expiryYear, nonce),
          encrypted_cvv: await encryptAES(card.cvv, nonce),
          card_holder_name: card.cardholderName || invoice.customer.name,
        },
      },
      customer: {
        email: invoice.customer.email,
        name: customerName,
        address: {
          country: invoice.customer.country,
          city: invoice.customer.state,
          state: invoice.customer.state,
          postal_code: invoice.customer.zipcode,
          line1: invoice.customer.address,
        },
        ...(card.phoneNumber
          ? {
              phone: {
                country_code: "234",
                number: card.phoneNumber.replace(/\D/g, ""),
              },
            }
          : {}),
      },
      meta: {
        invoiceId: invoice.id,
      },
    }),
  });

  return {
    ...normalizeChargeResponse(data),
    reference,
  };
}

export async function authorizeFlutterwaveV4Charge({
  chargeId,
  authorization,
}: {
  chargeId: string;
  authorization: FlutterwaveV4AuthorizationInput;
}) {
  let body: unknown;

  if (authorization.type === "pin") {
    const nonce = randomNonce();

    body = {
      authorization: {
        type: "pin",
        pin: {
          nonce,
          encrypted_pin: await encryptAES(authorization.pin, nonce),
        },
      },
    };
  }

  if (authorization.type === "otp") {
    body = {
      authorization: {
        type: "otp",
        otp: {
          code: authorization.otp,
        },
      },
    };
  }

  if (authorization.type === "avs") {
    body = {
      authorization: {
        type: "avs",
        avs: {
          address: {
            city: authorization.city,
            country: authorization.country,
            line1: authorization.line1,
            postal_code: authorization.postalCode,
            state: authorization.state,
          },
        },
      },
    };
  }

  const data = await flutterwaveV4Fetch(`/charges/${chargeId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  return normalizeChargeResponse(data);
}

export async function getFlutterwaveV4ChargeByReference(reference: string) {
  const token = await getFlutterwaveV4AccessToken();
  const url = new URL(`${getFlutterwaveV4BaseUrl()}/charges`);
  url.searchParams.set("reference", reference);
  url.searchParams.set("size", "1");

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      "X-Trace-Id": randomId(),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json().catch(() => ({
    message: "Flutterwave returned an invalid V4 verification response",
  }));

  if (!res.ok) {
    throw new Error(data.error?.message || data.message || "Flutterwave V4 verification failed");
  }

  const charge = Array.isArray(data.data)
    ? data.data[0]
    : Array.isArray(data.data?.content)
      ? data.data.content[0]
      : data.data;

  if (!charge) {
    throw new Error("Flutterwave V4 charge was not found");
  }

  return charge;
}
