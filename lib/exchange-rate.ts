import { USD_TO_NGN_RATE } from "@/lib/wallet";

type ExchangeRateResult = {
  rate: number;
  source: string;
  isLive: boolean;
};

export async function getUsdToNgnRate(): Promise<ExchangeRateResult> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  if (!apiKey) {
    return {
      rate: USD_TO_NGN_RATE,
      source: "Fallback",
      isLive: false,
    };
  }

  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/pair/USD/NGN`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!res.ok) {
      throw new Error("Exchange rate request failed");
    }

    const data = await res.json();
    const rate = Number(data.conversion_rate);

    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error("Exchange rate response was invalid");
    }

    return {
      rate,
      source: "ExchangeRate-API",
      isLive: true,
    };
  } catch (error) {
    console.log("EXCHANGE RATE ERROR:", error);

    return {
      rate: USD_TO_NGN_RATE,
      source: "Fallback",
      isLive: false,
    };
  }
}
