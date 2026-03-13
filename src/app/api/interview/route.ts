import { createClient } from "@/lib/supabase/server";
import { streamInterviewResponse } from "@/lib/ai/interviewer";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { sessionId, messages } = (await request.json()) as {
      sessionId: string;
      messages: { role: "user" | "assistant"; content: string }[];
    };

    const session = await db.interviewSession.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!session || session.userId !== user.id) {
      return new Response("Session not found", { status: 404 });
    }

    const latestUserMessage = messages[messages.length - 1];
    if (latestUserMessage) {
      await db.interviewMessage.create({
        data: {
          sessionId,
          role: latestUserMessage.role,
          content: latestUserMessage.content,
        },
      });
    }

    const hintsUsed = session.messages.filter(
      (m) => m.role === "assistant" && m.metadata && (m.metadata as Record<string, unknown>).isHint
    ).length;

    const result = streamInterviewResponse(messages, {
      difficulty: session.difficulty,
      topics: session.topics,
      companyStyle: session.companyStyle ?? undefined,
      duration: session.duration,
      questionTitle: "Interview Question",
      questionDescription: "Dynamic question from session",
      hintsUsed,
      maxHints: 3,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Interview error:", error);
    return new Response("Failed to process interview", { status: 500 });
  }
}
