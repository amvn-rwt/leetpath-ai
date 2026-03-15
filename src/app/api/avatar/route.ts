import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(null, { status: 401 });
  }

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  if (!avatarUrl || !avatarUrl.startsWith("https://")) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const res = await fetch(avatarUrl, {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": "LeetPath-Avatar-Proxy/1.0",
      },
    });

    if (!res.ok) {
      return new NextResponse(null, { status: 404 });
    }

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
