"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
function LoginFormInner({ siteKey }: { siteKey: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  return (
    <form onSubmit={submit} className="card space-y-5 p-6">
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
