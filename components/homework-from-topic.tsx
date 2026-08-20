"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bi } from "@/components/bilingual";

export function HomeworkFromTopic({
  topic,
  label,
  labelEn,
}: {
  topic: string;
  label: string;
  labelEn?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    try {
      const res = await fetch("/api/ai/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      if (!res.ok) throw new Error();
      const { id } = await res.json();
      router.push(`/homework/${id}`);
    } catch {
      setBusy(false);
      alert("A Sandra não respondeu. Tenta outra vez.");
    }
  }

  return (
    <button onClick={create} disabled={busy} className="btn-ghost text-sm">
      {busy ? (
        <Bi pt="A Sandra está a escrever…" en="Sandra is writing it…" inline />
      ) : labelEn ? (
        <Bi pt={label} en={labelEn} inline />
      ) : (
        label
      )}
    </button>
  );
}
