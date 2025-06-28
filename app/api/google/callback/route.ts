import { type NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    const dashboardUrl = new URL("/dashboard", request.url);

    if (errorParam) {
      console.error("Google OAuth callback error:", errorParam);
      dashboardUrl.searchParams.set("error", "google_auth_denied");
      return NextResponse.redirect(dashboardUrl);
    }

    if (!code) {
      console.error("No authorization code provided in Google callback.");
      dashboardUrl.searchParams.set("error", "google_no_code");
      return NextResponse.redirect(dashboardUrl);
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Exchange the authorization code for access and refresh tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      console.error("Failed to retrieve access token from Google.");
      dashboardUrl.searchParams.set("error", "google_no_token");
      return NextResponse.redirect(dashboardUrl);
    }

    // *** FIX: `cookies()` is synchronous, do not use `await` ***
    const cookieStore = cookies();

    // Store the access token in a secure, httpOnly cookie
    cookieStore.set("google_access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: tokens.expiry_date
        ? (tokens.expiry_date - Date.now()) / 1000
        : 3599, // Expires in ~1 hour
      sameSite: "lax",
      path: "/",
    });

    // If a refresh token is provided, store it for long-term access
    if (tokens.refresh_token) {
      cookieStore.set("google_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        sameSite: "lax",
        path: "/",
      });
    }

    console.log("Google OAuth successful, tokens stored in cookies.");
    dashboardUrl.searchParams.set("success", "google_connected");
    return NextResponse.redirect(dashboardUrl);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown callback error";
    console.error("Google OAuth callback failed:", errorMessage);
    const dashboardUrl = new URL("/dashboard", request.url);
    dashboardUrl.searchParams.set("error", "google_callback_failed");
    return NextResponse.redirect(dashboardUrl);
  }
}
