"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAccount } from "@/lib/actions/users";
import { finishFamilyStep } from "@/lib/actions/profile";

/**
 * Onboarding step four: fill the seats the family is already paying for.
 *
 * The plan is sold by the seat, yet nothing in the flow ever asked about the
 * other people — the only way to add a child was an admin console a parent has
 * no reason to open. This asks once, at the moment the buyer is thinking about
 * their household anyway, and stays honest about being optional: "sou só eu"
 * is a real answer, not a failure state.
 *
 * Creation goes through the existing createAccount server action — it already
 * enforces seat limits, username rules and household scoping. This component
 * adds nothing to that contract; it only makes the door visible.
 */

type Added = { displayName: string; username: string };

/** "Ana Sofia" → "anasofia": a legal username suggestion, still editable. */
function suggestUsername(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // drop the accents, keep the letters
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 32);
}

export function FamilyStep({
  seatLimit,
  seatsUsed,
  members,
}: {
  seatLimit: number;
  seatsUsed: number;
  /** Everyone already in the household, the buyer included. */
  members: { username: string; displayName: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [added, setAdded] = useState<Added[]>([]);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  // Once they type their own username, stop overwriting it from the name.
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [isAdult, setIsAdult] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);

  const seatsFree = Math.max(0, seatLimit - seatsUsed - added.length);
  const full = seatsFree === 0;

  function add() {
    setError(null);
    const displayName = name.trim();
    const user = username.trim().toLowerCase();
    if (!displayName || !user) {
      setError("Falta o nome ou o nome de utilizador.");
      return;
    }
    start(async () => {
      try {
        const r = await createAccount({
          displayName,
          username: user,
          email: email.trim() || undefined,
          // An adult can manage the family (seats, passwords); a child just
          // learns. createAccount maps these onto the membership roles.
          role: isAdult ? "admin" : "student",
        });
        if (!r.ok) {
          setError(r.error);
          return;
        }
        setAdded((list) => [...list, { displayName, username: user }]);
        setName("");
        setUsername("");
        setUsernameTouched(false);
        setEmail("");
        setIsAdult(false);
      } catch {
        setError("Não deu para criar a conta. Tenta outra vez.");
      }
    });
  }

  function finish() {
    setError(null);
    setFinishing(true);
    start(async () => {
      try {
        await finishFamilyStep();
        router.refresh();
      } catch {
        setFinishing(false);
        setError("Não deu para guardar. Tenta outra vez.");
      }
    });
  }

  return (
    <section className="card space-y-4 p-6">
      <p className="text-sm text-ink-soft">
        O vosso plano tem{" "}
        <strong>
          {seatLimit} {seatLimit === 1 ? "lugar" : "lugares"}
        </strong>{" "}
        — cada pessoa fica com o seu progresso, os seus cartões e o seu nível.
      </p>

      {/* Who is here already, and who was just added — progress a parent can
          see while working through three children. */}
      <ul className="space-y-1.5 text-sm">
        {members.map((m) => (
          <li key={m.username} className="flex items-center gap-2">
            <span aria-hidden>👤</span>
            <span className="font-medium">{m.displayName}</span>
            <span className="text-xs text-ink-faint">· {m.username}</span>
          </li>
        ))}
        {added.map((m) => (
          <li key={m.username} className="flex items-center gap-2 text-sage">
            <span aria-hidden>✅</span>
            <span className="font-medium">{m.displayName}</span>
            <span className="text-xs text-ink-faint">
              · {m.username} — conta criada
            </span>
          </li>
        ))}
      </ul>

      {full ? (
        <p className="rounded-xl border border-sand bg-white/70 p-3 text-sm text-ink-soft">
          A família está completa —{" "}
          {seatLimit === 1
            ? "o lugar do plano já está ocupado"
            : `os ${seatLimit} lugares do plano já estão todos ocupados`}
          . Podes gerir os lugares mais tarde em <strong>Conta</strong>.
        </p>
      ) : (
        <div className="space-y-3 rounded-xl border border-sand bg-white/70 p-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold">Adicionar alguém</h3>
            <span className="text-xs text-ink-faint">
              {seatsFree === 1
                ? "resta 1 lugar"
                : `restam ${seatsFree} lugares`}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-ink-soft">
              Nome · shown in the app
              <input
                type="text"
                value={name}
                placeholder="Ana"
                autoComplete="off"
                onChange={(e) => {
                  setName(e.target.value);
                  if (!usernameTouched) {
                    setUsername(suggestUsername(e.target.value));
                  }
                }}
                className="mt-1 w-full rounded-lg border border-sand bg-white/80 px-3 py-2 text-sm text-ink"
              />
            </label>
            <label className="text-xs text-ink-soft">
              Nome de utilizador · to sign in
              <input
                type="text"
                value={username}
                placeholder="ana"
                autoComplete="off"
                onChange={(e) => {
                  setUsernameTouched(true);
                  setUsername(e.target.value);
                }}
                className="mt-1 w-full rounded-lg border border-sand bg-white/80 px-3 py-2 text-sm text-ink"
              />
            </label>
            <label className="text-xs text-ink-soft sm:col-span-2">
              Email (opcional)
              <input
                type="email"
                value={email}
                placeholder="ana@exemplo.pt"
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-sand bg-white/80 px-3 py-2 text-sm text-ink"
              />
              <span className="mt-1 block text-2xs text-ink-faint">
                As crianças normalmente não têm — não faz falta. Serve só para
                lembretes e para recuperar o acesso.
              </span>
            </label>
          </div>

          <div className="flex gap-2">
            {(
              [
                [false, "🧒 Criança"],
                [true, "🧑 Adulto"],
              ] as const
            ).map(([adult, label]) => (
              <button
                key={label}
                type="button"
                onClick={() => setIsAdult(adult)}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  isAdult === adult
                    ? "border-sage bg-sage-pale"
                    : "border-sand bg-white hover:border-sage"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-2xs text-ink-faint">
            Um adulto também pode gerir a família. Todos entram com a
            palavra-passe partilhada até definirem uma própria em Contas.
          </p>

          {error && <p className="text-xs text-terra">{error}</p>}

          <button
            type="button"
            onClick={add}
            disabled={pending}
            className="rounded-lg bg-olive px-3 py-2 text-sm font-medium text-paper hover:bg-ink disabled:opacity-50"
          >
            {pending && !finishing ? "A criar…" : "+ Adicionar"}
          </button>
        </div>
      )}

      {full && error && <p className="text-xs text-terra">{error}</p>}

      {added.length > 0 || full ? (
        <button
          type="button"
          onClick={finish}
          disabled={pending}
          className="btn-primary w-full"
        >
          {finishing ? "A guardar…" : "Concluir →"}
        </button>
      ) : (
        <button
          type="button"
          onClick={finish}
          disabled={pending}
          className="block w-full text-center text-sm text-ink-soft underline underline-offset-2 hover:text-olive"
        >
          {finishing ? "A guardar…" : "Por agora sou só eu — continuar"}
        </button>
      )}
    </section>
  );
}
