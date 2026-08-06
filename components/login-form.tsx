"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { cn } from "@/lib/utils";

function LoginFormInner({
  users,
  siteKey,
}: {
  users: string[];
  siteKey: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!username) {
      setError("Escolhe o teu nome. (Pick your name.)");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, turnstileToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Algo correu mal. Tenta outra vez.");
        setBusy(false);
        return;
      }
      const next = searchParams.get("next");
      // Same-origin paths only ("//host" would leave the site).
      router.push(next && /^\/(?!\/)/.test(next) ? next : "/");
      router.refresh();
    } catch {
      setError("Sem ligação. Tenta outra vez. (Connection problem.)");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-6">
      <div>
        <span className="label">Quem és tu? · Who are you?</span>
        <div className="grid grid-cols-3 gap-2">
          {users.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUsername(u)}
              className={cn(
                "rounded-xl border px-2 py-3 text-center transition-all",
                username === u
                  ? "border-olive bg-olive text-paper shadow"
                  : "border-sand bg-white/70 text-ink hover:border-sage hover:bg-sage-pale"
              )}
            >
              <div className="text-2xl" aria-hidden>
                {u === "Kelly" ? "👩‍🏫" : u === "Jenni" ? "🌻" : "🏄"}
              </div>
              <div className="mt-1 text-sm font-semibold">{u}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="password">
          Palavra-passe · Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </div>

      {siteKey ? (
        <Turnstile
          siteKey={siteKey}
          onSuccess={setTurnstileToken}
          onExpire={() => setTurnstileToken(null)}
          options={{ size: "flexible" }}
        />
      ) : null}

      {error ? (
        <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "A entrar…" : "Entrar"}
      </button>
    </form>
  );
}

export function LoginForm(props: { users: string[]; siteKey: string }) {
  // useSearchParams needs a Suspense boundary
  return (
    <Suspense fallback={null}>
      <LoginFormInner {...props} />
    </Suspense>
  );
}
