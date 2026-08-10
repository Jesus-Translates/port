"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

/** Sign out, from Perfil. The nav bar has its own copy for desktop. */
export function SignOut() {
  const router = useRouter();
  const [busy, start] = useTransition();

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() =>
        start(async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push("/login");
          router.refresh();
        })
      }
      className="btn-ghost w-full text-ink-faint"
    >
      {busy ? "A sair…" : "Terminar sessão"}
    </button>
  );
}
