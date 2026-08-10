import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, count } from "drizzle-orm";
import { getSession, getValidUsers } from "@/lib/auth";
import { accounts, getDb, users } from "@/lib/db";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Sign in" };

/**
 * Tap-your-face sign-in is lovely for one family and unacceptable for many:
 * the avatar row is an unauthenticated page listing every account on the
 * instance, which for a second customer is a directory of the first one's
 * household.
 *
 * So it survives exactly as long as it is harmless. One household, one shared
 * front door — the family keeps the experience they like. The moment a second
 * household exists, the picker disappears and everyone types who they are.
 */
async function isSingleHousehold(): Promise<boolean> {
  try {
    const [row] = await getDb().select({ n: count() }).from(accounts);
    return Number(row?.n ?? 0) <= 1;
  } catch {
    // If we cannot tell, assume many and show nobody.
    return false;
  }
}

/**
 * The faces to show on the picker, from the DATABASE.
 *
 * This used to read VALID_USERS — an environment variable — so anyone added
 * through the admin panel had no face to tap and could not sign in at all,
 * even though checkCredentials would have accepted them. The env list stays as
 * a fallback for the case it was actually meant for: the database being
 * unreachable.
 */
async function signInFaces(): Promise<string[]> {
  try {
    const rows = await getDb()
      .select({ username: users.username, active: users.active })
      .from(users)
      .orderBy(asc(users.createdAt));
    const names = rows.filter((r) => r.active).map((r) => r.username);
    return names.length > 0 ? names : getValidUsers();
  } catch {
    return getValidUsers();
  }
}

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  const [single, faces] = await Promise.all([isSingleHousehold(), signInFaces()]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-paper via-paper to-sage-pale px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl" aria-hidden>
            🇵🇹
          </div>
          {/*
            The door is in ENGLISH, on purpose.
            Everything past it is European Portuguese, including the immersion
            setting a family can turn on — but nobody has opted into anything
            yet at this point. Someone locked out of their account should not
            have to parse a second language to get back in, and a new adult
            arriving from an invite has no idea what "Bem-vindos de volta"
            means. The Portuguese starts once you are through.
          */}
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            European Portuguese, with Sandra
          </p>
        </div>
        {/* A login page with no way to sign up is a door with no handle. */}
        <LoginForm
          users={single ? faces : []}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
        />
        <p className="mt-6 text-center text-sm text-ink-soft">
          No account yet?{" "}
          <Link
            href="/registar"
            className="font-medium text-olive underline underline-offset-2"
          >
            Create your family
          </Link>
        </p>
      </div>
    </div>
  );
}
