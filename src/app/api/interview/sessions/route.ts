import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { generateQuestion } from "@/lib/ai/question-generator";
import { db } from "@/lib/db";
import type { Difficulty } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { topics, difficulty, duration, companyStyle } = body as {
      topics: string[];
      difficulty: Difficulty;
      duration: number;
      companyStyle?: string;
    };

    if (!topics?.length || !difficulty || !duration) {
      return NextResponse.json(
        { error: "topics, difficulty, and duration are required" },
        { status: 400 }
      );
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      include: { skillAssessments: true },
    });

    const weakTopics =
      dbUser?.skillAssessments
        .filter((s) => s.selfLevel === "WEAK" || s.aiLevel === "WEAK")
        .map((s) => s.topic) ?? [];

    const question = await generateQuestion({
      topics,
      difficulty,
      experienceLevel: dbUser?.experienceLevel ?? "MID",
      weakTopics,
    });

    const savedQuestion = await db.question.create({
      data: {
        userId: user.id,
        title: question.title,
        description: question.description,
        examples: JSON.parse(JSON.stringify(question.examples)),
        constraints: question.constraints,
        difficulty: question.difficulty,
        topics: question.topics,
        tags: question.tags,
        hints: question.hints,
        expectedTimeComplexity: question.expectedTimeComplexity,
        expectedSpaceComplexity: question.expectedSpaceComplexity,
        testCases: JSON.parse(JSON.stringify(question.testCases)),
        hiddenTestCases: JSON.parse(JSON.stringify(question.hiddenTestCases)),
        starterCode: JSON.parse(JSON.stringify(question.starterCode)),
      },
    });

    const session = await db.interviewSession.create({
      data: {
        userId: user.id,
        questionId: savedQuestion.id,
        difficulty,
        topics,
        duration,
        companyStyle: companyStyle ?? null,
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("Interview session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create interview session" },
      { status: 500 }
    );
  }
}
