import { getUsdToNgnRate } from "@/lib/exchange-rate";

export async function GET() {
  const rate = await getUsdToNgnRate();

  return Response.json(rate);
}
