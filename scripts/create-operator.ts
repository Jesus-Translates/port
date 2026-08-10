/**
 * Create (or promote) a PLATFORM OPERATOR — an administrator who belongs to no
 * family and can see every one of them.
 *
 * A script rather than a screen, because of the bootstrap: only an operator may
 * open the admin panel, so the first one cannot be created from inside it.
 *
 * The distinction this exists to enforce:
 *
 *   users.role = "admin"   → runs THEIR OWN household. /registar sets it on
 *                            everyone who signs up a family, so it is held by
 *                            every customer and grants nothing across families.
 *   users.is_operator      → runs the DEPLOYMENT. Sees every household. Belongs
 *                            to none, and is excluded from the orphan sweep so
 *                            they never appear in a family's roster.
 *
 *   npm run admin:create -- --username=ana --name="Ana Operadora" [--email=…]
 *   npm run admin:create -- --username=ana --revoke
 *
 * The password is NOT taken on the command line — it would land in shell
 * history and in the process list. The account is created without one and uses
 * the shared password until its owner sets their own in Perfil.
 */
import { eq } from "drizzle-orm";
import { getDb, memberships, users } from "../lib/db";

/**
 * Route segments and words a username must never shadow.
 *
 * Mirrors the list the signup route and Contas enforce. The script bypassed
 * them once and happily created a user called "admin" — legal to the database,
 * forbidden everywhere a human could have typed it.
 */
const RESERVED = new Set([
  "admin", "api", "login", "logout", "registar", "signup", "practice",
  "unidades", "homework", "quizzes", "reference", "familia", "placement",
  "stories", "escutar", "jogos", "missoes", "tutor", "notes", "workbook",
  "verbos", "ouvir", "gastos", "conta", "palavras", "progresso", "perfil",
  "me", "new", "bem-vindo", "null", "undefined",
]);

const args = process.argv.slice(2);
function arg(name: string): string | null {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
}
const REVOKE = args.includes("--revoke");
const username = (arg("username") ?? "").trim().toLowerCase();
const displayName = (arg("name") ?? "").trim();
const email = (arg("email") ?? "").trim().toLowerCase() || null;

async function main() {
  if (!/^[a-z0-9][a-z0-9._-]{1,31}$/.test(username)) {
    console.error(
      "✗ --username is required: 2-32 chars, lowercase letters, digits, . _ -"
    );
    process.exit(1);
  }
  if (RESERVED.has(username) && !REVOKE) {
    console.error(
      `✗ "${username}" is reserved — it shadows a route or a keyword.\n` +
        "  Try something like --username=operador or your own name."
    );
    process.exit(1);
  }

  const db = getDb();
  const [existing] = await db
    .select({
      username: users.username,
      displayName: users.displayName,
      isOperator: users.isOperator,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (REVOKE) {
    if (!existing) {
      console.error(`✗ no account called ${username}`);
      process.exit(1);
    }
    await db
      .update(users)
      .set({ isOperator: false })
      .where(eq(users.username, username));
    console.log(`✓ ${username} is no longer a platform operator.`);
    console.log("  The account still exists — delete it in Contas if you want it gone.");
    return;
  }

  if (existing) {
    // Promoting an existing person is allowed, but say plainly what it means:
    // if they are in a family, they will now see every OTHER family too.
    const [membership] = await db
      .select({ accountId: memberships.accountId })
      .from(memberships)
      .where(eq(memberships.username, username))
      .limit(1);

    await db
      .update(users)
      .set({ isOperator: true })
      .where(eq(users.username, username));
    console.log(`✓ ${username} is now a platform operator.`);
    if (membership) {
      console.log(
        "  ! This account BELONGS TO A FAMILY. It can now see every other\n" +
          "    family on the instance. For a clean separation, make a dedicated\n" +
          "    operator account with no membership instead."
      );
    }
    return;
  }

  if (!displayName) {
    console.error('✗ --name is required when creating a new account, e.g. --name="Ana Operadora"');
    process.exit(1);
  }

  await db.insert(users).values({
    username,
    displayName,
    email,
    // No password: they sign in with the shared one and set their own in
    // Perfil. A password passed as an argument would sit in shell history.
    passwordHash: null,
    // NOT "admin": that word means "runs a household" and this account has
    // none. Operator status is the is_operator flag alone.
    role: "student",
    isOperator: true,
    mode: "full",
  });

  // Deliberately NO membership row. This account belongs to no family, which
  // is the whole point — and orphanUsernames() skips operators, so it will not
  // surface in anyone's roster or be adoptable.
  console.log(`✓ Created operator "${username}" (${displayName}).`);
  console.log("  · Belongs to no family, and will not appear in any family's roster.");
  console.log("  · Signs in with the shared password; set a real one in Perfil.");
  console.log("  · Sees every household: /admin, /admin/familias, /admin/relatorios, /gastos.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
