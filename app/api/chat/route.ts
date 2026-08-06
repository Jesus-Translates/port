import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { after, NextResponse, type NextRequest } from "next/server";
import { getModel, tutorInstructions } from "@/lib/ai";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: { messages: UIMessage[]; context?: string };
  try {
    body = await request.json();
    if (!Array.isArray(body.messages)) throw new Error();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const { messages, context } = body;

  let instructions = tutorInstructions(session.displayName);
  if (context) {
    instructions += `\n\nCONTEXT the learner is currently looking at:\n${context.slice(0, 6000)}`;
  }

  // First message of a conversation → count it as study activity.
  // after() keeps the write alive past the end of the streamed response.
  if (messages.filter((m) => m.role === "user").length === 1) {
    after(
      logActivity(session.username, "tutor", "Talked with Luna", 5).catch(
        () => {}
      )
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
