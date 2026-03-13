import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import { INTERVIEWER_SYSTEM_PROMPT } from "@/lib/prompts/interviewer";

interface InterviewContext {
  difficulty: string;
  topics: string[];
  companyStyle?: string;
  duration: number;
  questionTitle: string;
  questionDescription: string;
  hintsUsed: number;
  maxHints: number;
}

export function streamInterviewResponse(
  messages: { role: "user" | "assistant"; content: string }[],
  context: InterviewContext
) {
  return streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: INTERVIEWER_SYSTEM_PROMPT(context),
    messages,
  });
}
