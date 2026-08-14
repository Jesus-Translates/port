"use client";

import { useState } from "react";
import { sendInvite } from "@/lib/actions/invites";

/**
 * Owner/parent surface for emailing an invite. The server re-checks the
 * caller's role and the seat limit — this form is convenience, not the gate.
 */
export function InviteForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"child" | "parent">("child");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await sendInvite({ email, role });
      if (res.ok) {
        setSentTo(res.email);
        setEmail("");
      } else {
        setError(res.error);
      }
    } catch {
      setError("Não foi possível enviar o convite. Tenta outra vez.");
    }
    setBusy(false);
  }

  const field =
    "mt-1 w-full rounded-xl border border-sand bg-white/80 px-3.5 py-2.5 text-base text-ink placeholder:text-ink-faint focus:border-sage focus:ring-2 focus:ring-sage-light focus:outline-none sm:text-[15px]";

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <label className="block">
        <span className="label">Email de quem convidas</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="avó@exemplo.pt"
          required
          autoCapitalize="off"
          className={field}
        />
      </label>

      <fieldset>
        <legend className="label">Entra como</legend>
        <div className="mt-1 flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="invite-role"
              checked={role === "child"}
              onChange={() => setRole("child")}
            />
            Aprendiz
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="invite-role"
              checked={role === "parent"}
              onChange={() => setRole("parent")}
            />
            Adulto responsável
          </label>
        </div>
        <p className="mt-1.5 text-xs text-ink-faint">
          Um adulto responsável pode gerir contas e convidar outras pessoas.
        </p>
      </fieldset>

      {error && <p className="text-sm text-terra-dark">{error}</p>}
      {sentTo && !error && (
        <p className="rounded-xl bg-sage-pale px-3 py-2 text-sm text-ink">
          Convite enviado para <strong>{sentTo}</strong>. É válido durante 7
          dias e funciona uma única vez.
        </p>
      )}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "A enviar…" : "Enviar convite ✉️"}
      </button>

      <p className="text-center text-xs text-ink-faint">
        A pessoa escolhe o próprio nome e a própria palavra-passe — nunca
        enviamos palavras-passe por email.
      </p>
    </form>
  );
}
