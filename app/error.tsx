"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-5xl" aria-hidden>
        😬
      </div>
      <h2 className="font-display text-2xl font-semibold">Que chatice!</h2>
      <p className="max-w-md text-sm text-ink-soft">
        Something went wrong. {error.digest ? `(${error.digest})` : ""}
      </p>
      <button onClick={reset} className="btn-primary">
        Tentar outra vez
      </button>
    </div>
  );
}
