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
// People live in lib/actions/users.ts — the same actions Contas uses, already
// scoped by manageScope()/canTouch(). Adding and removing someone from here is
// a second door onto them, not a second implementation.
import {
  createAccount,
  deleteAccountForever,
  setAccountActive,
} from "@/lib/actions/users";

const PLAN_LABEL: Record<string, string> = {
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
 * Instance work: creating families, changing plans, and managing the people
 * inside each one — adding, re-roling, moving, deactivating and deleting. It
 * is gated on ADMIN_USERS, and a family's own owner must never see another
 * family here.
 *
 * Contas (/admin/utilizadores) is the other door onto the same people, open to
 * a family's own admin for their household only. It owns the per-person
 * credential work — passwords, emails, usernames. This one is organised BY
 * FAMILY, because "who is in the Silva family, and take that one out" is a
 * question the flat roster answers badly.
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

                  <div className="space-y-2">
                    <p className="label">Membros</p>
                    {h.members.map((m) => (
                      <MemberRow
                        key={m.username}
                        member={m}
                        household={h}
                        households={households}
                        pending={pending}
                        run={run}
                      />
                    ))}
                    {h.members.length > 0 && (
                      <p className="text-2xs text-ink-faint">
                        Mover alguém leva o histórico com ela — cartões, progresso e
                        TPC são todos por utilizador. O que muda é quem a vê.
                      </p>
                    )}
                    <AddMember household={h} pending={pending} run={run} />
                  </div>

                  <button
                    type="button"
                    disabled={pending || h.members.length > 0}
                    title={
                      h.members.length > 0
                        ? "Move ou apaga os membros primeiro — apagar a família deixaria-os sem casa"
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

type Run = (
  fn: () => Promise<{ ok: boolean; error?: string }>,
  ok: string
) => void;

/**
 * One person, with everything that can be done to them from here.
 *
 * Removal is offered twice on purpose, and in this order: deactivating is
 * reversible and keeps their cards, homework and progress; deleting is not and
 * takes all of it. The destructive one stays folded away behind typing the
 * username, the same bar Contas sets — a family's child is exactly the account
 * somebody deletes by reflex while tidying up.
 */
function MemberRow({
  member: m,
  household: h,
  households,
  pending,
  run,
}: {
  member: Household["members"][number];
  household: Household;
  households: Household[];
  pending: boolean;
  run: Run;
}) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");

  return (
    <div className="space-y-2 rounded-lg border border-sand bg-white/60 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">{m.displayName}</span>
        <code className="text-2xs text-ink-faint">@{m.username}</code>
        {!m.active && (
          <span className="chip bg-cream text-ink-soft">desativado</span>
        )}

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
            value=""
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

        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(
              () => setAccountActive(m.username, !m.active),
              m.active
                ? `${m.displayName} desativada — o histórico fica.`
                : `${m.displayName} está de volta.`
            )
          }
          className="rounded-lg border border-sand px-2 py-1 text-xs hover:border-sage disabled:opacity-50"
        >
          {m.active ? "Desativar" : "Reativar"}
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setConfirming((v) => !v);
            setTyped("");
          }}
          className="rounded-lg border border-terra/40 px-2 py-1 text-xs text-terra-dark hover:bg-terra-pale disabled:opacity-50"
        >
          {confirming ? "Cancelar" : "Apagar"}
        </button>
      </div>

      {confirming && (
        <div className="space-y-2 rounded-lg bg-terra-pale/60 px-3 py-2">
          <p className="text-xs text-terra-dark">
            Isto apaga <strong>{m.displayName}</strong> e tudo o que é dela —
            cartões, progresso, TPC e histórico. Não há como voltar atrás.
            Escreve <code className="text-2xs">{m.username}</code> para
            confirmar.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={m.username}
              autoComplete="off"
              className="input w-48 py-1.5 text-xs"
            />
            <button
              type="button"
              disabled={pending || typed.trim().toLowerCase() !== m.username}
              onClick={() =>
                run(
                  () => deleteAccountForever(m.username, typed),
                  `${m.displayName} foi apagada.`
                )
              }
              className="rounded-lg bg-terra px-3 py-2 text-xs font-medium text-paper hover:bg-terra-dark disabled:opacity-40"
            >
              Apagar para sempre
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Add somebody straight into THIS family.
 *
 * createAccount() takes the household id, so the person lands in the right
 * family in one step. Without this the only route was to create them in your
 * own household and move them — two steps, and a moment where a stranger's
 * child sits in your family.
 */
function AddMember({
  household: h,
  pending,
  run,
}: {
  household: Household;
  pending: boolean;
  run: Run;
}) {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Membership role follows from this: createAccount puts a student in as
  // "child" and anyone else as "parent". Promote to Dono on the row above.
  const [role, setRole] = useState("student");

  const full = h.members.length >= h.seatLimit;

  if (!open) {
    return (
      <button
        type="button"
        disabled={pending || full}
        onClick={() => setOpen(true)}
        title={full ? "O plano desta família já tem todos os lugares ocupados" : ""}
        className="rounded-lg border border-sand px-3 py-2 text-sm hover:border-sage disabled:opacity-40"
      >
        ＋ Adicionar pessoa
        {full ? " — sem lugares" : ""}
      </button>
    );
  }

  return (
    <form
      className="space-y-3 rounded-lg border border-sage bg-sage-pale/40 px-3 py-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!displayName.trim() || !username.trim()) return;
        run(
          async () => {
            const r = await createAccount({
              displayName,
              username,
              email: email || undefined,
              password: password || undefined,
              role,
              accountId: h.id,
            });
            if (r.ok) {
              setDisplayName("");
              setUsername("");
              setEmail("");
              setPassword("");
              setOpen(false);
            }
            return r;
          },
          `${displayName} entrou para a ${h.name}.`
        );
      }}
    >
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-40 flex-1 text-xs text-ink-soft">
          Nome
          <input
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              // A sensible username, still editable — one less field to think
              // about for the common case.
              if (!username || username === suggestUsername(displayName)) {
                setUsername(suggestUsername(e.target.value));
              }
            }}
            placeholder="Jenni"
            maxLength={60}
            className="input mt-1 py-2"
          />
        </label>
        <label className="min-w-36 flex-1 text-xs text-ink-soft">
          Utilizador
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="jenni"
            autoComplete="off"
            className="input mt-1 py-2"
          />
        </label>
        <label className="text-xs text-ink-soft">
          Papel
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input mt-1 py-2"
          >
            <option value="student">Criança</option>
            <option value="teacher">Adulto</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-40 flex-1 text-xs text-ink-soft">
          Email <span className="text-ink-faint">(opcional)</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jenni@exemplo.pt"
            className="input mt-1 py-2"
          />
        </label>
        <label className="min-w-40 flex-1 text-xs text-ink-soft">
          Palavra-passe <span className="text-ink-faint">(opcional)</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="fica com a partilhada"
            className="input mt-1 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={pending || !displayName.trim() || !username.trim()}
          className="rounded-lg bg-olive px-3 py-2.5 text-sm font-medium text-paper hover:bg-ink disabled:opacity-50"
        >
          Adicionar
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setOpen(false)}
          className="rounded-lg border border-sand px-3 py-2 text-sm hover:border-sage"
        >
          Cancelar
        </button>
      </div>
      <p className="text-2xs text-ink-faint">
        Sem palavra-passe, entra com a partilhada da casa e escolhe a sua
        depois. {h.members.length}/{h.seatLimit} lugares ocupados.
      </p>
    </form>
  );
}

/** "Maria João" → "mariajoao": lowercase, unaccented, letters and digits only. */
function suggestUsername(displayName: string): string {
  return displayName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 32);
}

function NewHousehold({
  pending,
  run,
}: {
  pending: boolean;
  run: Run;
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
