import { cookies } from "next/headers"; 
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard/Dashboard";


export const dynamic = "force-dynamic";

export default async function DashboardPage() {

  const cookieStore = cookies();

  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return <Dashboard user={user} />;
}
