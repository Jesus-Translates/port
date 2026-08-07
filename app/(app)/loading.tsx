/**
 * One skeleton for every page in the (app) group.
 *
 * Every page here is a dynamic server component awaiting several Neon
 * queries — the dashboard awaits seven. Without this, tapping a nav tab on a
 * phone showed nothing at all until the server replied. Any route that wants
 * a closer-fitting skeleton can add its own loading.tsx and it wins.
 */
function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-sand/70 ${className}`} />;
}

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">A carregar…</span>

      <header className="space-y-2">
        <Bar className="h-7 w-48" />
        <Bar className="h-4 w-full max-w-md" />
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card space-y-2 p-4">
            <Bar className="h-7 w-7 rounded-xl" />
            <Bar className="h-4 w-3/4" />
            <Bar className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
