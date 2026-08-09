"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendTestEmail } from "@/lib/actions/email";

/**
 * Sends one test message to the ADMIN'S OWN address — the only inbox whose
 * consent we can be certain of. There is deliberately no "send to" field: a
 * test button that mails arbitrary addresses is a spam cannon.
 */
export function TestEmailButton({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending || !configured}
        onClick={() =>
          start(async () => {
            const r = await sendTestEmail();
            setNote({
              ok: r.ok,
              text: r.ok
                ? "Enviado — vê a tua caixa de entrada."
                : (r.error ?? "Não deu para enviar."),
            });
            router.refresh();
          })
        }
        className="rounded-lg border border-sand px-3 py-2 text-sm hover:border-sage disabled:opacity-50"
      >
        {pending ? "A enviar…" : "Enviar teste para mim"}
      </button>
      {!configured && (
        <p className="text-xs text-ink-faint">
          Adiciona RESEND_API_KEY e EMAIL_FROM para ativar.
        </p>
      )}
      {note && (
        <p className={`text-xs ${note.ok ? "text-olive" : "text-terra"}`}>
          {note.text}
        </p>
      )}
    </div>
  );
}
