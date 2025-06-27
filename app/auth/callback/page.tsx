import dynamic from "next/dynamic";

const AuthCallbackClient = dynamic(() => import("./AuthCallbackClient"), {
  ssr: false, // Disable server-side rendering for this page
});

export default function AuthCallbackPage() {
  return <AuthCallbackClient />;
}
