/**
 * Re-synthesize listening-clip audio that was generated with wrong-gender voices.
 *
 * The diagnosis and repair live in lib/revoice.ts, shared with
 * /api/admin/revoice-clips — the Azure credentials are only present in the
 * deployed environment, so the same fix has to be runnable from there too, and
 * two copies of this logic would drift.
 *
 * DRY RUN BY DEFAULT. Re-synthesis costs real money and overwrites stored
 * audio, so nothing happens until you pass --apply.
 *
 *   npm run clips:revoice                    # what is wrong, and what it would become
 *   npm run clips:revoice -- --apply         # fix them
 *   npm run clips:revoice -- --apply --id=3
 *   npm run clips:revoice -- --apply --all   # re-voice every clip, not just the wrong ones
 *
 * If Azure is not configured locally, use the admin endpoint on the deployed
 * app instead — it runs this same code where the keys are.
 */
import {
  diagnoseClips,
  estimateCostUsd,
  revoiceClip,
  wouldDemote,
} from "../lib/revoice";
import { azureConfigured } from "../lib/tts";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const ALL = args.includes("--all");
const idArg = args.find((a) => a.startsWith("--id="))?.slice("--id=".length);
const ID = idArg ? Number(idArg) : undefined;

async function main() {
  const clips = await diagnoseClips({
    id: Number.isInteger(ID) ? ID : undefined,
    all: ALL,
  });

  if (clips.length === 0) {
    console.log("\n✓ No clip has a wrong-gender voice. Nothing to do.");
    return;
  }

  console.log(
    `\n${clips.length} clip(s) ${ALL ? "to re-voice" : "with a wrong-gender voice"}:\n`
  );
  for (const c of clips) {
    console.log(`  #${c.id} ${c.title}  [${c.audioKey ? "R2" : "inline"}]`);
    for (const s of c.speakers) {
      const arrow = s.from === s.to ? "(unchanged)" : `→ ${s.to}`;
      console.log(
        `    ${s.wrong ? "✗" : " "} ${s.name.padEnd(10)} ${
          s.gender === "f" ? "♀" : "♂"
        }  ${s.from} ${arrow}`
      );
    }
  }

  const demote = wouldDemote(clips);

  if (!APPLY) {
    console.log(
      `\nDry run. About $${estimateCostUsd(clips).toFixed(4)} of Azure neural TTS.`
    );
    if (!azureConfigured()) {
      console.log(
        "  ! Azure is not configured here, so --apply would refuse.\n" +
          "    The keys live in the deployed environment — run the repair there instead:\n" +
          "      GET  /api/admin/revoice-clips   (diagnose, free)\n" +
          "      POST /api/admin/revoice-clips   (apply)"
      );
    }
    if (demote.length > 0) {
      console.log(
        `  ! ${demote.map((c) => `#${c.id}`).join(", ")} store audio in R2, not configured here.` +
          " --apply would refuse rather than move it back into Postgres."
      );
    }
    console.log("Re-run with --apply to do it.");
    return;
  }

  if (!azureConfigured()) {
    console.error(
      "\n✗ Azure is not configured (AZURE_SPEECH_KEY / AZURE_SPEECH_REGION).\n" +
        "  The keys live in the deployed environment. Run the repair there:\n" +
        "    POST /api/admin/revoice-clips"
    );
    process.exit(1);
  }
  if (demote.length > 0) {
    console.error(
      `\n✗ ${demote.length} clip(s) store their audio in R2, which is not configured here.\n` +
        "  Re-synthesizing would move that audio into Postgres as base64 and delete the R2\n" +
        "  object, undoing the audio migration. Run this where R2 is configured."
    );
    process.exit(1);
  }

  console.log("\nApplying…\n");
  let fixed = 0;
  for (const clip of clips) {
    const r = await revoiceClip(clip).catch((e) => ({
      ok: false as const,
      id: clip.id,
      error: (e as Error).message,
    }));
    if (r.ok) {
      fixed++;
      console.log(
        `  ✓ #${r.id} ${clip.title} — ${(r.bytes / 1024).toFixed(0)} KB, timings ${r.timings}`
      );
    } else {
      console.error(`  ✗ #${r.id} ${clip.title}: ${r.error}`);
    }
  }
  console.log(`\n✓ ${fixed}/${clips.length} clip(s) re-voiced.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
