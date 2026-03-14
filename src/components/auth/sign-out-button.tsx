"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } finally {
      window.location.href = "/";
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      disabled={loading}
      onClick={handleSignOut}
    >
      {children ?? (
        <>
          <LogOut className="h-4 w-4" />
          Sign Out
        </>
      )}
    </Button>
  );
}
