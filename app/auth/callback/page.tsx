import { Suspense } from "react";
import AuthCallbackClient from "./AuthCallbackClient";

// Force this page to be dynamic to prevent build errors
export const dynamic = "force-dynamic";

function AuthCallbackContent() {
  return <AuthCallbackClient />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="text-center p-6">Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
