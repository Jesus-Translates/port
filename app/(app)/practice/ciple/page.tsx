import Link from "next/link";
import { CipleActions } from "@/components/ciple-actions";
import { requireSession } from "@/lib/auth";

export const metadata = { title: "CIPLE" };

export default async function CiplePage() {
  await requireSession();
  return (
    <div className="space-y-6">
      <header>
        <Link href="/practice" className="text-xs text-ink-faint hover:text-olive">
          ← Praticar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          🎓 Preparação CIPLE
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          CIPLE is the official A2 Portuguese exam (CAPLE, Univ. de Lisboa) used
          for residency and nationality. Pass mark: 55% overall and at least 25%
          in every component. Practice below mirrors the real task shapes.
        </p>
      </header>

      <CipleActions />

      <section className="card space-y-2 p-4 text-sm text-ink-soft">
        <h2 className="font-semibold text-ink">Bom saber (lei de 2026)</h2>
        <p>
          A Lei Orgânica n.º 1/2026 mantém o A2 como requisito geral de
          nacionalidade, exige B1 nalgumas vias novas, e acrescenta uma prova de
          cultura e história — daí o cartão 🇵🇹 acima. Menores de 18 anos estão
          isentos do CIPLE (há versões jovens: CIPLE-e e TEJO).
        </p>
        <p className="text-xs text-ink-faint">
          Confirm the current rules with IRN/AIMA before planning around them —
          details change and this app is not legal advice. Official exam info:
          caple.letras.ulisboa.pt · ~€85 per sitting.
        </p>
      </section>
    </div>
  );
}
