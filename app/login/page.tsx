import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Sign in" };

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
        <LoginForm siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""} />
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
