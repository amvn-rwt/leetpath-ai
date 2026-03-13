import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { CODE_SCORER_PROMPT } from "@/lib/prompts/code-scorer";
import type { CodeScore } from "@/types";

const scoreSchema = z.object({
  correctness: z.number().min(0).max(100),
  timeComplexity: z.string(),
  optimalTimeComplexity: z.string(),
  spaceComplexity: z.string(),
  optimalSpaceComplexity: z.string(),
  codeQuality: z.number().min(0).max(100),
  edgeCaseHandling: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
  feedback: z.string(),
  optimalSolution: z.string().optional(),
});

interface ScoreCodeParams {
  questionTitle: string;
  questionDescription: string;
  code: string;
  language: string;
  testResults: {
    passed: number;
    total: number;
    details: string;
  };
}

export async function scoreCode(params: ScoreCodeParams): Promise<CodeScore> {
  const { object } = await generateObject({
    model: groq("llama-3.3-70b-versatile"),
    schema: scoreSchema,
    prompt: CODE_SCORER_PROMPT(params),
  });

  return object;
}
