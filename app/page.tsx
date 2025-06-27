// app/page.tsx

import { cookies } from "next/headers"; // <-- FIX 1: Import the cookies function
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";

// FIX 2: Force this page to be dynamic to prevent build errors
export const dynamic = "force-dynamic";

export default async function Home() {
  // FIX 3: Get the cookie store from the request
  const cookieStore = cookies();

  // FIX 4: Pass the cookie store to the client and remove 'await'
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If a user is already logged in, redirect them to the dashboard
  if (user) {
    redirect("/dashboard");
  }

  // If no user is logged in, show the login page content
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            HubSpot Sheets Sync
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connect your Google Sheets to HubSpot content
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
