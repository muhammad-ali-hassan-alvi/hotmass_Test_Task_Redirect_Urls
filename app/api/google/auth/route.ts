// import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     console.log("Auth route hit!");
//     console.log("Environment variables:");
//     console.log(
//       "GOOGLE_CLIENT_ID:",
//       process.env.GOOGLE_CLIENT_ID ? "Set" : "Not set"
//     );
//     console.log(
//       "GOOGLE_CLIENT_SECRET:",
//       process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Not set"
//     );
//     console.log("GOOGLE_REDIRECT_URI:", process.env.GOOGLE_REDIRECT_URI);

//     if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
//       return NextResponse.json(
//         { error: "Google OAuth not configured" },
//         { status: 500 }
//       );
//     }

//     // Simple auth URL for testing
//     const authUrl =
//       `https://accounts.google.com/o/oauth2/v2/auth?` +
//       `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
//       `redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI!)}&` +
//       `response_type=code&` +
//       `scope=${encodeURIComponent(
//         "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly"
//       )}&` +
//       `access_type=offline&` +
//       `prompt=consent`;

//     console.log("Generated auth URL:", authUrl);
//     return NextResponse.json({ authUrl });
//   } catch (error) {
//     console.error("Auth route error:", error);
//     return NextResponse.json(
//       { error: "Failed to generate auth URL" },
//       { status: 500 }
//     );
//   }
// }

// app/api/auth/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

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
      "https://www.googleapis.com/auth/spreadsheets", // Full access to spreadsheets
      "https://www.googleapis.com/auth/drive.readonly", // To view and list files in Drive
    ];

    // Generate the authentication URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline", // Required to get a refresh_token
      scope: scopes,
      prompt: "consent", // Ensures the user is prompted for consent every time, good for getting a refresh token
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
