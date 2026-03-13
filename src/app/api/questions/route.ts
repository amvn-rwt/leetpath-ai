import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateQuestion } from "@/lib/ai/question-generator";
import { db } from "@/lib/db";
import type { Difficulty } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { topics, difficulty } = body as {
      topics: string[];
      difficulty: Difficulty;
    };

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      include: { skillAssessments: true, statistics: true },
    });

    const weakTopics = dbUser?.skillAssessments
      .filter((s) => s.selfLevel === "WEAK" || s.aiLevel === "WEAK")
      .map((s) => s.topic) ?? [];

    const question = await generateQuestion({
      topics,
      difficulty,
      experienceLevel: dbUser?.experienceLevel ?? "MID",
      weakTopics,
    });

    const saved = await db.question.create({
      data: {
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

    return NextResponse.json(saved);
  } catch (error) {
    console.error("Question generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}
