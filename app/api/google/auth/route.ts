import { type NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    // Ensure all required environment variables are set
    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.GOOGLE_CLIENT_SECRET ||
      !process.env.GOOGLE_REDIRECT_URI
    ) {
      console.error("Google OAuth environment variables are not set.");
      return NextResponse.json(
        { error: "Server configuration error for Google OAuth." },
        { status: 500 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const scopes = [
      "https://www.googleapis.com/auth/spreadsheets", 
      "https://www.googleapis.com/auth/drive.readonly", 
    ];

  
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline", 
      scope: scopes,
      prompt: "consent", 
    });

    return NextResponse.json({ authUrl });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown auth error";
    console.error("Failed to generate Google auth URL:", errorMessage);
    return NextResponse.json(
      { error: "Failed to generate authentication URL." },
      { status: 500 }
    );
  }
}
