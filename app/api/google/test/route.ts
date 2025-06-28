import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    console.log(
      "Testing HubSpot token:",
      token ? "Token provided" : "No token"
    );

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    
    const response = await fetch(
      "https://api.hubapi.com/cms/v3/pages?limit=1",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("HubSpot API response status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log(
        "HubSpot test successful, found pages:",
        data.results?.length || 0
      );
      return NextResponse.json({ success: true });
    } else {
      const errorData = await response.json();
      console.error("HubSpot API error:", errorData);
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || "Invalid HubSpot token",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("HubSpot test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test HubSpot connection",
      },
      { status: 500 }
    );
  }
}
