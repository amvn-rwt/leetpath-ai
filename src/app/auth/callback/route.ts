import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`);
  }

  const supabase = createClient(await cookies());
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession:", error.message);
    return NextResponse.redirect(`${origin}/sign-in?error=auth_failed`);
  }

  const user = data.user;
  if (!user) {
    return NextResponse.redirect(`${origin}/sign-in?error=no_user`);
  }

  const fullName =
    (user.user_metadata?.full_name as string) ??
    user.user_metadata?.name ??
    null;
  const avatarUrl = (user.user_metadata?.avatar_url as string) ?? null;

  await db.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email!,
      fullName,
      avatarUrl,
    },
    update: {
      email: user.email!,
      ...(fullName != null && { fullName }),
      ...(avatarUrl != null && { avatarUrl }),
    },
  });

  return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : `/${next}`}`);
}
