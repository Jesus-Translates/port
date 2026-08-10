"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createHousehold,
  deleteHousehold,
  moveMember,
  renameHousehold,
  setHouseholdPlan,
  setMemberRole,
  type Household,
} from "@/lib/actions/households";

const PLAN_LABEL: Record<string, string> = {
  free: "Grátis",
  individual: "Individual",
  family: "Família",
};

const ROLE_LABEL: Record<string, string> = {
  owner: "Dono",
  parent: "Adulto",
  child: "Criança",
};

/**
 * Families, and who is in them.
 *
 * Deliberately separate from the people panel: that one manages members
 * INSIDE one household and is open to a family's own admin. This is instance
 * work — creating families, changing plans, moving somebody between them —
 * and a family's owner must never see another family here.
 */
export function HouseholdsAdmin({ households }: { households: Household[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState<number | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, okText: string) {
    setNote(null);
    start(async () => {
      const r = await fn();
      setNote({ ok: r.ok, text: r.ok ? okText : (r.error ?? "Não deu.") });
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {note && (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${
            note.ok ? "bg-sage-pale text-olive" : "bg-terra-pale text-terra-dark"
          }`}
        >
          {note.text}
        </p>
      )}

      <NewHousehold pending={pending} run={run} />

      <div className="space-y-3">
        {households.map((h) => {
          const over = h.members.length > h.seatLimit;
          return (
            <article key={h.id} className="card p-4">
              <header className="flex flex-wrap items-center gap-2">
                <span className="font-display text-lg font-semibold">{h.name}</span>
                <code className="rounded bg-white/80 px-1.5 py-0.5 text-2xs text-ink-soft">
                  {h.slug}
                </code>
                <span className="chip bg-cream text-ink-soft">
                  {PLAN_LABEL[h.plan] ?? h.plan}
                </span>
                <span
                  className={`chip ${
                    over ? "bg-terra-pale text-terra-dark" : "bg-cream text-ink-soft"
                  }`}
                >
                  {h.members.length}/{h.seatLimit} lugares
                  {over ? " · acima do plano" : ""}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(open === h.id ? null : h.id)}
                  className="ml-auto rounded-lg border border-sand px-2.5 py-1 text-xs hover:border-sage"
                >
                  {open === h.id ? "Fechar" : "Gerir"}
                </button>
              </header>

              <p className="mt-1 text-xs text-ink-faint">
                {h.members.length === 0
                  ? "Sem membros — podes apagá-la ou mover alguém para cá."
                  : h.members
                      .map(
                        (m) =>
                          `${m.displayName} (${ROLE_LABEL[m.role] ?? m.role})${m.active ? "" : " · desativado"}`
                      )
                      .join(" · ")}{" "}
                — desde {h.createdAt}
              </p>

              {open === h.id && (
                <div className="mt-4 space-y-4 border-t border-sand pt-4">
                  <Field
                    label="Nome da família"
                    initial={h.name}
                    action="Mudar"
                    pending={pending}
                    onSubmit={(v) =>
                      run(() => renameHousehold(h.id, v), `Agora chama-se ${v}.`)
                    }
                  />

                  <div className="flex flex-wrap items-end gap-2">
                    <label className="text-xs text-ink-soft">
                      Plano
                      <select
                        id={`plan-${h.id}`}
                        defaultValue={h.plan}
                        className="input mt-1 py-1.5"
                      >
                        {Object.entries(PLAN_LABEL).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs text-ink-soft">
                      Lugares
                      <input
                        id={`seats-${h.id}`}
                        type="number"
                        min={1}
                        max={50}
                        defaultValue={h.seatLimit}
                        className="input mt-1 w-24 py-1.5"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        const plan = (
                          document.getElementById(`plan-${h.id}`) as HTMLSelectElement
                        )?.value;
                        const seats = Number(
                          (document.getElementById(`seats-${h.id}`) as HTMLInputElement)
                            ?.value
                        );
                        run(
                          () => setHouseholdPlan(h.id, plan, seats),
                          "Plano atualizado."
                        );
                      }}
                      className="rounded-lg bg-olive px-3 py-2 text-sm font-medium text-paper hover:bg-ink disabled:opacity-50"
                    >
                      Guardar plano
                    </button>
                  </div>

                  {h.members.length > 0 && (
                    <div className="space-y-2">
                      <p className="label">Membros</p>
                      {h.members.map((m) => (
                        <div
                          key={m.username}
                          className="flex flex-wrap items-center gap-2 rounded-lg border border-sand bg-white/60 px-3 py-2"
                        >
                          <span className="text-sm font-medium">{m.displayName}</span>
                          <code className="text-2xs text-ink-faint">@{m.username}</code>

                          <select
                            defaultValue={m.role}
                            disabled={pending}
                            onChange={(e) =>
                              run(
                                () =>
                                  setMemberRole(
                                    m.username,
                                    e.target.value as "owner" | "parent" | "child"
                                  ),
                                `${m.displayName}: ${ROLE_LABEL[e.target.value]}.`
                              )
                            }
                            className="ml-auto rounded-lg border border-sand bg-white/80 px-2 py-1 text-xs"
                          >
                            {Object.entries(ROLE_LABEL).map(([k, v]) => (
                              <option key={k} value={k}>
                                {v}
                              </option>
                            ))}
                          </select>

                          {households.length > 1 && (
                            <select
                              defaultValue=""
                              disabled={pending}
                              onChange={(e) => {
                                const to = Number(e.target.value);
                                if (!to) return;
                                run(
                                  () => moveMember(m.username, to, m.role as "child"),
                                  `${m.displayName} mudou de família.`
                                );
                              }}
                              className="rounded-lg border border-sand bg-white/80 px-2 py-1 text-xs"
                            >
                              <option value="">mover para…</option>
                              {households
                                .filter((o) => o.id !== h.id)
                                .map((o) => (
                                  <option key={o.id} value={o.id}>
                                    {o.name}
                                  </option>
                                ))}
                            </select>
                          )}
                        </div>
                      ))}
                      <p className="text-2xs text-ink-faint">
                        Mover alguém leva o histórico com ela — cartões, progresso e
                        TPC são todos por utilizador. O que muda é quem a vê.
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={pending || h.members.length > 0}
                    title={
                      h.members.length > 0
                        ? "Move os membros primeiro — apagar deixaria-os sem família"
                        : ""
                    }
                    onClick={() =>
                      run(() => deleteHousehold(h.id), `${h.name} apagada.`)
                    }
                    className="rounded-lg border border-terra/40 px-3 py-2 text-sm text-terra-dark hover:bg-terra-pale disabled:opacity-40"
                  >
                    🗑️ Apagar família
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function NewHousehold({
  pending,
  run,
}: {
  pending: boolean;
  run: (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) => void;
}) {
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("family");
  const [seats, setSeats] = useState(6);

  return (
    <form
      className="card flex flex-wrap items-end gap-3 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        run(
          () => createHousehold({ name, plan, seatLimit: seats }),
          `${name} criada. Move alguém para lá, ou cria a pessoa em Contas.`
        );
        setName("");
      }}
    >
      <label className="min-w-48 flex-1 text-xs text-ink-soft">
        Nova família
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Família Silva"
          maxLength={60}
          className="input mt-1 py-2"
        />
      </label>
      <label className="text-xs text-ink-soft">
        Plano
        <select
          value={plan}
          onChange={(e) => {
            setPlan(e.target.value);
            setSeats(e.target.value === "individual" ? 1 : 6);
          }}
          className="input mt-1 py-2"
        >
          {Object.entries(PLAN_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-ink-soft">
        Lugares
        <input
          type="number"
          min={1}
          max={50}
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
          className="input mt-1 w-24 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending || !name.trim()}
        className="rounded-lg bg-olive px-3 py-2.5 text-sm font-medium text-paper hover:bg-ink disabled:opacity-50"
      >
        + Criar família
      </button>
    </form>
  );
}

function Field({
  label,
  initial,
  action,
  pending,
  onSubmit,
}: {
  label: string;
  initial: string;
  action: string;
  pending: boolean;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
    >
      <label className="min-w-48 flex-1 text-xs text-ink-soft">
        {label}
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input mt-1 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-sand px-3 py-2 text-sm hover:border-sage disabled:opacity-50"
      >
        {action}
      </button>
    </form>
  );
}
