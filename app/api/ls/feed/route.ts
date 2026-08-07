import { desc, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { getValidUsers } from "@/lib/auth";
import { getDb, lsSessions } from "@/lib/db";
import { verifyLsToken } from "@/lib/ls";
import { azureConfigured } from "@/lib/tts";

/**
 * A personal podcast feed of the last few Listen & Speak sessions.
 *
 * PUBLIC path (see PUBLIC_PATHS in proxy.ts) — podcast apps have no cookie,
 * so the signed ?t= token is the credential, both here and on each enclosure.
 */

const FEED_ITEMS = 5;

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function displayName(username: string): string {
  const match = getValidUsers().find((u) => u.toLowerCase() === username);
  return match ?? username.charAt(0).toUpperCase() + username.slice(1);
}

function sessionLabel(createdAt: Date, cardCount: number): string {
  const when = new Date(createdAt).toLocaleString("pt-PT", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Lisbon",
  });
  const cards = cardCount === 1 ? "1 cartão" : `${cardCount} cartões`;
  return `Sessão de ${when} (${cards})`;
}

export async function GET(request: NextRequest) {
  if (!azureConfigured()) {
    return NextResponse.json(
      {
        error:
          "Listen & Speak precisa das variáveis AZURE_SPEECH_KEY e AZURE_SPEECH_REGION.",
      },
      { status: 503 }
    );
  }

  const token = request.nextUrl.searchParams.get("t");
  const username = await verifyLsToken(token);
  if (!username || !token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const rows = await getDb()
    .select({
      id: lsSessions.id,
      cardCount: lsSessions.cardCount,
      bytes: lsSessions.bytes,
      createdAt: lsSessions.createdAt,
    })
    .from(lsSessions)
    .where(eq(lsSessions.username, username))
    .orderBy(desc(lsSessions.createdAt), desc(lsSessions.id))
    .limit(FEED_ITEMS);

  const origin = request.nextUrl.origin;
  const name = displayName(username);
  const selfUrl = `${origin}/api/ls/feed?t=${encodeURIComponent(token)}`;
  const title = `Português — Listen & Speak (${name})`;
  const description =
    "Sessões geradas a partir dos teus cartões de revisão: ouves a pergunta em inglês, respondes em voz alta, e confirmas em português europeu.";

  const items = rows
    .map((r) => {
      const audioUrl = `${origin}/api/ls/audio?id=${r.id}&t=${encodeURIComponent(token)}`;
      return `    <item>
      <title>${xmlEscape(sessionLabel(r.createdAt, r.cardCount))}</title>
      <description>${xmlEscape(description)}</description>
      <guid isPermaLink="false">ls-${r.id}</guid>
      <pubDate>${new Date(r.createdAt).toUTCString()}</pubDate>
      <enclosure url="${xmlEscape(audioUrl)}" type="audio/mpeg" length="${r.bytes}" />
      <itunes:explicit>false</itunes:explicit>
    </item>`;
    })
    .join("\n");

  const latest = rows[0]?.createdAt;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(title)}</title>
    <link>${xmlEscape(`${origin}/practice/audio`)}</link>
    <description>${xmlEscape(description)}</description>
    <language>pt-PT</language>
    <atom:link href="${xmlEscape(selfUrl)}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date(latest ?? Date.now()).toUTCString()}</lastBuildDate>
    <itunes:author>Portuguese Hub</itunes:author>
    <itunes:explicit>false</itunes:explicit>
    <itunes:block>yes</itunes:block>
${items}
  </channel>
</rss>
`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // Private and always changing — never let a proxy keep a copy.
      "Cache-Control": "private, no-store",
    },
  });
}
