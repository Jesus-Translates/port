import Link from "next/link";
import { Conversa } from "@/components/conversa";
import { UnitReturn } from "@/components/unit-return";
import { getMyCefr } from "@/lib/actions/profile";
import { requireSession } from "@/lib/auth";
import { unitContextFrom } from "@/lib/unit-context";

export const metadata = { title: "Conversa" };

export default async function ConversaPage(
  props: PageProps<"/practice/conversa">
) {
  await requireSession();
  const sp = await props.searchParams;
  const { tema } = sp;
  const unit = await unitContextFrom(sp);
  const cefr = await getMyCefr();

  return (
    <div className="space-y-6">
      <UnitReturn unit={unit} />

      <header>
        <Link href="/practice" className="text-xs text-ink-faint hover:text-olive">
          ← Praticar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">💬 Conversa</h1>
        <p className="mt-1 text-sm text-ink-soft">
          A real back-and-forth with Sandra: she speaks, you answer out loud. She
          gently reuses the corrected forms as you go — the full list of
          corrections arrives at the end, straight into your review deck.
        </p>
      </header>

      <Conversa
        cefr={cefr}
        initialTopic={typeof tema === "string" ? tema.slice(0, 200) : ""}
        unit={unit}
      />
    </div>
  );
}
