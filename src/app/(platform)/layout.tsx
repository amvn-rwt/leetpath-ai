import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { LayoutDashboard, Code, MessageSquare, BarChart3 } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/practice", label: "Practice", icon: Code },
  { href: "/interview", label: "Interview", icon: MessageSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col border-r bg-sidebar">
        {/* Logo */}
        <div className="flex h-12 items-center border-b px-5">
          <Link href="/dashboard" className="text-sm font-mono font-semibold tracking-tight">
            LeetPath
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom user section */}
        <div className="border-t p-3">
          <div className="mb-2 truncate px-3 py-1 text-xs text-muted-foreground">
            {user.email}
          </div>
          <SignOutButton className="w-full justify-start gap-3 text-muted-foreground" />
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b bg-background px-6">
          <span className="text-sm font-medium text-muted-foreground">
            Welcome back
          </span>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <Avatar className="size-7">
              <AvatarImage
                src={user.user_metadata?.avatar_url ? "/api/avatar" : undefined}
                alt=""
              />
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {user.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
