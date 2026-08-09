"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { Chat } from "@/components/chat";
import { deleteNote, updateNote } from "@/lib/actions/notes";

export function NoteEditor({
  note,
}: {
  note: {
    id: number;
    title: string;
    body: string;
    tags: string;
    author: string;
  };
}) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [tags, setTags] = useState(note.tags);
  const [saved, setSaved] = useState(true);
  const [pending, startTransition] = useTransition();
  const [sandraOpen, setSandraOpen] = useState(false);
  // Edits made while a save is in flight must not be marked as saved.
  const editCounter = useRef(0);

  function save() {
    const sentAt = editCounter.current;
    startTransition(async () => {
      await updateNote(note.id, { title, body, tags });
      if (editCounter.current === sentAt) setSaved(true);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/notes" className="text-xs text-ink-faint hover:text-olive">
          ← Notas
        </Link>
        <span className="chip capitalize">por {note.author}</span>
        <div className="flex-1" />
        <span className="text-xs text-ink-faint">
          {pending ? "A guardar…" : saved ? "Guardado ✓" : "Por guardar"}
        </span>
        <button className="btn-primary" onClick={save} disabled={pending || saved}>
          Guardar
        </button>
        <button
          className="btn-ghost"
          onClick={() => {
            if (confirm("Apagar esta nota?")) {
              startTransition(() => deleteNote(note.id));
            }
          }}
        >
          Apagar
        </button>
      </div>

      <input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          editCounter.current += 1;
          setSaved(false);
        }}
        className="input font-display !text-2xl font-semibold"
        placeholder="Título"
      />
      <textarea
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          editCounter.current += 1;
          setSaved(false);
        }}
        rows={14}
        className="input resize-y font-mono !text-[14px] leading-relaxed"
        placeholder={"Escreve aqui…\n\nMarkdown welcome: **bold**, lists, etc."}
      />
      <input
        value={tags}
        onChange={(e) => {
          setTags(e.target.value);
          editCounter.current += 1;
          setSaved(false);
        }}
        className="input"
        placeholder="tags, separadas, por vírgulas"
      />

      <section className="card p-4">
        <button
          className="flex w-full items-center justify-between"
          onClick={() => setSandraOpen((o) => !o)}
        >
          <span className="font-semibold">👩‍🏫 Pergunta à Sandra sobre esta nota</span>
          <span className="text-ink-faint">{sandraOpen ? "▴" : "▾"}</span>
        </button>
        {sandraOpen ? (
          <div className="mt-3">
            <Chat
              compact
              context={`The learner's note titled "${title}":\n\n${body}`}
              starters={[
                "Corrige o português desta nota",
                "Explica melhor esta gramática",
                "Dá-me mais exemplos como estes",
                "Faz-me 3 perguntas sobre esta matéria",
              ]}
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
