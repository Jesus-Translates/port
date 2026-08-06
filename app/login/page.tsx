import { redirect } from "next/navigation";
import { getSession, getValidUsers } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Entrar" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

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
            The family Portuguese hub · Santa Cruz
          </p>
        </div>
        <LoginForm
          users={getValidUsers()}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
        />
      </div>
    </div>
  );
}
