"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { HarvestFromMarkdown } from "@/components/add-to-deck";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";

/** Text parts of one message, flattened. */
function textOf(message: UIMessage): string {
  return message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("\n")
    .trim();
}

export function Chat({
  context,
  placeholder = "Pergunta alguma coisa à Sandra… (ask anything)",
  starters = [],
  compact = false,
  initialInput = "",
  tpcButton = false,
}: {
  context?: string;
  placeholder?: string;
  starters?: string[];
  compact?: boolean;
  initialInput?: string;
  /** Offer "turn this conversation into homework" once there's enough to go on. */
  tpcButton?: boolean;
}) {
  const router = useRouter();
  const [input, setInput] = useState(initialInput);
  const [makingTpc, setMakingTpc] = useState(false);
  const { messages, sendMessage, status, error, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { context },
    }),
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const busy = status === "submitted" || status === "streaming";

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  const userTurns = messages.filter((m) => m.role === "user").length;
  const canMakeTpc = tpcButton && userTurns >= 2 && !busy;

  async function makeTpc() {
    const lines: string[] = [];
    for (const m of messages) {
      const text = textOf(m);
      if (!text) continue;
      lines.push(`${m.role === "user" ? "Aluno" : "Sandra"}: ${text}`);
    }
    const joined = lines.join("\n");
    // Keep the tail — the end of the conversation is what's freshest.
    const transcript =
      joined.length > 6000 ? joined.slice(joined.length - 6000) : joined;
    if (!transcript) return;

    setMakingTpc(true);
    try {
      const res = await fetch("/api/ai/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "from-chat", transcript }),
      });
      if (!res.ok) throw new Error();
      const { id } = await res.json();
      router.push(`/homework/${id}`);
    } catch {
      setMakingTpc(false);
      alert("A Sandra não conseguiu montar o TPC. Tenta outra vez.");
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={cn(
          "flex-1 space-y-4 overflow-y-auto pr-1",
          compact ? "max-h-[50dvh]" : ""
        )}
      >
        {messages.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mb-2 text-4xl" aria-hidden>
              🌙
            </div>
            <p className="text-sm text-ink-soft">
              Olá! Sou a Sandra, a vossa tutora de português. 🇵🇹
            </p>
            {starters.length > 0 ? (
              <div className="mx-auto mt-4 flex max-w-md flex-wrap justify-center gap-2">
                {starters.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-sand bg-white/70 px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-sage hover:bg-sage-pale hover:text-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5",
                message.role === "user"
                  ? "bg-olive text-paper"
                  : "border border-sand bg-white/80"
              )}
            >
              {message.parts.map((part, i) =>
                part.type === "text" ? (
                  message.role === "user" ? (
                    <p key={i} className="text-[15px] whitespace-pre-wrap">
                      {part.text}
                    </p>
                  ) : (
                    <Markdown key={i}>{part.text}</Markdown>
                  )
                ) : null
              )}
              {message.role === "assistant" ? (
                <HarvestFromMarkdown md={textOf(message)} />
              ) : null}
            </div>
          </div>
        ))}

        {status === "submitted" ? (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-sand bg-white/80 px-4 py-2.5 text-sm text-ink-faint">
              A Sandra está a escrever…
            </div>
          </div>
        ) : null}
        {error ? (
          <div className="flex items-center gap-2 rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
            <span>
              A Sandra não conseguiu responder (a ligação ou o limite do modelo).
            </span>
            <button
              onClick={() => regenerate()}
              className="font-semibold underline underline-offset-2"
            >
              Tentar outra vez
            </button>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {tpcButton && userTurns >= 2 ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={makeTpc}
            disabled={!canMakeTpc || makingTpc}
            className="btn-ghost min-h-0 py-1.5 text-xs"
          >
            {makingTpc
              ? "A Sandra está a escrever o TPC…"
              : "✍️ Gerar TPC desta conversa"}
          </button>
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="input flex-1"
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn-terra">
          Enviar
        </button>
      </form>
    </div>
  );
}
