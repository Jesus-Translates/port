import { Chat } from "@/components/chat";
import { requireSession } from "@/lib/auth";

export const metadata = { title: "Sandra" };

export default async function TutorPage(props: PageProps<"/tutor">) {
  await requireSession();
  const { q } = await props.searchParams;
  const initialInput = typeof q === "string" ? q : "";

  return (
    // Chat needs a floor height on phones — a cramped scroll area is painful.
    <div className="flex h-[calc(100dvh-15rem)] min-h-[26rem] flex-col sm:h-[calc(100dvh-13rem)]">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          👩‍🏫 Sandra, a vossa tutora
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Ask in English or Portuguese — Sandra corrects gently and always answers
          in European Portuguese style.
        </p>
      </header>
      <div className="card min-h-0 flex-1 p-4">
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
