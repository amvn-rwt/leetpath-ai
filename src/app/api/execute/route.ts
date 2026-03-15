import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  executeAndWait,
  executeBatchAndWait,
} from "@/lib/judge0";
import type { SupportedLanguage } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      code: string;
      language: SupportedLanguage;
      stdin?: string;
      expectedOutput?: string;
      testCases?: Array<{ stdin?: string; expectedOutput?: string }>;
    };

    const { code, language, stdin, expectedOutput, testCases } = body;

    if (testCases && Array.isArray(testCases) && testCases.length > 0) {
      const results = await executeBatchAndWait(code, language, testCases);
      return NextResponse.json({ results });
    }

    const result = await executeAndWait(code, language, stdin, expectedOutput);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Code execution error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to execute code";
    const status =
      message.includes("Forbidden") || message.includes("API key")
        ? 503
        : message.includes("Too many requests")
          ? 429
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
