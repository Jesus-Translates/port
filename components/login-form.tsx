"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";

function LoginFormInner({ siteKey }: { siteKey: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // A dead magic link redirects here with ?erro=link. One deliberately vague
  // message for expired, used, and invented tokens alike — the link holder
  // learns nothing except "get a fresh one".
  const cameFromDeadLink = searchParams.get("erro") === "link";
  const [mode, setMode] = useState<"password" | "magic">(
    cameFromDeadLink ? "magic" : "password"
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const [error, setError] = useState<string | null>(
    cameFromDeadLink
      ? "That sign-in link is no longer valid. Request a fresh one below."
      : null
  );
  const [busy, setBusy] = useState(false);

  function switchMode(next: "password" | "magic") {
    setMode(next);
    setError(null);
    setSent(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      setError("Enter your username or email.");
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
        setError(data.error ?? "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      const next = searchParams.get("next");
      // Same-origin paths only ("//host" would leave the site).
      router.push(next && /^\/(?!\/)/.test(next) ? next : "/");
      router.refresh();
    } catch {
      setError("No connection. Please try again.");
      setBusy(false);
    }
  }

  async function submitMagic(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/magic/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken }),
      });
      const data = await res.json().catch(() => ({}));
      // Turnstile tokens are single-use server-side; get a fresh one either way.
      setTurnstileToken(null);
      turnstileRef.current?.reset();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      setSent(true);
      setBusy(false);
    } catch {
      setError("No connection. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="card space-y-5 p-6">
      {mode === "password" ? (
        <form onSubmit={submit} className="space-y-5">
          <div>
            <span className="label">Who are you?</span>
            {/*
              A typed username, never a list of faces.
              The picker was an UNAUTHENTICATED page enumerating every active
              account on the instance. For one family that was a nice touch; for a
              multi-tenant deployment it is a public directory of your customers,
              and it hands an attacker the valid half of every credential pair.
              The field accepts a username or an email, same as the server.
            */}
            <input
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username or email"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="username"
              required
              className="input w-full"
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
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
              ref={turnstileRef}
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
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : sent ? (
        // The same words whether the address has an account or not — the
        // server answers identically on purpose, and so does this screen.
        <div className="space-y-3 text-center">
          <div className="text-4xl" aria-hidden>
            📬
          </div>
          <p className="text-sm leading-relaxed text-ink-soft">
            If that address has an account, a sign-in link is on its way. It
            works once and expires in 15 minutes — check your inbox.
          </p>
          <button
            type="button"
            onClick={() => switchMode("magic")}
            className="text-sm font-medium text-olive underline underline-offset-2"
          >
            Send another link
          </button>
        </div>
      ) : (
        <form onSubmit={submitMagic} className="space-y-5">
          <div>
            <label className="label" htmlFor="magic-email">
              Email
            </label>
            <input
              id="magic-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full"
              placeholder="you@example.com"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="email"
              required
            />
            <p className="mt-1.5 text-xs text-ink-faint">
              We&apos;ll email you a one-time link — no password needed.
            </p>
          </div>

          {siteKey ? (
            <Turnstile
              ref={turnstileRef}
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
            {busy ? "Sending…" : "Email me a sign-in link"}
          </button>
        </form>
      )}

      <div className="border-t border-sand pt-4 text-center">
        {mode === "password" ? (
          <button
            type="button"
            onClick={() => switchMode("magic")}
            className="text-sm font-medium text-olive underline underline-offset-2"
          >
            Entrar com um link por email
          </button>
        ) : (
          <button
            type="button"
            onClick={() => switchMode("password")}
            className="text-sm font-medium text-olive underline underline-offset-2"
          >
            Sign in with a password instead
          </button>
        )}
      </div>
    </div>
  );
}

export function LoginForm(props: { siteKey: string }) {
  // useSearchParams needs a Suspense boundary
  return (
    <Suspense fallback={null}>
      <LoginFormInner {...props} />
    </Suspense>
  );
}
