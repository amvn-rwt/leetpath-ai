"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const errorParam = searchParams.get("error");
  const [error, setError] = useState<string | null>(
    errorParam === "auth_failed"
      ? "Sign in with Google failed. Please try again."
      : errorParam === "missing_code"
        ? "Invalid sign-in link. Please try again."
        : errorParam === "no_user"
          ? "Could not get user info. Please try again."
          : null
  );
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
      return;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to LeetPath AI</CardTitle>
          <CardDescription>Sign in with your Google account to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button
            variant="outline"
            className="w-full"
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
          >
            {loading ? "Redirecting…" : "Continue with Google"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
