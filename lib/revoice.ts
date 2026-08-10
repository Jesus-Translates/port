import { eq } from "drizzle-orm";
import { audioKey, blobConfigured, deleteAudio, putAudio } from "@/lib/blob";
import { getDb, listeningClips } from "@/lib/db";
import {
  alignTranscript,
  transcribeWordTimings,
  type ScriptLine,
} from "@/lib/listening";
import {
  assignSpeakerVoices,
  azureSynthesizeDocs,
  azureVoices,
  ptGender,
  ssmlSegmentDocs,
  voiceGender,
} from "@/lib/tts";

/**
 * Finding and repairing listening clips whose speakers got the wrong gender
 * of voice.
 *
 * Until 2026-08-10 the dialogue generator assigned voices by ORDER OF
 * APPEARANCE — `voices[speakers.indexOf(name) % voices.length]` — against a
 * mixed-gender pool. In "A família da Sandra" the speakers appear as Sandra,
 * Ana, Miguel and the pool runs Raquel(f), Duarte(m), Fernanda(f), so Ana was
 * read by a man. In a listening exercise that is not a blemish: the learner is
 * being asked to follow who says what.
 *
 * The generator is fixed, but audio is stored per clip, so existing clips keep
 * the wrong voices until re-synthesized.
 *
 * This lives in lib/ rather than in the script because the Azure credentials
 * are only present in the deployed environment — so the repair has to be
 * runnable from an admin route as well as from a terminal.
 */

export type SpeakerPlan = {
  name: string;
  gender: "f" | "m";
  /** The voice the existing audio was made with. */
  from: string;
  /** The voice it should have. */
  to: string;
  wrong: boolean;
};

export type ClipDiagnosis = {
  id: number;
  title: string;
  speakers: SpeakerPlan[];
  /** Names whose stored audio has the wrong gender. */
  wrong: string[];
  /** Non-null when the audio lives in R2 rather than inline. */
  audioKey: string | null;
  chars: number;
  script: ScriptLine[];
};

type StoredLine = { speaker?: string; text?: string; translation?: string };

/**
 * Diagnose clips against the OLD assignment, reproduced exactly.
 *
 * Comparing with what the audio was actually made with is precise: a clip
 * whose speakers happened to line up correctly is left alone rather than
 * re-synthesized for nothing.
 */
export async function diagnoseClips(
  opts: { id?: number; all?: boolean } = {}
): Promise<ClipDiagnosis[]> {
  const rows = await getDb()
    .select({
      id: listeningClips.id,
      title: listeningClips.title,
      transcript: listeningClips.transcript,
      audioKey: listeningClips.audioKey,
    })
    .from(listeningClips);

  const voices = azureVoices();
  const out: ClipDiagnosis[] = [];

  for (const row of rows) {
    if (opts.id != null && row.id !== opts.id) continue;

    const lines = ((row.transcript as { lines?: StoredLine[] })?.lines ??
      []) as StoredLine[];
    const script: ScriptLine[] = lines
      .map((l) => ({
        speaker: (l.speaker ?? "").trim(),
        text: (l.text ?? "").trim(),
        translation: (l.translation ?? "").trim(),
      }))
      .filter((l) => l.text.length > 0);

    const names = [...new Set(script.map((l) => l.speaker).filter(Boolean))];
    if (script.length === 0 || names.length === 0) continue;

    const planned = assignSpeakerVoices(names);
    const speakers: SpeakerPlan[] = names.map((name, i) => {
      const from = voices[i % voices.length];
      const to = planned.get(name) ?? from;
      return {
        name,
        gender: ptGender(name),
        from,
        to,
        wrong: voiceGender(from) !== ptGender(name),
      };
    });

    const wrong = speakers.filter((s) => s.wrong).map((s) => s.name);
    if (wrong.length === 0 && !opts.all) continue;

    out.push({
      id: row.id,
      title: row.title,
      speakers,
      wrong,
      audioKey: row.audioKey,
      chars: script.reduce((n, l) => n + l.text.length, 0),
      script,
    });
  }
  return out;
}

/**
 * Clips that would be DEMOTED from R2 back into Postgres if repaired here.
 *
 * Re-synthesizing a clip whose audio lives in R2, in an environment where R2
 * is not configured, would write the audio back as inline base64 and delete
 * the object — silently undoing the audio migration, against the production
 * database. Callers must refuse rather than proceed.
 */
export function wouldDemote(clips: ClipDiagnosis[]): ClipDiagnosis[] {
  return blobConfigured() ? [] : clips.filter((c) => c.audioKey);
}

export type RevoiceResult =
  | { ok: true; id: number; bytes: number; timings: "measured" | "estimated" }
  | { ok: false; id: number; error: string };

/**
 * Re-synthesize one clip with the corrected voices.
 *
 * Word timings are re-derived rather than carried over: new audio has a new
 * duration and new word boundaries, so the old `words` array would leave the
 * karaoke highlight drifting further out with every line.
 */
export async function revoiceClip(clip: ClipDiagnosis): Promise<RevoiceResult> {
  const voiceOf = new Map(clip.speakers.map((s) => [s.name, s.to]));

  // Mirrors the generator exactly: same rate, same pause, same chunking
  // (Azure caps a document at 50 <voice> elements).
  const docs = ssmlSegmentDocs(
    clip.script.map((l) => ({
      text: l.text,
      voice: voiceOf.get(l.speaker) ?? azureVoices()[0],
      rate: "0.95",
      breakAfterMs: 350,
    }))
  );

  // No username: a maintenance repair charged to a family member would
  // corrupt the per-household spend reports.
  const mp3 = await azureSynthesizeDocs(docs);
  if (!mp3) return { ok: false, id: clip.id, error: "A síntese de voz falhou." };

  const heard = await transcribeWordTimings(
    new Uint8Array(mp3),
    "dialogo.mp3",
    "audio/mpeg"
  );
  const transcript = alignTranscript(
    clip.script,
    heard?.words ?? [],
    heard?.duration ?? 0
  );

  const newKey = blobConfigured()
    ? await putAudio(audioKey("clip", `${clip.title}|${mp3.length}`), mp3)
    : null;

  await getDb()
    .update(listeningClips)
    .set({
      transcript,
      audioB64: newKey ? null : mp3.toString("base64"),
      audioKey: newKey,
      bytes: mp3.length,
    })
    .where(eq(listeningClips.id, clip.id));

  // Only after the row points at the NEW object. Delete-first would leave the
  // clip referencing something that no longer exists if the update failed.
  if (clip.audioKey && clip.audioKey !== newKey) {
    await deleteAudio(clip.audioKey).catch(() => {});
  }

  return {
    ok: true,
    id: clip.id,
    bytes: mp3.length,
    timings: heard ? "measured" : "estimated",
  };
}

/** $15 per 1M characters — Azure standard neural retail, 2026-08-07. */
export function estimateCostUsd(clips: ClipDiagnosis[]): number {
  return (clips.reduce((n, c) => n + c.chars, 0) / 1_000_000) * 15;
}
