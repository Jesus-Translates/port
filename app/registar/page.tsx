import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/signup-form";
import { getSession } from "@/lib/auth";

export const metadata = {
  title: "Criar conta",
  description: "European Portuguese for your whole family, with Sandra.",
};

export default async function SignupPage() {
  if (await getSession()) redirect("/");

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-paper via-paper to-sage-pale px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mb-3 text-5xl" aria-hidden>
            🇵🇹
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Começa a tua família
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            European Portuguese for everyone at home — one course each, pitched
            at what they can actually do.
          </p>
        </div>
        <SignupForm siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""} />
        <p className="mt-6 text-center text-xs text-ink-faint">
          <Link href="/login" className="hover:text-olive">
            ← voltar
          </Link>
        </p>
      </div>
    </div>
  );
}
