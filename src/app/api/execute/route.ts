import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { executeAndWait } from "@/lib/judge0";
import type { SupportedLanguage } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, language, stdin, expectedOutput } = (await request.json()) as {
      code: string;
      language: SupportedLanguage;
      stdin?: string;
      expectedOutput?: string;
    };

    const result = await executeAndWait(code, language, stdin, expectedOutput);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Code execution error:", error);
    return NextResponse.json(
      { error: "Failed to execute code" },
      { status: 500 }
    );
  }
}
