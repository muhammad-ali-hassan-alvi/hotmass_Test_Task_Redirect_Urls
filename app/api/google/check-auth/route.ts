import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("google_access_token");

    console.log("Check auth - Token exists:", !!accessToken?.value);

    return NextResponse.json({
      connected: !!accessToken?.value,
    });
  } catch (error) {
    console.error("Check auth error:", error);
    return NextResponse.json({ connected: false });
  }
}
