import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { QUESTION_GENERATOR_PROMPT } from "@/lib/prompts/question-generator";
import type { Difficulty, GeneratedQuestion } from "@/types";

// Groq strict json_schema requires every property to be in "required"; no optional().
// Use required string and allow "" for optional explanation fields.
const questionSchema = z.object({
  title: z.string(),
  description: z.string(),
  examples: z.array(
    z.object({
      input: z.string(),
      output: z.string(),
      explanation: z.string(),
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
      explanation: z.string(),
    })
  ),
  hiddenTestCases: z.array(
    z.object({
      input: z.string(),
      expectedOutput: z.string(),
      explanation: z.string(),
    })
  ),
  // Fixed keys (no z.record) — Groq doesn't support propertyNames in json_schema
  starterCode: z.object({
    python: z.string(),
    javascript: z.string(),
    java: z.string(),
    cpp: z.string(),
    go: z.string(),
  }),
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
  // Use a model that supports structured outputs (json_schema); llama-3.3-70b does not.
  // See https://console.groq.com/docs/structured-outputs#supported-models
  const { object } = await generateObject({
    model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
    schema: questionSchema,
    prompt: QUESTION_GENERATOR_PROMPT(params),
  });

  return object as GeneratedQuestion;
}
