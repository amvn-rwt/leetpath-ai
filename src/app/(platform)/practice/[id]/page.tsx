import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { PracticeWorkspace } from "./practice-workspace";
import type { PracticeQuestionData } from "./practice-workspace";

export default async function PracticeQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const question = await db.question.findUnique({
    where: { id },
  });

  if (!question || question.userId !== user.id) {
    notFound();
  }

  const payload: PracticeQuestionData = {
    id: question.id,
    title: question.title,
    description: question.description,
    examples: question.examples as unknown as PracticeQuestionData["examples"],
    constraints: question.constraints,
    difficulty: question.difficulty,
    topics: question.topics,
    tags: question.tags,
    hints: question.hints,
    expectedTimeComplexity: question.expectedTimeComplexity,
    expectedSpaceComplexity: question.expectedSpaceComplexity,
    testCases: question.testCases as unknown as PracticeQuestionData["testCases"],
    starterCode: question.starterCode as unknown as PracticeQuestionData["starterCode"],
  };

  return <PracticeWorkspace question={payload} />;
}
