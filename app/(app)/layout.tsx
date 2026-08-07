import { Nav } from "@/components/nav";
import { requireSession } from "@/lib/auth";
import { formatEur, getSpend } from "@/lib/usage";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  let spendEur: string | undefined;
  try {
    spendEur = formatEur((await getSpend(session.username)).monthEur);
  } catch {
    // Usage table may not exist yet — the app must still render.
  }
  return (
    <div className="min-h-dvh">
      <Nav displayName={session.displayName} spendEur={spendEur} />
      {/* pb-28 on phones keeps content clear of the fixed bottom tab bar. */}
      <main className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:pb-16">
        {children}
      </main>
    </div>
  );
}
