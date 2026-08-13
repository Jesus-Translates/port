"use client";

import { useState, useTransition } from "react";
import { deleteKudo, giveStar, sendNote } from "@/lib/actions/kudos";
import type { FamilyMember } from "@/lib/data";
import { avatarFor, titleCase } from "@/lib/people";
import { cn } from "@/lib/utils";

type Kudo = {
  id: number;
  fromUser: string;
  toUser: string;
  kind: string;
  message: string;
  createdAt: string;
};

const MEDALS = ["🥇", "🥈", "🥉"];

export function FamilyBoard({
  board,
  me,
  recent,
}: {
  board: FamilyMember[];
  me: string;
  recent: Kudo[];
}) {
  const [target, setTarget] = useState<{
    user: string;
    kind: "star" | "note";
  } | null>(null);
  const [, startTransition] = useTransition();

  const myRank = board.findIndex((m) => m.username === me) + 1;
  const leader = board[0];
  const gap = leader && myRank > 1 ? leader.xpThisWeek - (board[myRank - 1]?.xpThisWeek ?? 0) : 0;

  return (
    <div className="space-y-6">
      {myRank > 0 ? (
        <div className="card p-4">
          {myRank === 1 ? (
            <p className="text-sm">
              🥇 <span className="font-semibold">Estás em primeiro!</span>{" "}
              {board[1] && leader.xpThisWeek > board[1].xpThisWeek
                ? `${titleCase(board[1].username)} está ${leader.xpThisWeek - board[1].xpThisWeek} XP atrás de ti — mantém o ritmo.`
                : "Mantém o ritmo!"}
            </p>
          ) : (
            <p className="text-sm">
              Estás em <span className="font-semibold">{myRank}º</span> esta
              semana. Faltam{" "}
              <span className="font-semibold text-terra">{gap} XP</span> para
              apanhar {titleCase(leader.username)} {avatarFor(leader.username)}
            </p>
          )}
        </div>
      ) : null}

      {/* Rendered above the list so it's visible immediately on a phone. */}
      {target ? (
        <KudosForm target={target} onClose={() => setTarget(null)} />
      ) : null}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Esta semana</h2>
        <div className="card divide-y divide-sand/70">
          {board.map((m, i) => (
            <div
              key={m.username}
              className={cn(
                "flex flex-wrap items-center gap-3 px-4 py-3",
                m.username === me && "bg-sage-pale/40"
              )}
            >
              <span className="w-6 shrink-0 text-center text-lg" aria-hidden>
                {MEDALS[i] ?? <span className="text-sm text-ink-faint">{i + 1}</span>}
              </span>
              <span className="text-xl" aria-hidden>
                {avatarFor(m.username)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 font-medium">
                  {titleCase(m.username)}
                  {m.username === me ? (
                    <span className="text-2xs text-ink-faint">(tu)</span>
                  ) : null}
                  {m.stars > 0 ? (
                    <span className="text-xs text-terra" title={`${m.stars} estrelas`}>
                      {"⭐".repeat(Math.min(m.stars, 3))}
                      {m.stars > 3 ? ` ×${m.stars}` : ""}
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-ink-faint">
                  {m.streakDays > 0 ? `🔥 ${m.streakDays}d · ` : ""}
                  {m.quizzesDone > 0
                    ? `${m.quizzesDone} testes${m.quizAccuracy !== null ? ` · ${m.quizAccuracy}%` : ""}`
                    : "ainda sem testes"}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-bold tabular-nums text-olive">
                  {m.xpThisWeek}
                </div>
                <div className="text-2xs text-ink-faint">XP semana</div>
              </div>
              {m.username !== me ? (
                <div className="flex w-full gap-2 sm:w-auto">
                  <button
                    className="btn-ghost flex-1 px-2.5 py-1.5 text-xs sm:flex-none"
                    onClick={() => setTarget({ user: m.username, kind: "star" })}
                  >
                    ⭐ Estrela
                  </button>
                  <button
                    className="btn-ghost flex-1 px-2.5 py-1.5 text-xs sm:flex-none"
                    onClick={() => setTarget({ user: m.username, kind: "note" })}
                  >
                    💬 Recado
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Mural de elogios</h2>
        {recent.length === 0 ? (
          <p className="card p-6 text-center text-sm text-ink-soft">
            Ainda não há elogios. Sê o primeiro a dar uma estrela! ⭐
          </p>
        ) : (
          <ul className="space-y-2">
            {recent.map((k) => (
              <li
                key={k.id}
                className={cn(
                  "card flex items-start gap-3 p-3",
                  k.kind === "star" && "border-terra/40 bg-terra-pale/30"
                )}
              >
                <span className="text-xl" aria-hidden>
                  {k.kind === "star" ? "⭐" : "💬"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm">
                    <span className="font-semibold">
                      {titleCase(k.fromUser)}
                    </span>{" "}
                    {k.kind === "star" ? "deu uma estrela a" : "escreveu a"}{" "}
                    <span className="font-semibold">{titleCase(k.toUser)}</span>
                  </div>
                  {k.message ? (
                    <p className="mt-0.5 text-sm text-ink-soft italic">
                      “{k.message}”
                    </p>
                  ) : null}
                </div>
                {k.fromUser === me || k.toUser === me ? (
                  <button
                    title="Apagar"
                    aria-label="Apagar elogio"
                    className="shrink-0 p-1 text-ink-faint hover:text-terra"
                    onClick={() => {
                      if (confirm("Apagar este elogio?")) {
                        startTransition(() => deleteKudo(k.id));
                      }
                    }}
                  >
                    ✕
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function KudosForm({
  target,
  onClose,
}: {
  target: { user: string; kind: "star" | "note" };
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const isStar = target.kind === "star";

  const SUGGESTIONS = isStar
    ? [
        "Boa! Estás a arrasar nos testes 💪",
        "Que sequência! Todos os dias a estudar 🔥",
        "O teu português está muito melhor!",
      ]
    : [
        "Vamos fazer um teste juntos hoje?",
        "Vi o teu TPC — muito bom!",
        "Precisas de ajuda com alguma coisa?",
      ];

  return (
    <div className="card space-y-3 border-terra/40 p-4">
      <h3 className="font-semibold">
        {isStar ? "⭐ Dar uma estrela a" : "💬 Deixar um recado a"}{" "}
        {titleCase(target.user)} {avatarFor(target.user)}
      </h3>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        className="input resize-y"
        placeholder={
          isStar ? "Porquê? (opcional)" : "Escreve algo encorajador…"
        }
      />
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setMessage(s)}
            className="rounded-full border border-sand bg-white/60 px-2.5 py-1 text-xs text-ink-soft hover:border-sage hover:bg-sage-pale"
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          className="btn-terra"
          disabled={pending || (!isStar && !message.trim())}
          onClick={() =>
            startTransition(async () => {
              if (isStar) await giveStar(target.user, message);
              else await sendNote(target.user, message);
              onClose();
            })
          }
        >
          {pending ? "A enviar…" : isStar ? "Dar estrela ⭐" : "Enviar 💬"}
        </button>
        <button className="btn-ghost" onClick={onClose} disabled={pending}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
