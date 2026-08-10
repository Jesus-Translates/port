import { Suspense } from "react";
import { BilingualProvider } from "@/components/bilingual";
import { Nav } from "@/components/nav";
import { SpendChip } from "@/components/spend-chip";
import { getHouseholdSettings } from "@/lib/actions/household-settings";
import { envRole, roleOf, requireSession } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  // Read once here, not once per label — every screen below can ask.
  const { bilingual } = await getHouseholdSettings();
  return (
    <BilingualProvider value={bilingual}>
    <div className="min-h-dvh">
      <Nav
        displayName={session.displayName}
        showPanel={await roleOf(session.username) !== "student"}
        // Running costs are an operator's business. A family sees their
        // PLAN on /conta, not what their lesson cost to generate.
        spendSlot={
          envRole(session.username) === "admin" ? (
            <Suspense fallback={null}>
              <SpendChip username={session.username} />
            </Suspense>
          ) : null
        }
      />
      {/* pb-28 on phones keeps content clear of the fixed bottom tab bar. */}
      <main className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:pb-16">
        {children}
      </main>
    </div>
    </BilingualProvider>
  );
}
