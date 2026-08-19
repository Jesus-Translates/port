"use client";

import { useState } from "react";
import { suggestUsername } from "@/lib/username";
import { acceptInvite } from "@/lib/actions/invites";

/**
 * The invitee chooses a name and their OWN password. Nothing else: the
 * household and the role travel on the token's database row, so there is
 * nothing here for a hostile client to tamper with — the server ignores
 * everything except these three fields and the token itself.
 */
export function InviteAcceptForm({
  token,
  familyName,
}: {
  token: string;
  familyName: string;
}) {
  const [form, setForm] = useState({ displayName: "", username: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoFrom = suggestUsername;
  function setName(displayName: string) {
    setForm((f) => ({
      ...f,
      displayName,
      username: f.username === autoFrom(f.displayName) ? autoFrom(displayName) : f.username,
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      // On success the action sets the session cookie and redirects to
      // /bem-vindo itself — it only ever RETURNS on failure.
      const res = await acceptInvite({ token, ...form });
      if (res && !res.ok) {
        setError(res.error);
        setBusy(false);
      }
    } catch {
      setError("Não foi possível criar a conta. Tenta outra vez.");
      setBusy(false);
    }
  }

  const field =
    "mt-1 w-full rounded-xl border border-sand bg-white/80 px-3.5 py-2.5 text-base text-ink placeholder:text-ink-faint focus:border-sage focus:ring-2 focus:ring-sage-light focus:outline-none sm:text-[15px]";

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <p className="text-sm leading-relaxed text-ink-soft">
        A família <strong className="text-ink">{familyName}</strong> convidou-te.
        Escolhe como queres entrar — a conta é tua.
        <span className="mt-1 block text-xs text-ink-faint">
          The {familyName} family invited you. Pick your name and password — the
          account is yours.
        </span>
      </p>

      <label className="block">
        <span className="label">O teu nome · Your name</span>
        <input
          value={form.displayName}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ana"
          required
          maxLength={60}
          className={field}
        />
      </label>

      <label className="block">
        <span className="label">Utilizador · Username</span>
        <input
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value.toLowerCase() })
          }
          placeholder="ana"
          required
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="username"
          className={field}
        />
      </label>

      <label className="block">
        <span className="label">Palavra-passe · Password</span>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="pelo menos 8 caracteres"
          required
          minLength={8}
          autoComplete="new-password"
          className={field}
        />
      </label>

      {error && <p className="text-sm text-terra-dark">{error}</p>}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "A entrar…" : "Juntar-me à família →"}
      </button>
    </form>
  );
}
