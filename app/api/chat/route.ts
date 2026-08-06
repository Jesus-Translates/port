import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { NextResponse, type NextRequest } from "next/server";
import { getModel, tutorInstructions } from "@/lib/ai";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { messages, context }: { messages: UIMessage[]; context?: string } =
    await request.json();

  let instructions = tutorInstructions(session.displayName);
  if (context) {
    instructions += `\n\nCONTEXT the learner is currently looking at:\n${context.slice(0, 6000)}`;
  }

  // First message of a conversation → count it as study activity.
  if (messages.filter((m) => m.role === "user").length === 1) {
    logActivity(session.username, "tutor", "Talked with Luna", 5).catch(
      () => {}
    );
  }

  const result = streamText({
    model: getModel(),
    instructions,
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
