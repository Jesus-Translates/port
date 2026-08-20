"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Bi } from "@/components/bilingual";
import { deleteUnit, setUnitStatus, updateUnitNote } from "@/lib/actions/units";

/** Teacher controls that live on the unit itself: publish, unpublish, correct
 *  the AI's Learning Note, or throw the whole unit away. */
export function UnitReview({
  id,
  status,
  noteMd,
}: {
  id: number;
  status: string;
  noteMd: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draftNote, setDraftNote] = useState(noteMd);
  const published = status === "published";

  return (
    <section className="card space-y-3 border-azul/30 bg-azul-pale/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">👩‍🏫 Revisão da professora</span>
        <span className="text-xs text-ink-faint">
          Only you and the admin see this.
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {published ? (
          <button
            className="btn-ghost text-sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await setUnitStatus(id, "draft");
                router.refresh();
              })
            }
          >
            <Bi pt="↩︎ Voltar a rascunho" en="Back to draft" inline />
          </button>
        ) : (
          <button
            className="btn-primary text-sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await setUnitStatus(id, "published");
                router.refresh();
              })
            }
          >
            <Bi pt="✅ Publicar à turma" en="Publish to the class" inline />
          </button>
        )}

        <button
          className="btn-ghost text-sm"
          disabled={pending}
          onClick={() => {
            setDraftNote(noteMd);
            setEditing((e) => !e);
          }}
        >
          {editing ? (
            <Bi pt="Cancelar" en="Cancel" inline />
          ) : (
            <Bi pt="✏️ Editar nota" en="Edit note" inline />
          )}
        </button>

        <button
          className="btn-ghost ml-auto text-sm text-terra-dark"
          disabled={pending}
          onClick={() => {
            if (confirm("Apagar esta unidade e todas as suas atividades?")) {
              startTransition(async () => {
                await deleteUnit(id);
                router.push("/unidades");
              });
            }
          }}
        >
          <Bi pt="🗑️ Apagar" en="Delete" inline />
        </button>
      </div>

      {editing ? (
        <div className="space-y-2">
          <label className="label" htmlFor="unit-note">
            Nota de aprendizagem (markdown)
          </label>
          <textarea
            id="unit-note"
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            rows={16}
            maxLength={20000}
            className="input font-mono text-[13px]"
          />
          <div className="flex items-center gap-2">
            <button
              className="btn-primary text-sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await updateUnitNote(id, draftNote);
                  setEditing(false);
                  router.refresh();
                })
              }
            >
              {pending ? (
                <Bi pt="A guardar…" en="Saving…" inline />
              ) : (
                <Bi pt="Guardar nota" en="Save note" inline />
              )}
            </button>
            <span className="text-xs text-ink-faint">
              {draftNote.length}/20000
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
