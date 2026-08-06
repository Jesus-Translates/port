"use client";

import { useState } from "react";
import { addCategory } from "@/lib/actions/reference";

export function CategoryForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button className="btn-ghost" onClick={() => setOpen(true)}>
        + Nova categoria
      </button>
    );
  }

  return (
    <form
      action={addCategory}
      className="card flex w-full flex-wrap items-end gap-2 p-3 sm:w-auto"
    >
      <div>
        <label className="label">Nome (pt)</label>
        <input name="namePt" className="input" placeholder="Praia" required />
      </div>
      <div>
        <label className="label">Name (en)</label>
        <input name="nameEn" className="input" placeholder="Beach" required />
      </div>
      <div className="w-20">
        <label className="label">Emoji</label>
        <input name="emoji" className="input" placeholder="🏖️" />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary">
          Criar
        </button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
