import { Nav } from "@/components/nav";
import { requireSession } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  return (
    <div className="min-h-dvh">
      <Nav displayName={session.displayName} />
      {/* pb-28 on phones keeps content clear of the fixed bottom tab bar. */}
      <main className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:pb-16">
        {children}
      </main>
    </div>
  );
}
