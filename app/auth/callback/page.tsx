"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client"; // <-- uses browser SDK

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    if (!code) {
      router.replace("/login?error=missing_auth_code");
      return;
    }

    const exchangeCode = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("Supabase auth error:", error.message);
        router.replace(`/login?error=${encodeURIComponent(error.message)}`);
      } else {
        router.replace(next);
      }
    };

    exchangeCode();
  }, [searchParams, router, supabase]);

  return <p className="text-center p-6">Signing you in...</p>;
}
