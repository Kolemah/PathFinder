import { releaseAllMaturedPayments } from "@/lib/wallet-release";

function isAuthorized(req: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret && process.env.NODE_ENV !== "production") {
    return true;
  }

  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const result = await releaseAllMaturedPayments();

  return Response.json({
    message: "Matured payments release completed",
    ...result,
  });
}
