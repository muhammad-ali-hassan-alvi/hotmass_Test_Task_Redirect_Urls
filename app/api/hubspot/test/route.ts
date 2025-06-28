import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("=== HubSpot Test Route Called ===");

  try {
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid token is required" },
        { status: 400 }
      );
    }

    console.log("Testing HubSpot token...");


    const endpoints = [
      {
        name: "CMS Pages",
        url: "https://api.hubapi.com/cms/v3/pages?limit=1",
      },
      {
        name: "Website Pages",
        url: "https://api.hubapi.com/content/api/v2/pages?limit=1",
      },
      {
        name: "Account Info",
        url: "https://api.hubapi.com/account-info/v3/details",
      },
      {
        name: "Contacts",
        url: "https://api.hubapi.com/crm/v3/objects/contacts?limit=1",
      },
    ];

    for (const endpoint of endpoints) {
      console.log(`Testing ${endpoint.name}: ${endpoint.url}`);

      try {
        const response = await fetch(endpoint.url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log(`${endpoint.name} response status:`, response.status);

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${endpoint.name} works!`);
          return NextResponse.json({
            success: true,
            workingEndpoint: endpoint.name,
            data:
              endpoint.name === "Account Info"
                ? data
                : `Found ${data.results?.length || data.total || "some"} items`,
          });
        } else {
          const errorText = await response.text();
          console.log(
            `❌ ${endpoint.name} failed:`,
            response.status,
            errorText.substring(0, 200)
          );
        }
      } catch (fetchError) {
        console.log(`❌ ${endpoint.name} network error:`, fetchError);
      }
    }


    return NextResponse.json(
      {
        success: false,
        error:
          "None of the HubSpot API endpoints are accessible with this token. Please check your token permissions.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("HubSpot test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
