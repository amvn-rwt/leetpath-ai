import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const question = await db.question.findUnique({
      where: { id },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    if (question.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const hiddenTestCases = question.hiddenTestCases as Array<{
      input: string;
      expectedOutput: string;
      explanation?: string;
    }>;
    const sanitizedHidden = hiddenTestCases.map((tc) => ({
      input: tc.input,
      expectedOutput: undefined,
      explanation: tc.explanation,
    }));

    return NextResponse.json({
      ...question,
      hiddenTestCases: sanitizedHidden,
    });
  } catch (error) {
    console.error("Question fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    );
  }
}
