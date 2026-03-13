import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { QUESTION_GENERATOR_PROMPT } from "@/lib/prompts/question-generator";
import type { Difficulty, GeneratedQuestion } from "@/types";

const questionSchema = z.object({
  title: z.string(),
  description: z.string(),
  examples: z.array(
    z.object({
      input: z.string(),
      output: z.string(),
      explanation: z.string().optional(),
    })
  ),
  constraints: z.array(z.string()),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  topics: z.array(z.string()),
  tags: z.array(z.string()),
  hints: z.array(z.string()),
  expectedTimeComplexity: z.string(),
  expectedSpaceComplexity: z.string(),
  testCases: z.array(
    z.object({
      input: z.string(),
      expectedOutput: z.string(),
      explanation: z.string().optional(),
    })
  ),
  hiddenTestCases: z.array(
    z.object({
      input: z.string(),
      expectedOutput: z.string(),
      explanation: z.string().optional(),
    })
  ),
  starterCode: z.record(z.string(), z.string()),
});

interface GenerateQuestionParams {
  topics: string[];
  difficulty: Difficulty;
  experienceLevel: string;
  weakTopics?: string[];
  avoidTopics?: string[];
}

export async function generateQuestion(
  params: GenerateQuestionParams
): Promise<GeneratedQuestion> {
  const { object } = await generateObject({
    model: groq("llama-3.3-70b-versatile"),
    schema: questionSchema,
    prompt: QUESTION_GENERATOR_PROMPT(params),
  });

  return object as GeneratedQuestion;
}
