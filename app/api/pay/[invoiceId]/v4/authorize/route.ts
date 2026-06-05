import {
  authorizeFlutterwaveV4Charge,
  getFlutterwaveV4Charge,
} from "@/lib/flutterwave-v4";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const chargeId = String(body.chargeId || "");
  const type = String(body.type || "");

  if (!chargeId) {
    return Response.json({ error: "Charge ID is required" }, { status: 400 });
  }

  try {
    if (type === "pin") {
      const pin = String(body.pin || "");

      if (!pin) {
        return Response.json({ error: "PIN is required" }, { status: 400 });
      }

      const charge = await authorizeFlutterwaveV4Charge({
        chargeId,
        authorization: {
          type: "pin",
          pin,
        },
      });

      return Response.json(charge);
    }

    if (type === "otp") {
      const otp = String(body.otp || "");

      if (!otp) {
        return Response.json({ error: "OTP is required" }, { status: 400 });
      }

      const charge = await authorizeFlutterwaveV4Charge({
        chargeId,
        authorization: {
          type: "otp",
          otp,
        },
      });

      return Response.json(charge);
    }

    if (type === "avs") {
      const charge = await authorizeFlutterwaveV4Charge({
        chargeId,
        authorization: {
          type: "avs",
          city: String(body.city || ""),
          country: String(body.country || ""),
          line1: String(body.line1 || ""),
          postalCode: String(body.postalCode || ""),
          state: String(body.state || ""),
        },
      });

      return Response.json(charge);
    }

    return Response.json(
      { error: "Unsupported authorization type" },
      { status: 400 }
    );
  } catch (error) {
    console.log("AUTHORIZE FLUTTERWAVE V4 CHARGE ERROR:", error);
    const message =
      error instanceof Error ? error.message : "Flutterwave V4 authorization failed";

    if (message.toLowerCase().includes("final status")) {
      try {
        const charge = await getFlutterwaveV4Charge(chargeId);

        return Response.json({
          ...charge,
          message:
            charge.status === "succeeded"
              ? "Payment already completed"
              : "This payment attempt is already closed. Please start a new payment.",
        });
      } catch (statusError) {
        console.log("GET FINAL FLUTTERWAVE V4 CHARGE ERROR:", statusError);
      }
    }

    return Response.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}
