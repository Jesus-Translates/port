"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type IngestResult = {
  added: { pt: string; en: string; categorySlug: string; categoryPt: string }[];
  skipped: number;
  truncated: boolean;
};

/** Paste anything (or attach a file) and Luna files it into the right categories. */
export function IngestPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IngestResult | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function submit() {
    const file = fileRef.current?.files?.[0];
    if (!text.trim() && !file) {
      setError("Escreve alguma coisa ou anexa um ficheiro.");
      return;
    }
    setPending(true);
    setError(null);
    setResult(null);
    try {
      let res: Response;
      if (file) {
        const form = new FormData();
        form.append("file", file);
        if (text.trim()) form.append("text", text);
        res = await fetch("/api/ai/ingest", { method: "POST", body: form });
      } else {
        res = await fetch("/api/ai/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setText("");
      setFileName(null);
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falhou — tenta outra vez.");
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button className="btn-terra" onClick={() => setOpen(true)}>
        📥 Ingerir conteúdo
      </button>
    );
  }

  return (
    <div className="card w-full space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">📥 Ingerir para o livro</h2>
        <button
          className="text-xs text-ink-faint hover:text-terra"
          onClick={() => setOpen(false)}
        >
          fechar ✕
        </button>
      </div>
      <p className="text-xs text-ink-soft">
        Cola palavras, frases ou notas — em inglês ou português — ou anexa um
        ficheiro (.txt, .md, .csv, .pdf). A Luna corrige para pt-PT, define e
        arruma tudo na categoria certa.
      </p>
      <textarea
        className="input min-h-24 w-full"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"ex.:\ncutting board\na toalha\nOnde fica a paragem do autocarro?"}
        maxLength={20000}
        disabled={pending}
      />
      <div className="flex flex-wrap items-center gap-2">
        <label className="btn-ghost cursor-pointer">
          📎 {fileName ?? "Anexar ficheiro"}
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.markdown,.csv,.tsv,.pdf,text/plain,application/pdf"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            disabled={pending}
          />
        </label>
        <button className="btn-primary flex-1" onClick={submit} disabled={pending}>
          {pending ? "A Luna está a arrumar…" : "Processar e adicionar ✓"}
        </button>
      </div>

      {error ? (
        <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">{error}</p>
      ) : null}

      {result ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-olive">
            ✓ {result.added.length}{" "}
            {result.added.length === 1 ? "entrada adicionada" : "entradas adicionadas"}
            {result.skipped > 0 ? (
              <span className="font-normal text-ink-faint">
                {" "}
                · {result.skipped} ignoradas (repetidas ou não úteis)
              </span>
            ) : null}
            {result.truncated ? (
              <span className="font-normal text-ink-faint"> · texto encurtado</span>
            ) : null}
          </p>
          {result.added.length > 0 ? (
            <ul className="max-h-56 space-y-1 overflow-y-auto">
              {result.added.map((a, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">
                    <strong>{a.pt}</strong>
                    <span className="text-ink-soft"> — {a.en}</span>
                  </span>
                  <Link
                    href={`/reference/${a.categorySlug}`}
                    className="chip shrink-0 hover:border-sage"
                  >
                    {a.categoryPt}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
