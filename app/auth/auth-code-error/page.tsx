import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Mail } from "lucide-react";

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-900">Authentication Error</CardTitle>
          <CardDescription>
            There was a problem with your magic link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p>This could happen if:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>The magic link has expired (links expire after 1 hour)</li>
              <li>The link has already been used</li>
              <li>The link was corrupted during email delivery</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link href="/" className="w-full">
              <Button className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Request New Magic Link
              </Button>
            </Link>

            <p className="text-xs text-center text-gray-500">
              Or try signing in with your email and password
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
