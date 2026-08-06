"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";

export function Chat({
  context,
  placeholder = "Pergunta alguma coisa à Luna… (ask anything)",
  starters = [],
  compact = false,
  initialInput = "",
}: {
  context?: string;
  placeholder?: string;
  starters?: string[];
  compact?: boolean;
  initialInput?: string;
}) {
  const [input, setInput] = useState(initialInput);
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
              Olá! Sou a Luna, a vossa tutora de português. 🇵🇹
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
            </div>
          </div>
        ))}

        {status === "submitted" ? (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-sand bg-white/80 px-4 py-2.5 text-sm text-ink-faint">
              A Luna está a escrever…
            </div>
          </div>
        ) : null}
        {error ? (
          <div className="flex items-center gap-2 rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
            <span>
              A Luna não conseguiu responder (a ligação ou o limite do modelo).
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
