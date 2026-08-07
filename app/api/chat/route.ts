import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { after, NextResponse, type NextRequest } from "next/server";
import { getModel, tutorInstructions } from "@/lib/ai";
import { getCefrFor } from "@/lib/data";
import { getSession, getValidUsers } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { aiRateLimited, modelId, recordUsage } from "@/lib/usage";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (await aiRateLimited(session.username)) {
    return NextResponse.json(
      { error: "Calma! Muitos pedidos à Luna — espera uns minutos." },
      { status: 429 }
    );
  }

  let body: { messages: UIMessage[]; context?: string };
  try {
    const raw = await request.text();
    // PAYLOAD_CAP: a pasted novel must not become a six-figure token bill.
    if (raw.length > 60_000) {
      return NextResponse.json(
        { error: "Mensagem demasiado longa." },
        { status: 413 }
      );
    }
    body = JSON.parse(raw);
    if (!Array.isArray(body.messages)) throw new Error();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const { messages, context } = body;

  const cefr = await getCefrFor(session.username);
  let instructions = tutorInstructions(session.displayName, getValidUsers(), cefr);
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

  // Token counts only settle once the stream finishes.
  after(async () => {
    try {
      await recordUsage(session.username, "tutor", modelId(), await result.usage);
    } catch {
      // Billing telemetry must never break the chat.
    }
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
