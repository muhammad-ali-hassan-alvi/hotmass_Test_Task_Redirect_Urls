"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = Object.fromEntries(searchParams.entries());
        console.log("=== AUTH CALLBACK DEBUG ===");
        console.log("Full URL:", window.location.href);
        console.log("URL Parameters:", urlParams);

        setDebugInfo({
          url: window.location.href,
          params: urlParams,
          origin: window.location.origin,
        });

        if (
          !process.env.NEXT_PUBLIC_SUPABASE_URL ||
          !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ) {
          throw new Error("Supabase configuration is missing");
        }

        const { createBrowserClient } = await import("@supabase/ssr");

        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const code = searchParams.get("code");
        const error_code = searchParams.get("error");
        const error_description = searchParams.get("error_description");

        console.log("Auth parameters:", {
          hasCode: !!code,
          codeLength: code?.length,
          errorCode: error_code,
          errorDescription: error_description,
        });

        if (error_code) {
          console.error("OAuth error:", error_code, error_description);
          throw new Error(error_description || error_code);
        }

        if (!code) {
          console.error("No authorization code found in URL");
          throw new Error(
            "No authorization code received. Please try the magic link again."
          );
        }

        console.log("Attempting to exchange code for session...");

        const { data, error: authError } =
          await supabase.auth.exchangeCodeForSession(code);

        console.log("Exchange result:", {
          hasData: !!data,
          hasUser: !!data?.user,
          hasSession: !!data?.session,
          error: authError,
        });

        if (authError) {
          console.warn("Session exchange failed, checking session cookie...");
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user) {
            console.log("User session exists via cookie, proceeding...");
            const next = searchParams.get("next") ?? "/dashboard";
            router.replace(next);
            return;
          }

          console.error("Session exchange error:", authError);
          throw new Error(`Authentication failed: ${authError.message}`);
        }

        if (data?.user) {
          console.log("Authentication successful for:", data.user.email);
          const next = searchParams.get("next") ?? "/dashboard";
          router.replace(next);
        } else {
          throw new Error("No user data received after authentication");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Authentication failed";
        console.error("=== CALLBACK ERROR ===");
        console.error("Error:", errorMessage);
        console.error(
          "Stack:",
          err instanceof Error ? err.stack : "No stack trace"
        );

        setError(errorMessage);

        setTimeout(() => {
          router.replace(`/?error=${encodeURIComponent(errorMessage)}`);
        }, 5000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-2xl w-full bg-white p-6 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Authentication Error
            </h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <p className="text-xs text-gray-500 mb-4">
              Redirecting you back to the login page in 5 seconds...
            </p>
          </div>

          {debugInfo && (
            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <h4 className="font-medium text-gray-900 mb-2">
                Debug Information:
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  <strong>URL:</strong> {debugInfo.url}
                </p>
                <p>
                  <strong>Origin:</strong> {debugInfo.origin}
                </p>
                <p>
                  <strong>Parameters:</strong>
                </p>
                <pre className="bg-white p-2 rounded border text-xs overflow-auto">
                  {JSON.stringify(debugInfo.params, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing authentication...</p>
          <p className="text-xs text-gray-500 mt-2">
            Check browser console for debug info
          </p>
        </div>
      </div>
    );
  }

  return null;
}
