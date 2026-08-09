import { redirect } from "next/navigation";
import { count } from "drizzle-orm";
import { getSession, getValidUsers } from "@/lib/auth";
import { accounts, getDb } from "@/lib/db";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Entrar" };

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

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  const single = await isSingleHousehold();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-paper via-paper to-sage-pale px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl" aria-hidden>
            🇵🇹
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Bem-vindos de volta!
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            European Portuguese, com a Sandra
          </p>
        </div>
        <LoginForm
          users={single ? getValidUsers() : []}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
        />
      </div>
    </div>
  );
}
