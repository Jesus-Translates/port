import { NextResponse, type NextRequest } from "next/server";
import { getSession, isOperator } from "@/lib/auth";
import {
  diagnoseClips,
  estimateCostUsd,
  revoiceClip,
  wouldDemote,
  type RevoiceResult,
} from "@/lib/revoice";
import { azureConfigured } from "@/lib/tts";

export const maxDuration = 300;

/**
 * Repair listening clips whose speakers were given a wrong-gender voice.
 *
 * This endpoint exists because the Azure credentials live only in the deployed
 * environment — the same repair is available as `npm run clips:revoice`, but
 * that cannot synthesize anywhere the keys are absent. Running it here means
 * running it where Azure and R2 are both configured, against the real data.
 *
 *   GET  — diagnose only. Costs nothing, changes nothing.
 *   POST — re-synthesize. Spends Azure credits and overwrites stored audio.
 *
 * Instance operators only, like every other /api/admin route.
 */

async function guard() {
  const session = await getSession();
  if (!session || !(await isOperator(session.username))) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return null;
}

function report(clips: Awaited<ReturnType<typeof diagnoseClips>>) {
  return clips.map((c) => ({
    id: c.id,
    title: c.title,
    storage: c.audioKey ? "r2" : "inline",
    wrong: c.wrong,
    speakers: c.speakers.map((s) => ({
      name: s.name,
      gender: s.gender,
      from: s.from,
      to: s.to,
      wrong: s.wrong,
    })),
  }));
}

export async function GET(request: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  const all = request.nextUrl.searchParams.get("all") === "1";
  const clips = await diagnoseClips({ all });

  return NextResponse.json({
    azureConfigured: azureConfigured(),
    // Named blockers rather than a bare "can't": the whole point of this
    // endpoint is that it runs where the CLI cannot.
    blockedBy: [
      ...(azureConfigured() ? [] : ["AZURE_SPEECH_KEY / AZURE_SPEECH_REGION"]),
      ...(wouldDemote(clips).length > 0 ? ["R2 not configured here"] : []),
    ],
    needsRepair: clips.length,
    estimatedCostUsd: Number(estimateCostUsd(clips).toFixed(4)),
    clips: report(clips),
  });
}

export async function POST(request: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  if (!azureConfigured()) {
    return NextResponse.json(
      { error: "O Azure não está configurado neste ambiente." },
      { status: 503 }
    );
  }

  const idParam = request.nextUrl.searchParams.get("id");
  const id = idParam ? Number(idParam) : undefined;
  const all = request.nextUrl.searchParams.get("all") === "1";
  const clips = await diagnoseClips({
    id: Number.isInteger(id) ? id : undefined,
    all,
  });

  // Refuse rather than move R2-hosted audio back into Postgres and delete the
  // object — that would silently undo the audio migration.
  const demote = wouldDemote(clips);
  if (demote.length > 0) {
    return NextResponse.json(
      {
        error:
          "O R2 não está configurado aqui — regravar moveria o áudio de volta para a base de dados.",
        clips: demote.map((c) => c.id),
      },
      { status: 503 }
    );
  }

  if (clips.length === 0) {
    return NextResponse.json({ repaired: 0, results: [], message: "Nada a corrigir." });
  }

  const results: RevoiceResult[] = [];
  for (const clip of clips) {
    try {
      results.push(await revoiceClip(clip));
    } catch (e) {
      results.push({ ok: false, id: clip.id, error: (e as Error).message });
    }
  }

  return NextResponse.json({
    repaired: results.filter((r) => r.ok).length,
    attempted: results.length,
    results,
  });
}
