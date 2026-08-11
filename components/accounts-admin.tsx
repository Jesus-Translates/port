"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adoptOrphans,
  clearAccountPassword,
  createAccount,
  deleteAccountForever,
  renameAccount,
  setAccountActive,
  setAccountEmail,
  setAccountMode,
  setAccountPassword,
  setAccountRole,
  type Account,
} from "@/lib/actions/users";

type Result = { ok: true } | { ok: false; error: string };

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  teacher: "Professora",
  student: "Aluno",
};

export function AccountsAdmin({
  accounts,
  me,
  orphans = [],
  households = [],
}: {
  accounts: Account[];
  me: string;
  /** Usernames with no household — shown so they cannot stay invisible. */
  orphans?: string[];
  /**
   * Every family, for instance operators only. Empty for a family's own
   * admin, whose new people always join their own household.
   */
  households?: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState<string | null>(null);
  const [note, setNote] = useState<{ kind: "ok" | "bad"; text: string } | null>(
    null
  );

  /** Every mutation reports through one place, so no action can fail silently. */
  function run(fn: () => Promise<Result | void>, okText: string) {
    setNote(null);
    start(async () => {
      const r = (await fn()) ?? { ok: true as const };
      if (r.ok) {
        setNote({ kind: "ok", text: okText });
        router.refresh();
      } else {
        setNote({ kind: "bad", text: r.error });
      }
    });
  }

  return (
    <div className="space-y-5">
      {note && (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${
            note.kind === "ok"
              ? "bg-sage-pale text-olive"
              : "bg-terra-pale text-terra-dark"
          }`}
        >
          {note.text}
        </p>
      )}

      {orphans.length > 0 && (
        <section className="rounded-xl border border-terra/40 bg-terra-pale/50 p-4">
          <h2 className="text-sm font-semibold text-terra-dark">
            ⚠️ {orphans.length}{" "}
            {orphans.length === 1 ? "pessoa sem família" : "pessoas sem família"}
          </h2>
          <p className="mt-1 text-xs text-ink-soft">
            {orphans.join(", ")} — conseguem entrar, mas não aparecem no quadro
            da família nem podem receber TPC. Contas criadas antes de a
            inscrição existir.
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await adoptOrphans();
                setNote(
                  r.ok
                    ? { kind: "ok", text: `${r.adopted} adotada(s) para a tua família.` }
                    : { kind: "bad", text: r.error }
                );
                router.refresh();
              })
            }
            className="mt-3 rounded-lg bg-olive px-3 py-2 text-sm font-medium text-paper hover:bg-ink disabled:opacity-50"
          >
            Adotar para a minha família
          </button>
        </section>
      )}

      <NewAccount pending={pending} run={run} households={households} />

      <div className="space-y-3">
        {accounts.map((a) => (
          <article
            key={a.username}
            className={`rounded-xl border p-4 ${
              a.active ? "border-sand bg-white/70" : "border-sand/60 bg-white/40"
            }`}
          >
            <header className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{a.displayName}</span>
              <code className="rounded bg-white/80 px-1.5 py-0.5 text-xs text-ink-soft">
                @{a.username}
              </code>
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-ink-soft">
                {ROLE_LABEL[a.role] ?? a.role}
              </span>
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-ink-soft">
                {a.mode === "simple" ? "🌱 guiado" : "⚙️ completo"}
              </span>
              {!a.hasOwnPassword && (
                <span className="rounded-full bg-terra-pale px-2 py-0.5 text-xs text-terra-dark">
                  palavra-passe partilhada
                </span>
              )}
              {!a.active && (
                <span className="rounded-full bg-terra-pale px-2 py-0.5 text-xs text-terra-dark">
                  desativado
                </span>
              )}
              {a.username === me && (
                <span className="rounded-full bg-sage-pale px-2 py-0.5 text-xs text-olive">
                  tu
                </span>
              )}
              <button
                type="button"
                onClick={() => setOpen(open === a.username ? null : a.username)}
                className="ml-auto rounded-lg border border-sand px-2.5 py-1 text-xs hover:border-sage"
              >
                {open === a.username ? "Fechar" : "Gerir"}
              </button>
            </header>

            <p className="mt-1 text-xs text-ink-faint">
              {a.email ?? "sem email"} · desde {a.createdAt}
            </p>

            {open === a.username && (
              <div className="mt-4 space-y-4 border-t border-sand pt-4">
                <Field
                  label="Nome de utilizador · used to sign in"
                  hint="Muda o nome em todas as tabelas de uma só vez."
                  initial={a.username}
                  action="Mudar"
                  pending={pending}
                  onSubmit={(v) =>
                    run(() => renameAccount(a.username, v), `Agora é @${v}.`)
                  }
                />
                <Field
                  label="Email"
                  initial={a.email ?? ""}
                  type="email"
                  action="Guardar"
                  pending={pending}
                  onSubmit={(v) =>
                    run(() => setAccountEmail(a.username, v), "Email guardado.")
                  }
                />
                <Field
                  label="Nova palavra-passe"
                  hint="Mínimo 8 caracteres. Diz-lha tu — a app não a envia."
                  initial=""
                  type="password"
                  action="Definir"
                  pending={pending}
                  onSubmit={(v) =>
                    run(
                      () => setAccountPassword(a.username, v),
                      `Palavra-passe de ${a.displayName} definida.`
                    )
                  }
                />

                <div className="flex flex-wrap gap-2">
                  <select
                    defaultValue={a.role}
                    disabled={pending}
                    onChange={(e) =>
                      run(
                        () => setAccountRole(a.username, e.target.value),
                        "Papel atualizado."
                      )
                    }
                    className="rounded-lg border border-sand bg-white/80 px-2 py-1.5 text-sm"
                  >
                    <option value="student">Aluno</option>
                    <option value="teacher">Professora</option>
                    <option value="admin">Administrador</option>
                  </select>

                  <select
                    defaultValue={a.mode}
                    disabled={pending}
                    onChange={(e) =>
                      run(
                        () => setAccountMode(a.username, e.target.value),
                        "Modo atualizado."
                      )
                    }
                    className="rounded-lg border border-sand bg-white/80 px-2 py-1.5 text-sm"
                  >
                    <option value="simple">🌱 Guiado</option>
                    <option value="full">⚙️ Completo</option>
                  </select>

                  {a.hasOwnPassword && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        run(
                          () => clearAccountPassword(a.username),
                          "Voltou à palavra-passe partilhada."
                        )
                      }
                      className="rounded-lg border border-sand px-2.5 py-1.5 text-sm hover:border-sage disabled:opacity-50"
                    >
                      Repor palavra-passe partilhada
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={pending || a.username === me}
                    title={
                      a.username === me ? "Não te podes desativar a ti próprio" : ""
                    }
                    onClick={() =>
                      run(
                        () => setAccountActive(a.username, !a.active),
                        a.active ? "Conta desativada." : "Conta reativada."
                      )
                    }
                    className="rounded-lg border border-sand px-2.5 py-1.5 text-sm hover:border-sage disabled:opacity-40"
                  >
                    {a.active ? "Desativar" : "Reativar"}
                  </button>
                </div>

                <DangerZone
                  account={a}
                  disabled={pending || a.username === me}
                  onConfirm={(typed) =>
                    run(
                      () => deleteAccountForever(a.username, typed),
                      `${a.displayName} e todos os seus dados foram apagados.`
                    )
                  }
                />
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  initial,
  action,
  type = "text",
  pending,
  onSubmit,
}: {
  label: string;
  hint?: string;
  initial: string;
  action: string;
  type?: string;
  pending: boolean;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSubmit(value.trim());
      }}
    >
      <label className="flex-1 min-w-[14rem] text-xs text-ink-soft">
        {label}
        {hint && <span className="block text-ink-faint">{hint}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          className="mt-1 w-full rounded-lg border border-sand bg-white/80 px-3 py-2 text-sm text-ink"
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

/**
 * Deleting takes the account's homework, cards and history with it, so it is
 * gated behind typing the username — and deactivating is offered first as the
 * reversible way to remove somebody.
 */
function DangerZone({
  account,
  disabled,
  onConfirm,
}: {
  account: Account;
  disabled: boolean;
  onConfirm: (typed: string) => void;
}) {
  const [armed, setArmed] = useState(false);
  const [typed, setTyped] = useState("");

  if (!armed) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setArmed(true)}
        className="text-xs text-terra-dark underline underline-offset-2 disabled:opacity-40"
      >
        Apagar definitivamente…
      </button>
    );
  }
  return (
    <div className="rounded-lg border border-terra/40 bg-terra-pale/60 p-3">
      <p className="text-xs text-terra-dark">
        Isto apaga <strong>{account.displayName}</strong> e todo o seu trabalho —
        TPC, cartões, histórico. Não há como voltar atrás. Escreve{" "}
        <code>{account.username}</code> para confirmar.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={account.username}
          className="flex-1 min-w-[10rem] rounded-lg border border-sand bg-white/80 px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={disabled || typed.trim().toLowerCase() !== account.username}
          onClick={() => onConfirm(typed.trim())}
          className="rounded-lg bg-terra px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Apagar
        </button>
        <button
          type="button"
          onClick={() => {
            setArmed(false);
            setTyped("");
          }}
          className="rounded-lg border border-sand px-3 py-2 text-sm"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function NewAccount({
  pending,
  run,
  households = [],
}: {
  pending: boolean;
  run: (fn: () => Promise<Result | void>, okText: string) => void;
  households?: { id: number; name: string }[];
}) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    username: "",
    email: "",
    password: "",
    role: "student",
    /*
     * Start on the first family, not on 0.
     *
     * The picker below rendered `form.accountId || households[0].id`, so it
     * DISPLAYED the first family while the form still held 0. Fill in a name,
     * don't touch the dropdown, submit — and createAccount() got no accountId,
     * fell back to the caller's own household, and an operator has none. The
     * screen showed a family selected and then refused to use it.
     */
    accountId: households[0]?.id ?? 0,
  });

  if (!show) {
    return (
      <button
        type="button"
        onClick={() => setShow(true)}
        className="rounded-lg bg-olive px-3 py-2 text-sm font-medium text-paper hover:bg-ink"
      >
        + Adicionar pessoa
      </button>
    );
  }

  return (
    <form
      className="space-y-3 rounded-xl border border-sand bg-white/70 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          const r = await createAccount(form);
          if (r.ok) {
            // Keep the chosen family: adding three children to the same
            // household should not mean re-picking it three times.
            setForm((f) => ({
              displayName: "",
              username: "",
              email: "",
              password: "",
              role: "student",
              accountId: f.accountId,
            }));
            setShow(false);
          }
          return r;
        }, "Conta criada.");
      }}
    >
      <h3 className="text-sm font-semibold">Nova pessoa</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            ["displayName", "Nome · shown in the app", "text", "Ana"],
            ["username", "Nome de utilizador · to sign in", "text", "ana"],
            ["email", "Email (opcional)", "email", "ana@exemplo.pt"],
            ["password", "Palavra-passe (opcional)", "password", "mínimo 8"],
          ] as const
        ).map(([key, label, type, placeholder]) => (
          <label key={key} className="text-xs text-ink-soft">
            {label}
            <input
              type={type}
              value={form[key]}
              placeholder={placeholder}
              autoComplete="off"
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="mt-1 w-full rounded-lg border border-sand bg-white/80 px-3 py-2 text-sm text-ink"
            />
          </label>
        ))}
        <label className="text-xs text-ink-soft">
          Papel
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="mt-1 w-full rounded-lg border border-sand bg-white/80 px-3 py-2 text-sm"
          >
            <option value="student">Aluno</option>
            <option value="teacher">Professora</option>
            <option value="admin">Administrador</option>
          </select>
        </label>

        {/* Only an instance operator gets a list here at all — for a family
            admin it is empty and the picker never appears. It used to require
            MORE THAN ONE family, which meant that on an instance with a single
            family the operator saw no picker, sent no accountId, and could not
            create anybody. An operator has to say which family every time,
            even when there is only one to say. */}
        {households.length > 0 ? (
          <label className="text-xs text-ink-soft">
            Família
            <select
              value={form.accountId || households[0].id}
              onChange={(e) =>
                setForm({ ...form, accountId: Number(e.target.value) })
              }
              className="mt-1 w-full rounded-lg border border-sand bg-white/80 px-3 py-2 text-sm"
            >
              {households.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <p className="text-xs text-ink-faint">
        Sem palavra-passe própria, a pessoa entra com a palavra-passe partilhada
        da família até tu lhe definires uma.
      </p>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-olive px-3 py-2 text-sm font-medium text-paper hover:bg-ink disabled:opacity-50"
        >
          Criar
        </button>
        <button
          type="button"
          onClick={() => setShow(false)}
          className="rounded-lg border border-sand px-3 py-2 text-sm"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
