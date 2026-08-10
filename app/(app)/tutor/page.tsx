import Link from "next/link";
import { AzulejoHeader } from "@/components/azulejo-header";
import { Chat } from "@/components/chat";
import { requireSession } from "@/lib/auth";
import { getHouseholdSettings } from "@/lib/actions/household-settings";

export const metadata = { title: "Sandra" };

export default async function TutorPage(props: PageProps<"/tutor">) {
  await requireSession();
  const { q } = await props.searchParams;
  const initialInput = typeof q === "string" ? q : "";
  const { immersion } = await getHouseholdSettings();

  return (
    <div className="space-y-5">
      <AzulejoHeader
        title="Sandra"
        subtitle={
          immersion === "total"
            ? "Só português. Devagarinho."
            : "Pergunta em português ou em inglês."
        }
        trailing={
          <span className="grid size-[46px] shrink-0 place-items-center rounded-[15px] bg-terra-pale font-display text-[19px] font-semibold text-terra-dark">
            S
          </span>
        }
      />

      {/* Spoken practice is a different mode, not a different tutor — one tap
          from here rather than buried under Praticar. */}
      <Link
        href="/practice/conversa"
        className="card flex items-center gap-3 p-4 transition-colors hover:border-sage"
      >
        <span className="text-2xl" aria-hidden>
          🎙️
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[16.5px] font-medium">
            Falar com a Sandra
          </span>
          <span className="block text-xs text-ink-faint">
            Conversa a sério, com a tua voz — e pontos por cada resposta.
          </span>
        </span>
        <span className="text-ink-faint" aria-hidden>
          ›
        </span>
      </Link>

      {/* Chat needs a floor height on phones — a cramped scroll area is painful. */}
      <div className="card flex h-[calc(100dvh-24rem)] min-h-[24rem] flex-col p-4 sm:h-[calc(100dvh-22rem)]">
        <Chat
          initialInput={initialInput}
          tpcButton
          starters={[
            "Corrige: eu fazer o pequeno-almoço hoje",
            "Qual é a diferença entre ser e estar?",
            "Dá-me 5 frases úteis para o mercado",
            "Como se diz “I'm looking forward to it”?",
          ]}
        />
      </div>
    </div>
  );
}

