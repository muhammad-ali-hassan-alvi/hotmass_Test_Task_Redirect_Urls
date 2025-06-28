import { type NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";


interface Page {
  name: string;
  language: string;
  slug: string;
  url: string;
  updatedAt: string | number | Date;
}

export async function POST(request: NextRequest) {
  try {
    const { sheetId, tabName, pages, userId, filters } = await request.json();

    console.log("=== Google Sync Debug ===");
    console.log("Sync request data:", {
      sheetId: sheetId?.substring(0, 10) + "...",
      tabName,
      pagesCount: pages?.length,
      userId,
      filters,
    });

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("google_access_token")?.value;

    if (!accessToken) {
      console.log("❌ No access token");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify user is authenticated in Supabase
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("❌ User not authenticated in Supabase:", userError);
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    if (user.id !== userId) {
      console.log("❌ User ID mismatch:", {
        authUserId: user.id,
        requestUserId: userId,
      });
      return NextResponse.json({ error: "User ID mismatch" }, { status: 403 });
    }

    console.log("✅ User authenticated:", user.id);

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    // Check if tab exists, create if not
    try {
      await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
        ranges: [tabName],
      });
      console.log("✅ Tab exists:", tabName);
    } catch {

      console.log("📝 Creating new tab:", tabName);

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: tabName,
                },
              },
            },
          ],
        },
      });
    }


    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: `${tabName}!A:Z`,
    });


    const headers = ["Name", "Language", "Slug", "URL", "Last Updated"];

    const rows = pages.map((page: Page) => [
      page.name,
      page.language,
      page.slug,
      page.url,
      new Date(page.updatedAt).toLocaleDateString(),
    ]);

    const values = [headers, ...rows];


    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${tabName}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });

    console.log("✅ Data written to Google Sheets");

 
    console.log("📝 Inserting sync session record...");

    const syncData = {
      user_id: user.id,
      sheet_id: sheetId,
      tab_name: tabName,
      content_type: "pages",
      filters_used: filters || null,
      rows_synced: pages.length,
    };

    console.log("Sync data to insert:", syncData);

   
    const { data: testQuery, error: testError } = await supabase
      .from("sync_sessions")
      .select("count")
      .eq("user_id", user.id)
      .limit(1);

    console.log("Test query result:", testQuery, testError);

    const { data: insertedData, error: insertError } = await supabase
      .from("sync_sessions")
      .insert(syncData)
      .select();

    if (insertError) {
      console.error("❌ Failed to insert sync session:", insertError);
      console.error("Error details:", {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      });
      
    } else {
      console.log("✅ Sync session inserted:", insertedData);
    }

    return NextResponse.json({
      success: true,
      rowsWritten: pages.length,
      syncRecorded: !insertError,
    });
  } catch (error) {
    console.error("❌ Sync error:", error);
    return NextResponse.json(
      {
        error: "Failed to sync to Google Sheets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
