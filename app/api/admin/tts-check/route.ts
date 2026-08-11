import { NextResponse } from "next/server";
import { getSession, isOperator } from "@/lib/auth";
import { buildSessionSsml } from "@/lib/ls";
import { azureConfigured, azureTrySsml, azureVoices, ssmlFor, ssmlSegments } from "@/lib/tts";

export const maxDuration = 60;

/**
 * Admin health check for text-to-speech.
 *
 * One bad name in the voice rotation rejects the WHOLE SSML document, so a
 * single failing voice silently kills every multi-voice feature (Listen &
 * Speak, dialogues) while single-voice playback keeps working. This probes
 * each voice on its own, then in the mixed EN+PT shape those features use,
 * and reports Azure's own error text for each.
 */
export async function GET() {
  const session = await getSession();
  if (!session || !(await isOperator(session.username))) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (!azureConfigured()) {
    return NextResponse.json({ error: "O Azure não está configurado." }, { status: 503 });
  }

  const voices = azureVoices();
  const probes: { name: string; ssml: string }[] = [];

  for (const voice of voices) {
    probes.push({ name: `solo: ${voice}`, ssml: ssmlFor("Bom dia, tudo bem?", voice) });
  }
  // The shape Listen & Speak actually sends: English prompt, pause, pt-PT answer.
  for (const voice of voices) {
    probes.push({
      name: `mixed EN + ${voice}`,
      ssml: ssmlSegments([
        { text: "Where is the bus stop?", voice: "en-US-JennyNeural", rate: "1.0", breakAfterMs: 4500 },
        { text: "Onde fica a paragem do autocarro?", voice, rate: "0.9", breakAfterMs: 1500 },
      ]),
    });
  }

  // Size probes. A full Listen & Speak session is 20 cards; Azure caps a
  // document at 50 <voice> elements, and the builder emits two per segment.
  const card = (i: number) => ({
    front: `Where is the bus stop number ${i}?`,
    back: `Onde fica a paragem do autocarro número ${i}?`,
  });
  for (const n of [4, 8, 12, 20]) {
    const { docs } = buildSessionSsml(Array.from({ length: n }, (_, i) => card(i)));
    docs.forEach((ssml, part) => {
      probes.push({
        name: `session ${n} cards${docs.length > 1 ? ` p${part + 1}` : ""} (${(ssml.match(/<voice/g) ?? []).length} voice tags)`,
        ssml,
      });
    });
  }

  const results = [];
  for (const probe of probes) {
    const r = await azureTrySsml(probe.ssml);
    results.push({ probe: probe.name, ok: r.ok, status: r.status, bytes: r.bytes, detail: r.detail });
  }

  const bad = results.filter((r) => !r.ok);
  return NextResponse.json({
    voices,
    healthy: bad.length === 0,
    failing: bad.map((r) => r.probe),
    results,
  });
}
