import { notFound } from "next/navigation";
import { NoteEditor } from "@/components/note-editor";
import { requireSession } from "@/lib/auth";
import { getNote } from "@/lib/data";

export default async function NotePage(props: PageProps<"/notes/[id]">) {
  await requireSession();
  const { id } = await props.params;
  const noteId = Number(id);
  if (!Number.isInteger(noteId)) notFound();
  const note = await getNote(noteId);
  if (!note) notFound();

  return (
    <NoteEditor
      note={{
        id: note.id,
        title: note.title,
        body: note.body,
        tags: note.tags,
        author: note.username,
      }}
    />
  );
}
