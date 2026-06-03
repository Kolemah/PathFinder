import { USD_TO_NGN_RATE } from "@/lib/wallet";

type ExchangeRateResult = {
  rate: number;
  source: string;
  isLive: boolean;
  lastUpdated?: string;
};

export async function getUsdToNgnRate(): Promise<ExchangeRateResult> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  try {
    if (apiKey) {
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
        lastUpdated: data.time_last_update_utc,
      };
    }

    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: {
        revalidate: 3600,
      },
    });

    if (!res.ok) {
      throw new Error("Open exchange rate request failed");
    }

    const data = await res.json();
    const rate = Number(data.rates?.NGN);

    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error("Open exchange rate response was invalid");
    }

    return {
      rate,
      source: "ExchangeRate-API Open",
      isLive: true,
      lastUpdated: data.time_last_update_utc,
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
