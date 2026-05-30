import { prisma } from "@/lib/prisma";

function isAuthorized(req: Request) {
  const secret = process.env.KYC_WEBHOOK_SECRET;

  if (!secret && process.env.NODE_ENV !== "production") return true;

  return req.headers.get("x-pathpayx-kyc-secret") === secret;
}

function normalizeStatus(status: string) {
  const normalized = status.toLowerCase();

  if (["verified", "approved", "completed", "success"].includes(normalized)) {
    return "Verified";
  }

  if (["rejected", "failed", "declined"].includes(normalized)) {
    return "Rejected";
  }

  return "Pending";
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const providerRef =
      body.reference ||
      body.providerRef ||
      body.metadata?.reference ||
      body.data?.reference;
    const rawStatus =
      body.status ||
      body.event ||
      body.data?.status ||
      body.verification?.status ||
      "pending";

    if (!providerRef) {
      return Response.json(
        { error: "Provider reference is required" },
        { status: 400 }
      );
    }

    const status = normalizeStatus(String(rawStatus));
    const verification = await prisma.kycVerification.update({
      where: {
        providerRef,
      },
      data: {
        status,
        rejectionReason:
          status === "Rejected"
            ? body.reason || body.message || "Verification rejected"
            : null,
        verifiedAt: status === "Verified" ? new Date() : null,
      },
    });

    return Response.json({
      message: "KYC webhook processed",
      verification,
    });
  } catch (error) {
    console.log("KYC WEBHOOK ERROR:", error);

    return Response.json(
      { error: "Failed to process KYC webhook" },
      { status: 500 }
    );
  }
}
