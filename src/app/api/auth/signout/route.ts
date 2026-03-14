import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient(await cookies());
  await supabase.auth.signOut();

  const url = new URL(request.url);
  return NextResponse.redirect(`${url.origin}/`);
}
