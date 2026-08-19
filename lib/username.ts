/**
 * Username rules, in ONE place — the shape check, the reserved list, and the
 * client-side suggestion — with no database import, so client components and
 * server routes alike can use them.
 *
 * There used to be three reserved lists (this one's ancestors in
 * lib/actions/users.ts, lib/create-member.ts, and the signup route), none a
 * superset of the others, so the widest door — public signup — accepted names
 * the invite flow reserved. That is how someone registered the username
 * `conta` or `perfil`: real route segments a username must never shadow.
 */

/**
 * Names a username must never take. Route segments (a username that shadows a
 * route breaks that route's links), plus the auth verbs and the JS footguns.
 * The union of every list this replaced.
 */
export const RESERVED = new Set([
  "admin", "api", "login", "logout", "registar", "signup", "practice",
  "unidades", "homework", "quizzes", "reference", "familia", "placement",
  "stories", "escutar", "jogos", "missoes", "tutor", "notes", "workbook",
  "verbos", "ouvir", "gastos", "me", "new", "bem-vindo", "null", "undefined",
  "convite", "conta", "perfil", "progresso", "palavras", "livro",
]);

/** Null when the username is legal, else a Portuguese reason it is not. */
export function usernameProblem(username: string): string | null {
  if (!/^[a-z0-9][a-z0-9._-]{1,31}$/.test(username)) {
    return "Nome de utilizador: 2-32 caracteres, letras minúsculas e números.";
  }
  if (RESERVED.has(username)) {
    return "Esse nome de utilizador está reservado.";
  }
  return null;
}

/**
 * A legal username suggested from a display name — accents folded, non-alnum
 * dropped, capped at the 32-char server limit (one copy used to cap at 20 and
 * quietly truncate longer names differently from the others). Still editable;
 * this only fills the field.
 */
export function suggestUsername(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 32);
}
