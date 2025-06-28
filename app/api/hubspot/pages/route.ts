import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("=== HubSpot Pages Route Called ===");

  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    console.log("Fetching pages from HubSpot...");

    
    const endpoints = [
      {
        name: "CMS Pages v3",
        url: "https://api.hubapi.com/cms/v3/pages?limit=50&state=PUBLISHED",
      },
      {
        name: "Website Pages v2",
        url: "https://api.hubapi.com/content/api/v2/pages?limit=50&state=PUBLISHED",
      },
      {
        name: "CMS Pages v3 (all states)",
        url: "https://api.hubapi.com/cms/v3/pages?limit=50",
      },
    ];

    let lastError = null;

    for (const endpoint of endpoints) {
      console.log(`Trying ${endpoint.name}: ${endpoint.url}`);

      try {
        const response = await fetch(endpoint.url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log(`${endpoint.name} response status:`, response.status);

        if (response.ok) {
          const data = await response.json();
          console.log(
            `✅ ${endpoint.name} worked! Pages found:`,
            data.results?.length || 0
          );


          const pages = (data.results || []).map((page: any) => ({
            id: page.id || page.page_id,
            name: page.name || page.html_title || page.page_title || "Untitled",
            slug: page.slug || page.path || "",
            url: page.url || page.absolute_url || "",
            language:
              page.language || page.translated_from_id ? "translated" : "en",
            domain: extractDomain(page.url || page.absolute_url || ""),
            updatedAt:
              page.updatedAt || page.updated || new Date().toISOString(),
          }));

          return NextResponse.json({
            success: true,
            pages,
            endpoint: endpoint.name,
          });
        } else {
          const errorData = await response.text();
          console.log(
            `❌ ${endpoint.name} failed:`,
            response.status,
            errorData.substring(0, 200)
          );
          lastError = errorData;
        }
      } catch (fetchError) {
        console.log(`❌ ${endpoint.name} network error:`, fetchError);
        lastError = fetchError;
      }
    }


    console.error("All HubSpot page endpoints failed");

    let errorMessage = "Failed to fetch pages from HubSpot";
    if (lastError) {
      try {
        const parsedError =
          typeof lastError === "string" ? JSON.parse(lastError) : lastError;
        errorMessage = parsedError.message || parsedError.error || errorMessage;
      } catch {
        errorMessage = typeof lastError === "string" ? lastError : errorMessage;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("HubSpot pages route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch pages from HubSpot",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function extractDomain(url: string): string {
  try {
    if (!url) return "unknown";
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    return urlObj.hostname;
  } catch {
    return "unknown";
  }
}
