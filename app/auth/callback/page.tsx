// app/auth/callback/page.tsx

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

// This is a server component, so it can be async.
// It does NOT use "use client" or any hooks.
export default async function AuthCallbackPage(
  // Next.js automatically provides the request object in Route Handlers
  // and searchParams in Pages.
  { searchParams }: { searchParams: { code?: string; next?: string } }
) {
  const code = searchParams.code;
  const next = searchParams.next ?? "/dashboard";

  if (code) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // On success, redirect the user. This happens on the server.
      return redirect(next);
    }

    console.error("Auth callback error:", error.message);
  }

  // If there's an error or no code, redirect to an error page.
  return redirect("/login?error=auth_failed");
}
