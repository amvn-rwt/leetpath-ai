import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scoreCode } from "@/lib/ai/code-scorer";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { submissionId } = (await request.json()) as { submissionId: string };

    const submission = await db.submission.findUnique({
      where: { id: submissionId },
      include: { question: true },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const codeScore = await scoreCode({
      questionTitle: submission.question.title,
      questionDescription: submission.question.description,
      code: submission.code,
      language: submission.language,
      testResults: {
        passed: submission.passedTests ?? 0,
        total: submission.totalTests ?? 0,
        details: `Status: ${submission.status}`,
      },
    });

    const score = await db.score.create({
      data: {
        submissionId: submission.id,
        correctness: codeScore.correctness,
        timeComplexity: codeScore.timeComplexity,
        optimalTimeComplexity: codeScore.optimalTimeComplexity,
        spaceComplexity: codeScore.spaceComplexity,
        optimalSpaceComplexity: codeScore.optimalSpaceComplexity,
        codeQuality: codeScore.codeQuality,
        edgeCaseHandling: codeScore.edgeCaseHandling,
        overallScore: codeScore.overallScore,
        feedback: codeScore.feedback,
        optimalSolution: codeScore.optimalSolution,
      },
    });

    return NextResponse.json(score);
  } catch (error) {
    console.error("Scoring error:", error);
    return NextResponse.json(
      { error: "Failed to score code" },
      { status: 500 }
    );
  }
}
