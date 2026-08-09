import Link from "next/link";
import { createNote } from "@/lib/actions/notes";
import { requireSession } from "@/lib/auth";
import { getNotesAll } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Notas" };

export default async function NotesPage() {
  await requireSession();
  const notes = await getNotesAll();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          📝 Notas da família
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Shared study notes — everyone can read, add and improve them. Sandra can
          explain, correct and expand any note.
        </p>
      </header>

      <form action={createNote} className="card flex items-end gap-2 p-4">
        <div className="flex-1">
          <label className="label" htmlFor="note-title">
            Nova nota
          </label>
          <input
            id="note-title"
            name="title"
            className="input"
            placeholder="ex.: Verbos reflexivos"
            required
          />
        </div>
        <button type="submit" className="btn-primary">
          Criar
        </button>
      </form>

      {notes.length === 0 ? (
        <p className="card p-8 text-center text-sm text-ink-soft">
          Ainda não há notas. Cria a primeira! ↑
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((n) => (
            <Link
              key={n.id}
              href={`/notes/${n.id}`}
              className="card group flex flex-col p-4 transition-all hover:border-sage hover:shadow-md"
            >
              <h2 className="leading-snug font-semibold group-hover:text-olive">
                {n.title}
              </h2>
              <p className="mt-1.5 line-clamp-3 flex-1 text-sm whitespace-pre-wrap text-ink-soft">
                {n.body || "…"}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="chip capitalize">{n.username}</span>
                {n.tags
                  ? n.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((t) => (
                        <span key={t} className="chip">
                          {t}
                        </span>
                      ))
                  : null}
                <span className="ml-auto text-[11px] text-ink-faint">
                  {formatDate(n.updatedAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
