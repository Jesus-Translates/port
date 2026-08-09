"use client";

import { useState, useTransition } from "react";
import { changeMyPassword } from "@/lib/actions/users";

/**
 * Change your own password — including the admin's, which is the one nobody
 * else can reset. Proving the current password first is what stops a borrowed
 * unlocked phone from taking the account.
 */
export function ChangeMyPassword() {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [note, setNote] = useState<{ kind: "ok" | "bad"; text: string } | null>(
    null
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-sand px-3 py-2 text-sm hover:border-sage"
      >
        🔑 Mudar a minha palavra-passe
      </button>
    );
  }

  return (
    <form
      className="space-y-3 rounded-xl border border-sand bg-white/70 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setNote(null);
        if (next !== confirm) {
          setNote({ kind: "bad", text: "As duas palavras-passe novas não são iguais." });
          return;
        }
        start(async () => {
          const r = await changeMyPassword(current, next);
          if (r.ok) {
            setNote({ kind: "ok", text: "Palavra-passe alterada." });
            setCurrent("");
            setNext("");
            setConfirm("");
            setOpen(false);
          } else {
            setNote({ kind: "bad", text: r.error });
          }
        });
      }}
    >
      <h2 className="text-sm font-semibold">A minha palavra-passe</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {(
          [
            ["Atual", current, setCurrent, "current-password"],
            ["Nova", next, setNext, "new-password"],
            ["Repete a nova", confirm, setConfirm, "new-password"],
          ] as const
        ).map(([label, value, set, ac]) => (
          <label key={label} className="text-xs text-ink-soft">
            {label}
            <input
              type="password"
              value={value}
              autoComplete={ac}
              onChange={(e) => set(e.target.value)}
              className="mt-1 w-full rounded-lg border border-sand bg-white/80 px-3 py-2 text-sm text-ink"
            />
          </label>
        ))}
      </div>
      {note && (
        <p
          className={`text-xs ${
            note.kind === "ok" ? "text-olive" : "text-terra-dark"
          }`}
        >
          {note.text}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-olive px-3 py-2 text-sm font-medium text-paper hover:bg-ink disabled:opacity-50"
        >
          {pending ? "A guardar…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-sand px-3 py-2 text-sm"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
