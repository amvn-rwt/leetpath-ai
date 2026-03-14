import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function POST() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  return NextResponse.json({ ok: true });
}
