import { getFlutterwaveV4AccessToken } from "@/lib/flutterwave-v4";

export async function GET() {
  try {
    const token = await getFlutterwaveV4AccessToken();

    return Response.json({
      ok: true,
      message: "Flutterwave V4 credentials are working",
      tokenType: token.tokenType,
      expiresIn: token.expiresIn,
    });
  } catch (error) {
    console.log("FLUTTERWAVE V4 STATUS ERROR:", error);

    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Flutterwave V4 credentials could not be verified",
      },
      { status: 500 }
    );
  }
}
