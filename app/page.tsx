import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";


export const dynamic = "force-dynamic";

export default async function Home() {
  
  const cookieStore = cookies();

  
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  
  if (user) {
    redirect("/dashboard");
  }

  
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
