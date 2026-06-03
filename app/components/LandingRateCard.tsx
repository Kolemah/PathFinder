"use client";

import { useEffect, useState } from "react";
import { USD_TO_NGN_RATE, formatNaira } from "@/lib/wallet";

export default function LandingRateCard() {
  const [rate, setRate] = useState(USD_TO_NGN_RATE);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadRate() {
      try {
        const res = await fetch("/api/exchange-rate");
        const data = await res.json();

        if (!active || !res.ok) return;

        setRate(Number(data.rate || USD_TO_NGN_RATE));
        setLive(Boolean(data.isLive));
      } catch (error) {
        console.log("LOAD LANDING RATE ERROR:", error);
      }
    }

    loadRate();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="landing-rate-card">
      <span>{live ? "Live rate" : "Today's rate"}</span>
      <strong>$1 → {formatNaira(rate)}</strong>
    </div>
  );
}
