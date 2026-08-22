import "dotenv/config";
import { writeFileSync } from "node:fs";
import { sql } from "drizzle-orm";
import { getDb } from "../lib/db";

/**
 * Rewrite stored British English into US English, in place.
 *
 * The prompt rule in PT_STYLE stops NEW drift, but it cannot touch the 59 unit
 * notes, exam explanations and phrasebook glosses an earlier model already
 * wrote. Regenerating them would cost real money and would churn good prose to
 * fix a spelling; a word-boundary rewrite changes exactly what is wrong.
 *
 * Two lists, because the words divide cleanly into two kinds.
 *
 * SAFE are words with no other meaning: "colour" is never anything but a
 * misspelling of "color" here, so it can be replaced everywhere, preserving
 * case, and re-running is a no-op.
 *
 * TARGETED are words that are ALSO ordinary English. "flat" appears in this
 * database as flat alluvial farmland, flat-roofed houses and a flat tone of
 * voice, and only twice as an apartment. "lift" is an elevator four times and
 * a ride once. "holiday" is nearly always a public holiday, which is correct
 * US English. A blanket replace would corrupt more than it fixed, so those are
 * matched as whole phrases and nothing else is touched.
 *
 * Run with --apply to write. Without it, this only reports and writes a
 * backup of every row it would change.
 */
const SAFE: [string, string][] = [
  ["colour", "color"], ["colours", "colors"], ["coloured", "colored"],
  ["colourful", "colorful"], ["favour", "favor"], ["favours", "favors"],
  ["favourite", "favorite"], ["favourites", "favorites"],
  ["favourable", "favorable"], ["neighbour", "neighbor"],
  ["neighbours", "neighbors"], ["neighbourhood", "neighborhood"],
  ["behaviour", "behavior"], ["honour", "honor"], ["honours", "honors"],
  ["labour", "labor"], ["flavour", "flavor"], ["flavours", "flavors"],
  ["harbour", "harbor"], ["rumour", "rumor"], ["odour", "odor"],
  ["practise", "practice"], ["practised", "practiced"],
  ["practises", "practices"], ["practising", "practicing"],
  ["memorise", "memorize"], ["memorised", "memorized"],
  ["memorising", "memorizing"], ["memorisation", "memorization"],
  ["apologise", "apologize"], ["apologised", "apologized"],
  ["apologising", "apologizing"], ["recognise", "recognize"],
  ["recognised", "recognized"], ["recognises", "recognizes"],
  ["recognising", "recognizing"], ["organise", "organize"],
  ["organised", "organized"], ["organising", "organizing"],
  ["organisation", "organization"], ["realise", "realize"],
  ["realised", "realized"], ["realising", "realizing"],
  ["emphasise", "emphasize"], ["emphasised", "emphasized"],
  ["summarise", "summarize"], ["summarised", "summarized"],
  ["generalise", "generalize"], ["generalised", "generalized"],
  ["specialise", "specialize"], ["specialised", "specialized"],
  ["analyse", "analyze"], ["analysed", "analyzed"],
  ["centre", "center"], ["centres", "centers"], ["centred", "centered"],
  ["theatre", "theater"], ["metre", "meter"], ["metres", "meters"],
  ["litre", "liter"], ["litres", "liters"], ["fibre", "fiber"],
  ["licence", "license"], ["defence", "defense"], ["offence", "offense"],
  ["pretence", "pretense"], ["grey", "gray"], ["towards", "toward"],
  ["learnt", "learned"], ["spelt", "spelled"], ["dreamt", "dreamed"],
  ["burnt", "burned"], ["whilst", "while"], ["amongst", "among"],
  ["maths", "math"], ["aeroplane", "airplane"], ["aluminium", "aluminum"],
  ["moustache", "mustache"], ["pyjamas", "pajamas"], ["storey", "story"],
  ["storeys", "stories"], ["speciality", "specialty"], ["tyre", "tire"],
  ["kerb", "curb"], ["traveller", "traveler"], ["travelled", "traveled"],
  ["travelling", "traveling"], ["cancelled", "canceled"],
  ["cancelling", "canceling"], ["jewellery", "jewelry"],
  ["jumper", "sweater"], ["jumpers", "sweaters"],
  ["trousers", "pants"], ["trainers", "sneakers"],
  ["lorry", "truck"], ["lorries", "trucks"], ["petrol", "gas"],
  ["rubbish", "trash"], ["autumn", "fall"], ["nappy", "diaper"],
  ["nappies", "diapers"], ["aubergine", "eggplant"],
  ["courgette", "zucchini"], ["courgettes", "zucchini"],
  ["motorway", "highway"], ["motorways", "highways"],
  ["pavement", "sidewalk"], ["mum", "mom"], ["mummy", "mommy"],
];

const TARGETED: [string, string][] = [
  ["car park", "parking lot"],
  ["the flat.", "the apartment."],
  ["— lift", "— elevator"],
  ["have a lift", "have an elevator"],
  ["without a lift", "without an elevator"],
  ["out of the lift", "out of the elevator"],
  ["the lift maintenance", "the elevator maintenance"],
  ["given him a lift", "given him a ride"],
  ["the tap is dripping", "the faucet is dripping"],
  ["to fix the tap", "to fix the faucet"],
  ["holiday options", "vacation options"],
  ["the British first floor but the American second",
   "not the American first floor but the second"],
  /*
   * Glosses that already carried BOTH spellings. Replacing the British half
   * word by word turns "the rubbish/trash" into "the trash/trash" — a rewrite
   * that introduces a new defect while fixing an old one. These collapse to
   * the US term instead, and must run before the word list sees them.
   */
  ["rubbish/trash", "trash"],
  ["autumn / fall", "fall"],
  ["highway / motorway", "highway"],
  ["jumper / sweater", "sweater"],
  ["jumper or sweater", "sweater"],
  ["trousers / pants", "pants"],
  ["trainers / sneakers", "sneakers"],
  ["lift / elevator", "elevator"],
  ["flat / apartment", "apartment"],
];

/** Replace whole-word, keeping the original capitalisation. */
function swap(text: string, from: string, to: string): string {
  const re = new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
  return text.replace(re, (m) => {
    if (m === m.toUpperCase() && m.length > 1) return to.toUpperCase();
    if (m[0] === m[0].toUpperCase()) return to[0].toUpperCase() + to.slice(1);
    return to;
  });
}

function fix(text: string): string {
  let out = text;
  // Phrases first: "car park" must win before any single word inside it.
  for (const [b, a] of TARGETED) out = out.split(b).join(a);
  for (const [b, a] of SAFE) out = swap(out, b, a);
  return out;
}

const TARGETS: [string, string, string][] = [
  ["units", "id", "note_md"], ["units", "id", "blurb_en"],
  ["units", "id", "note_prompt"], ["units", "id", "title_en"],
  ["ref_entries", "id", "en"], ["ref_entries", "id", "reply_en"],
  ["exam_questions", "id", "explanation"], ["lessons", "id", "blocks"],
  ["listening_clips", "id", "transcript"], ["missions", "id", "prompt_en"],
  ["categories", "id", "name_en"], ["categories", "id", "blurb_en"],
  ["zones", "id", "name_en"], ["zones", "id", "blurb_en"],
  ["zones", "id", "prompt_context"], ["zone_places", "id", "prompt_context"],
];

async function main() {
  const apply = process.argv.includes("--apply");
  const db = getDb();
  const changes: { t: string; c: string; id: string; before: string; after: string }[] = [];

  // Only the columns that actually exist — the schema has moved before, and a
  // repair that dies halfway through is worse than one that reports a gap.
  const present = new Set(
    ((await db.execute(sql`select table_name || '.' || column_name as k
      from information_schema.columns where table_schema='public'`)).rows as { k: string }[])
      .map((r) => r.k)
  );
  const missing = TARGETS.filter(([t, , c]) => !present.has(`${t}.${c}`));
  if (missing.length) console.log("skipping (no such column):", missing.map(([t, , c]) => `${t}.${c}`).join(", "));

  for (const [t, pk, c] of TARGETS.filter(([t, , c]) => present.has(`${t}.${c}`))) {
    const rows = await db.execute(sql.raw(
      `select "${pk}"::text as id, "${c}"::text as v from "${t}" where "${c}" is not null`));
    for (const r of rows.rows as { id: string; v: string }[]) {
      const after = fix(r.v);
      if (after !== r.v) changes.push({ t, c, id: r.id, before: r.v, after });
    }
  }

  const stamp = process.env.STAMP ?? "run";
  writeFileSync(`british-backup-${stamp}.json`, JSON.stringify(changes, null, 1));
  console.log(`${changes.length} rows would change; backup written.`);
  const per: Record<string, number> = {};
  for (const ch of changes) per[`${ch.t}.${ch.c}`] = (per[`${ch.t}.${ch.c}`] ?? 0) + 1;
  console.log(JSON.stringify(per, null, 1));

  if (!apply) { console.log("DRY RUN — pass --apply to write."); return; }
  /*
   * Bound parameters, not interpolation. The values being written are unit
   * notes: markdown containing quotes, apostrophes and dollar signs. Splicing
   * them into SQL text would corrupt content at best.
   */
  for (const ch of changes) {
    const col = sql.identifier(ch.c);
    const tbl = sql.identifier(ch.t);
    await db.execute(
      ch.c === "blocks"
        ? sql`update ${tbl} set ${col} = ${ch.after}::jsonb where id::text = ${ch.id}`
        : sql`update ${tbl} set ${col} = ${ch.after} where id::text = ${ch.id}`
    );
  }
  console.log(`applied to ${changes.length} rows.`);
}
main().then(() => process.exit(0));
