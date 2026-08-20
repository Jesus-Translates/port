"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { suggestUsername } from "@/lib/username";
import { cn } from "@/lib/utils";

/**
 * Create an account and its first member in one form.
 *
 * Still no PRICE picker — the fastest way to lose someone is to ask them to
 * choose a tier before they have seen a lesson, so money stays a conversation
 * for later. But "just me" or "my family" is not a pricing question, it is a
 * question about who is learning, and getting it wrong costs more than asking:
 * signing up alone used to mean inventing a family name and landing on a
 * four-seat household to use one seat.
 */
export function SignupForm({ siteKey }: { siteKey: string }) {
  const router = useRouter();
  const [plan, setPlan] = useState<"family" | "individual">("family");
  const [form, setForm] = useState({
    familyName: "",
    displayName: "",
    username: "",
    email: "",
    password: "",
  });
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Suggest a username from the first name, until they type their own. */
  function setName(displayName: string) {
    const auto = suggestUsername(displayName);
    setForm((f) => ({
      ...f,
      displayName,
      username: f.username === autoFrom(f.displayName) ? auto : f.username,
    }));
  }
  const autoFrom = suggestUsername;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan, turnstileToken: token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível criar a conta.");
        setBusy(false);
        return;
      }
      router.push(data.next ?? "/bem-vindo");
      router.refresh();
    } catch {
      setError("Sem ligação. Tenta outra vez.");
      setBusy(false);
    }
  }

  const field =
    "mt-1 w-full rounded-xl border border-sand bg-white/80 px-3.5 py-2.5 text-base text-ink placeholder:text-ink-faint focus:border-sage focus:ring-2 focus:ring-sage-light focus:outline-none sm:text-[15px]";

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div>
        <span className="label">Quem vai aprender? · Who is learning?</span>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {(
            [
              { id: "family", pt: "A minha família", en: "My family" },
              { id: "individual", pt: "Só eu", en: "Just me" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPlan(opt.id)}
              aria-pressed={plan === opt.id}
              className={cn(
                "tap-44 rounded-xl border px-3 py-2.5 text-left transition-all",
                plan === opt.id
                  ? "border-olive bg-sage-pale"
                  : "border-sand bg-white/70 hover:border-sage"
              )}
            >
              <span className="block text-[15px] font-medium">{opt.pt}</span>
              <span className="block text-xs text-ink-faint">{opt.en}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Only a household needs a household name. A solo account is named
          after the person, so asking would be asking them to invent one. */}
      {plan === "family" ? (
        <label className="block">
          <span className="label">Nome da família · Family name</span>
          <input
            value={form.familyName}
            onChange={(e) => setForm({ ...form, familyName: e.target.value })}
            placeholder="Família Silva"
            required
            maxLength={60}
            className={field}
          />
        </label>
      ) : null}

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

      <div className="grid gap-4 sm:grid-cols-2">
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
            className={field}
          />
        </label>
        <label className="block">
          <span className="label">Email (opcional)</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="ana@exemplo.pt"
            autoCapitalize="off"
            className={field}
          />
        </label>
      </div>

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

      {siteKey ? (
        <Turnstile siteKey={siteKey} onSuccess={setToken} options={{ theme: "light" }} />
      ) : null}

      {error && <p className="text-sm text-terra-dark">{error}</p>}

      <button
        type="submit"
        disabled={busy || (Boolean(siteKey) && !token)}
        className="btn-primary w-full"
      >
        {busy ? "A criar…" : "Criar a minha família →"}
      </button>

      <p className="text-center text-xs text-ink-soft">
        Já tens conta?{" "}
        <Link href="/login" className="underline underline-offset-2 hover:text-olive">
          Entrar
        </Link>
      </p>
      <p className="text-center text-xs text-ink-faint">
        A seguir: um teste rápido de nível e cinco perguntas. Depois começas.
      </p>
    </form>
  );
}
