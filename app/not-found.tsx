import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-5xl" aria-hidden>
        🧭
      </div>
      <h2 className="font-display text-2xl font-semibold">
        Esta página perdeu-se…
      </h2>
      <p className="text-sm text-ink-soft">This page got lost. (404)</p>
      <Link href="/" className="btn-primary">
        Voltar ao início
      </Link>
    </div>
  );
}
