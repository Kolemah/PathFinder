const FLUTTERWAVE_V4_TOKEN_URL =
  "https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token";

export function getFlutterwaveV4Credentials() {
  return {
    clientId: process.env.FLUTTERWAVE_V4_CLIENT_ID || "",
    clientSecret: process.env.FLUTTERWAVE_V4_CLIENT_SECRET || "",
  };
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
