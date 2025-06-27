// app/auth/callback/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { code?: string; next?: string; error?: string };
}) {
  const code = searchParams.code;
  const next = searchParams.next ?? "/dashboard";

  if (!code) {
    return redirect("/login?error=missing_auth_code");
  }

  const supabase = createClient();

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error);
      return redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }

    return redirect(next);
  } catch (err) {
    console.error("Callback exception:", err);
    return redirect("/login?error=auth_failed");
  }
}
