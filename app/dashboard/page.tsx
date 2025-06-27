// app/dashboard/page.tsx

import { cookies } from "next/headers"; // <-- FIX 1: Import the cookies function
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard/Dashboard";

// FIX 2: Force this page to be dynamic to prevent build errors.
// This is the most important fix for the Vercel build error.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // FIX 3: Get the cookie store from the request
  const cookieStore = cookies();

  // FIX 4: Pass the cookie store to the client and remove 'await'
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return <Dashboard user={user} />;
}
