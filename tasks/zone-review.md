# Zone corpus editorial review

Reviewed: all 15 dossiers in `content/zones/` (~106,400 words), 2026-08-10. Line numbers
refer to the files as read this pass; fact-checkers are editing concurrently, so re-grep
the quoted text if a line number has drifted.

## Verdict

Shippable after one targeted fix pass — the corpus is far better than a twelve-researcher
parallel effort has any right to be, with real sourcing discipline, honest `(unverified)`
flags, and prompt contexts that would genuinely produce different lessons per region. The
biggest risk is cross-file drift feeding the same tutor two conflicting "facts": worst of
all, `bairros-lisboa.md` still tells learners to ride the Ascensor da Glória, which
`lisboa.md` correctly records as out of service since the fatal accident of 3 September
2025 — a learner acting on that line would be sent to a crashed funicular. Second-order
risk: market-day and naming disagreements between `transportes-e-mercados.md` and the
regional files, because both sides are injected as authoritative.

## Cross-file contradictions

| # | Claim | File A | File B | Which is right |
|---|---|---|---|---|
| 1 | Ascensor da Glória usable | bairros-lisboa.md:67 lists it as a working ascensor; :233–235 offers it as the way up to Bairro Alto | lisboa.md:127 "out of service since the accident of 3 September 2025 and is replaced by a minibus" | **lisboa.md** (sourced to Público). Safety-adjacent; fix first. |
| 2 | Arena name | bairros-lisboa.md:678 "The **Altice Arena**, which everyone over thirty still calls the Pavilhão Atlântico" | lisboa.md:41 "**MEO Arena** (renamed back from Altice Arena on 1 February 2024 — do not write 'Altice')" | **lisboa.md** — one file issues an explicit "do not write Altice" instruction, the other writes Altice. |
| 3 | Tram 28 route | transportes-e-mercados.md:58–59 "tram 28 (Graça–Estrela via Alfama and the Baixa)" | bairros-lisboa.md:59 "28E — Martim Moniz ↔ Graça ↔ Estrela ↔ Campo de Ourique (Prazeres)"; lisboa.md:67, :127 agree (Prazeres terminus) | **bairros-lisboa.md**. Transportes has both endpoints wrong. |
| 4 | Navegante for under-23s | lisboa.md:122 "half-price **Sub-23** and **+65** tracks" | transportes-e-mercados.md:70 "free for anyone up to 23 inclusive, student or not" | **transportes** (free since 2023; its Sources cite Dec 2025 fare coverage). |
| 5 | Janela do Capítulo, Tomar | ribatejo.md:114–115 "the great Manueline window by **Diogo de Arruda**" | centro.md:98–100 "begun under Diogo de Arruda, 1510–13, completed by João de Castilho in 1515 — attributing it to Arruda alone is the standard error" | **centro.md** — ribatejo commits exactly the error its sibling warns against. |
| 6 | Nazaré market day | oeste.md:338–340 "no regular market day was confirmed for Óbidos or **Nazaré** … do not state that as fact" (repeated :888–889) | transportes-e-mercados.md:196 "Nazaré \| Feira semanal \| Friday" sourced to cm-nazare.pt | **transportes** — it has the câmara source; oeste's "do not invent one" instruction now contradicts a verified sibling fact. |
| 7 | Torres Vedras Feira Rural venue | transportes-e-mercados.md:194 "Parque Regional de Exposições … First Saturday (Apr–Oct, **not Aug/Sep**)" | oeste.md:328–329 "Feira Rural on the first Saturday, April to October, **in the historic centre**" | Unclear — both cite cm-tvedras/promotorres. Venue and skip-months must be settled against the council page. |
| 8 | Peniche feira mensal vs Feira da Bufarda | transportes-e-mercados.md:195 names the monthly fair "Feira mensal (**da Bufarda**), Zona Industrial da Prageira" | oeste.md:320–322 treats them as two events: feira mensal at Prageira (last Thursday) **and** "Bufarda has its own feira on the third Sunday" | Probably **oeste** (it read the council's regulamento); transportes appears to have merged two fairs into one name. |
| 9 | Azores year-round ferry | acores.md:93 "the workhorse is the **triângulo** — Faial, Pico and São Jorge — with the Horta–Madalena crossing … running year-round" (implies São Jorge in the year-round core) | transportes-e-mercados.md:156–163: only **Horta–Madalena** is year-round; the Triângulo incl. São Jorge is a **seasonal** line | **transportes** (sourced to the Atlânticoline summer schedule). |
| 10 | Mirandês territory | norte.md:414–416 "roughly **500 km²** … three villages of Vimioso (Vilar Seco, Angueira, Caçarelhos)" stated flat | bairros-porto.md:248 "roughly **550 km²**" flat; sotaques.md:384–387 "roughly **500–550 km²** (sources vary) … Caçarelhos in some [lists]" | **sotaques** has it right — the honest range. The two flat, mutually inconsistent versions should adopt its hedge. |
| 11 | South-bank light rail name | lisboa.md:130 "**MTS (Metro Transportes do Sul)**" | setubal.md:384 "**Metro Sul do Tejo (MST)** — properly the Metropolitano Sul do Tejo" | Both defensible (MTS is the operating company, Metro Sul do Tejo the system) but a tutor will contradict itself. Pick one convention. |
| 12 | Almada population | lisboa.md:218 "177 238 people" | setubal.md:562 "**177 268** residents (2021)" | setubal (matches INE 2021); trivial but both are census claims. |
| 13 | Seixal population | lisboa.md:218 "Seixal (166 507)" | setubal.md:598 "175 023 residents (**2024**)" | Both, technically (different vintages) — but unlabelled in lisboa.md, so the tutor sees a bare disagreement. |
| 14 | "First demarcated" wine claims | centro.md:283–284 "Dão DOC — demarcated in 1908, **Portugal's first demarcated unfortified wine region**" | norte.md:225 vinho verde "demarcated on **18 September 1908**"; lisboa.md:108 Colares "demarcated **1908**" — both unfortified | The 1908 Carta de Lei demarcated several regions at once; Dão's superlative cannot survive its siblings' dates. Soften to "among the first (1908)". |
| 15 | Lisbon's first tram, 1901 | lisboa.md:226 "eléctrico 28E (a route **since 1901**)" | bairros-lisboa.md:349–353 "15E … the **first route of the Lisbon network, inaugurated in 1901**" | **bairros-lisboa** — the 1901 inaugural is the Cais do Sodré–Algés corridor (today's 15E); the 28 dates from later (~1914). lisboa.md's parenthesis is wrong. |
| 16 | Mercado do Livramento days | setubal.md:300–301 "Exact opening days and hours could not be verified — do not state them" | transportes-e-mercados.md:200 "Tuesday–Sunday \| Daily (closed Monday)" sourced to mun-setubal.pt | **transportes** resolved setubal's gap but didn't say so (it *did* note resolving alentejo's Estremoz flag, :362–364 — the mechanism exists, apply it here). |
| 17 | A22 toll abolition year | algarve.md:116 "the Portuguese source gives 1 January 2024, the English one 1 January 2025 — treat the year as unsettled" | transportes-e-mercados.md:121–124 flat "**Since 1 January 2025**" | **transportes** (Jan 2025 press coverage cited). Algarve's hedge should be collapsed to match. |
| 18 | Stale cross-reference | bairros-porto.md:74–76 "older descriptions (**including the zone-level Norte dossier**) still credit Metro do Porto" | norte.md:282–283 already corrected: "operated by **STCP since 2022**, not by Metro do Porto" | norte was fixed; bairros-porto's pointer at its sibling is now false. Files should never assert what another file currently says. |
| 19 | Internal, same file: Fátima population | centro.md:161–162 "Fátima *is* a cidade (**10,533** people)" | centro.md:169 "Fátima's **13,212** residents work in hotels…" | One of these; pick the 2021 census figure and delete the other. |

Verified-consistent spot checks worth recording: Bolhão hours (norte/bairros-porto/transportes agree); Feira da Ladra Tue+Sat (lisboa/bairros-lisboa/transportes); Barcelos Thursday (norte/transportes); AIMA/SEF dates (servicos/norte/algarve); Festa dos Tabuleiros 2023→2027 (centro/ribatejo); Aqueduto dos Pegões ~6 km/180 arches (centro/ribatejo); sotaques' per-region summaries match every zone file's Language notes.

## Prompt context, ranked

Word counts run 169 (algarve) to 250 (bairros-porto). If the cap is 200, five are over:
bairros-porto 250, sotaques 246, servicos 236, bairros-lisboa 235, transportes 220.

1. **oeste** — the gold standard: family-anchored (Santa Cruz/Torres Vedras), mechanism-rich, seasonal, and explicitly anti-invention ("Peniche, Ericeira and Nazaré have no station").
2. **transportes-e-mercados** — pure mechanism plus explicit hallucination guards ("never invent a fare", "never state a market day for a town not on that list"); exactly what a system prompt should do.
3. **bairros-lisboa** — per-bairro furniture with register rules (colour not number, freguesia for paperwork, bairro for identity); a model could set a scene in any of 21 bairros differently.
4. **servicos** — names the situations to build (senha, missing document, remarcar, the unopened carta registada) and the tone rule ("the bureaucracy is the joke, not the people").
5. **ribatejo** — genuinely unduplicable specifics: campino kit, station-below-the-town, the magusto-is-not-chestnuts trap. No other block could produce these lessons.
6. **bairros-porto** — same per-bairro pattern as its Lisbon twin, strong mental map (Baixa/Foz/Boavista), but the longest block and slightly more list than instruction.
7. **alentejo** — one organising idea (distance and emptiness) plus concrete oddities (the carrinha do peixe, the cork year painted on trunks, talhas opened on São Martinho).
8. **setubal** — "crossing the river or deliberately not" is a real lesson engine; industrial memory ("a CUF", "o estaleiro, past tense") is a nice register note.
9. **acores** — weather-as-governance, volcano-as-utility, ferry-as-commute; distinct from Madeira's block in every specific.
10. **algarve** — market days by town, season inversion, ferry islands; concrete throughout, slightly more shopping-list than the top tier.
11. **lisboa** — dense and accurate but reads as a compression of the whole file; fewer "build this situation" cues than its bairros companion, which will do the heavy lifting anyway.
12. **madeira** — good specifics (tunnels, capacete, caralhinho) but the thinnest on situations; mostly nouns.
13. **norte** — a comma-spliced noun dump; every noun is real and local, but it gives the model the least guidance on what to *do* with them of any regional block.
14. **centro** — one block for a zone spanning Aveiro to Guarda; the specifics are good but undifferentiated — a learner in Covilhã gets moliceiros and a learner in Aveiro gets snow. Needs an internal split cue (litoral vs interior) like bairros files have per-bairro.
15. **sotaques** — ranked last only because the brief's test is "usable by a model inventing an example": this block is accent *policy*, not example fodder, and overlaps every zone's Language notes. As policy it is excellent and should stay — but consider injecting it only when pronunciation is the topic.

No two blocks duplicate each other's specifics; the regional differentiation test passes.

## Humour boundary

**Pass, with two borderline lines to soften.** The corpus overwhelmingly attaches warmth to
rituals (the Bolhão salsa bunch, the tremoço skill, the sopa da pedra stone joke, the
cozido hole-digging advice) and the self-deprecating jokes are about systems and peoples
who own them (servicos' phone menus; alentejo's anedotas, correctly framed as "worn as a
badge"). Two lines touch real named businesses:

- lisboa.md:114 — "**Cervejaria Ramiro** and **Solar dos Presuntos** (both now
  tourist-heavy)". A recorded criticism of two named, trading restaurants. Mild, but it is
  precisely what the rule forbids, and a tutor will repeat it. Cut the parenthesis or
  reframe as "the famous ones visitors queue for".
- ribatejo.md:310–312 — "There is now a **Taberna do Quinzena II** and a **Quinzena
  Hotel**, which the town treats as a running joke about the tavern having got above
  itself." Affectionate and attributed to the town, but it is a joke at a named house's
  expense — in the same file that instructs "never repeat criticism of a named house — it
  will get back" (:325–326). Rewrite to the neutral fact (the expansion) without the barb.

Noted and fine: bairros-porto.md:290–294 (Mercado Ferreira Borges "so comprehensively
rejected by the traders that it never really worked… Porto finds this very funny") — a
19th-century municipal building with no current trader to injure; algarve.md:199 ("Praia
de Faro… exactly as fun as it sounds") — a place, not a business.

## Suspect specifics

The most likely to embarrass a learner repeating them to a native speaker:

1. madeira.md:87 — "**As Vides** in Estreito is the name most often given when you ask a
   local where to go (unverified)". A named restaurant recommendation the file itself
   couldn't verify — the exact "asserted in body, hedged in parentheses" shape the brief
   warns about. Verify or cut the name.
2. madeira.md:99 — "**Café Ritz** and the Avenida Arriaga cafés" stated flat; no source in
   the Sources list. madeira.md:93 "**Fábrica Santo António**… (unverified as to founding
   date)" is the same shape half-fixed.
3. bairros-porto.md:479–480 — "a landslide in the winter of 2000 displaced around fifty
   families in the Fontainhas". Precise casualty-adjacent number, no unverified flag, no
   visible source. Verify against the Fontainhas article or hedge.
4. norte.md:78–79 — São Bento azulejos "painted by Jorge Colaço **between 1905 and 1908**".
   The standard account is 1905–1916 (the station opened 1916, same sentence). A learner
   will repeat this in the station itself.
5. alentejo.md:25 — Alqueva "created the **largest artificial lake in Europe**". The
   defensible claim is largest in *Western* Europe; a Spaniard or anyone who knows the
   Volga reservoirs will correct it.
6. acores.md:69 — Gorreana and Porto Formoso "**the only tea plantations in Europe**".
   Falsifiable (Cornwall, among others, grows tea commercially); the safe claim is "the
   oldest tea plantations in Europe".
7. centro.md:283–284 — Dão "Portugal's **first** demarcated unfortified wine region"
   (see contradiction #14).
8. bairros-porto.md:807 — Matosinhos "**ten freguesias**". Post-2013 Matosinhos had four
   unions; the same entry says Leça was re-created in March 2025, so the count is in flux
   — whatever number is used needs a date, and ten-as-of-2021-boundaries is not it.
9. lisboa.md:118 — "**Feira de São Pedro** in Sintra on the 2nd and 4th Sunday" stated
   flat, while transportes-e-mercados.md:352–355 explicitly downgrades that same claim to
   "multiply-sourced but not primary-sourced". The hedge should live in both places or
   neither.
10. lisboa.md:226 — 28E "a route since 1901" (see contradiction #15).
11. norte.md:294 — Feira de Barcelos "has done since the seventeenth or eighteenth
    century". The fair is usually dated to the medieval period; this hedge is confidently
    wrong in both branches. Either source a century or say "for centuries".
12. bairros-porto.md:766 — Ramalde's underpasses, "which one you do not use after dark":
    an unfalsifiable safety claim presented as shared local knowledge. Cut; it is the one
    place the colour writing invents a fact with consequences.
13. setubal.md:125–126 vs lisboa.md:60 — Cristo Rei arithmetic: "pedestal and portico
    bring it to 82 m; the whole structure stands about 110 m" (setubal) vs "110 m in
    total" (lisboa). The 82 m sentence is garbled (82 is the pedestal; 28+82=110); tidy it.

Deserving of praise, as calibration: oeste.md's "Deliberately excluded as misattributed"
list (:900–908), ribatejo's Pombal date-check (:460–462), alentejo's Templo-de-Diana and
carne-de-porco corrections (:31, :76), and transportes' explicit resolution of alentejo's
Estremoz flag (:362–364) are exactly the discipline the rest should copy.

## Structural issues

- **`## Restaurants & institutions` exists in only 5 of 10 regional dossiers** (acores,
  algarve, madeira, ribatejo, setubal). alentejo, centro, lisboa, norte, oeste fold the
  same material into other sections. If the section is schema (pickable in the product),
  five files are silently missing it; if not, the five that have it are off-template.
- **Prompt-context length spread 169–250 words.** If the cap is 200, bairros-porto (250),
  sotaques (246), servicos (236), bairros-lisboa (235) and transportes (220) are over and
  are paid for on every request.
- **Cross-file pointers rot** — bairros-porto:74–76 asserts what norte.md says, and is now
  wrong (contradiction #18). Ban "the other dossier says X" claims; state the fact and
  cite the primary source.
- **The unverified-flag economy is one-directional.** transportes resolved alentejo's
  Estremoz flag and said so, but norte.md:311 still carries "SNS 24 (unverified:
  808 24 24 24)" while servicos.md:35 and centro.md:376 state the number flat with
  sources; setubal's Livramento gap is resolved in transportes without a note. A single
  reconciliation pass mapping every remaining `(unverified)` against sibling files would
  clear several for free.
- **Population figures are quoted with mixed vintages and no labels** (lisboa.md's Seixal
  2021 vs setubal.md's 2024; Almada off by 30). Standardise on Censos 2021 with the year
  stated, or the tutor will emit bare disagreements.
- **Voice and formatting otherwise hold.** Heading order is consistent within each genre;
  `palavra` — meaning formatting is uniform across all Language notes; a corpus-wide scan
  for Brazilian forms (café da manhã, ônibus, banheiro, celular, cardápio, açougue, você
  etc.) found them only inside explicit warnings — the European Portuguese discipline held
  in all 15 files.

## The ten fixes I would make first

1. In `bairros-lisboa.md` (:67, :233–235), mark the Ascensor da Glória out of service since
   3 September 2025 with the minibus replacement, matching lisboa.md:127.
2. In `bairros-lisboa.md:678`, change "Altice Arena" to "MEO Arena (renamed 1 February
   2024; everyone over thirty still says Pavilhão Atlântico)".
3. In `transportes-e-mercados.md:58–59`, correct tram 28's route to Martim Moniz ↔ Campo
   de Ourique (Prazeres) via Graça, Alfama, Baixa and Estrela.
4. In `lisboa.md:122`, replace "half-price Sub-23" with free travel up to 23 inclusive,
   matching transportes-e-mercados.md:70.
5. In `ribatejo.md:114–115`, credit the Janela do Capítulo to Arruda (begun 1510–13) and
   João de Castilho (completed 1515), per centro.md:98–100.
6. Declare the transportes market table canonical and sync the three collisions: Nazaré's
   Friday feira into oeste.md:338, the Livramento days into setubal.md:300, and resolve
   the Torres Vedras Feira Rural venue and the Peniche/Bufarda naming against the câmara
   pages before either file states them again.
7. Harmonise Mirandês in norte.md:414–416 and bairros-porto.md:248 to sotaques' hedged
   version (500–550 km², village lists vary), and delete bairros-porto:74–76's stale claim
   that the Norte dossier still credits Metro do Porto.
8. Soften the three flat superlatives: Alqueva "largest in Western Europe"
   (alentejo.md:25), Dão "among the first 1908 demarcations" (centro.md:283), Gorreana
   "oldest tea plantations in Europe" (acores.md:69).
9. Cut or source madeira's unverified named businesses (As Vides :87, Café Ritz :99) and
   the two humour-boundary barbs (lisboa.md:114 "tourist-heavy"; ribatejo.md:311 "got
   above itself").
10. Fix centro.md's double Fátima population (:161 vs :169), pick one MST/MTS convention
    for lisboa.md:130 and setubal.md:384, and correct norte.md:78 (São Bento azulejos
    1905–1916) and lisboa.md:226 (the 28 is not "a route since 1901").
