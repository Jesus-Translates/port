# EU-Portuguese sweep — zone corpus

Date: 2026-08-10. Scope: all fifteen dossiers in `content/zones/`. Method: systematic
greps for Brazilian lexicon (café da manhã, ônibus, banheiro, geladeira, celular, trem,
xícara, sorvete, suco, bala, açougue, aluguel, esporte, usuário, tela, terno, bonde,
time, grama…), BP-only orthography (ô-circumflex before nasals: Antônio/econômico;
registro, equipe, quatorze, dezess-), pre-AO90 EP spellings, all gerund forms (full
`-ndo` extraction over the corpus), clitic-before-verb patterns (me diga / te amo /
vou te…), você/a gente framing, and BP colloquialisms (tchau, beleza, cara, grana,
gostoso…) — followed by a close read of every `## Language notes`, `## Prompt context`
and phrase section.

## 1. Fixed

No genuine Brazilianism survived outside a warning. Two categories of fixes were made:

**Idiom not said in Portugal (1):**

- `transportes-e-mercados.md` (Phrases → Trains and coaches):
  *Dá-me um retorno para o Porto, por favor.* → *Queria um bilhete de ida e volta para
  o Porto, por favor.* — `um retorno` is not the European Portuguese word for a return
  ticket (it reads as an Anglicism/BP-flavoured calque); EP is *bilhete de ida e volta*,
  and *queria…* is the counter register the corpus itself teaches elsewhere.

**Pre-AO90 orthography normalised to the post-AO90 EP target (not Brazilianisms):**

- `eléctrico(s)` → `elétrico(s)` — lisboa.md (×7, incl. the Prompt context and the
  vocab entry "o elétrico — tram (never *bonde*)"), bairros-lisboa.md (×1),
  bairros-porto.md (×1), transportes-e-mercados.md (×2, incl. a sources annotation).
- `colectividades` → `coletividades` — lisboa.md:69 (bairros-lisboa already used the
  post-AO90 form).
- `inspecção` → `inspeção` — algarve.md:113 (lisboa.md already used `inspeção`).

EP-retained consonants were left alone: no `facto`/`contacto` occurrences needed
changing; `São João Baptista` instances are proper names and untouched; `adoptado` and
`dialectal` in sotaques.md sit inside verbatim Lindley Cintra quotes and were kept.

## 2. Brazilian forms correctly inside warnings — deliberately KEPT

- `sotaques.md` — the "Guard the Brazilian border" table (*estou fazendo*, *você*,
  *café da manhã*, *ônibus*, *trem*, *celular*, *banheiro*, *time*, *bala*,
  *geladeira*, *Brasiu*) and the Prompt context's "never present a Brazilian form as a
  target" list. All warnings; all kept.
- `lisboa.md` — "never *bonde*", "never *cardápio*", "never *açougue*", "never *café
  da manhã*", "Never say *chope* (Brazilian)". Kept.
- `bairros-porto.md` — the note that *bota-abaixo* is documented for Rio, not Porto
  (a warning against a misattribution). Kept.

## 3. Regional EP features that resemble Brazilian — verified and KEPT

- **Southern/insular gerund** (*estou fazendo*): documented in alentejo.md, algarve.md,
  madeira.md, acores.md and sotaques.md, every instance carrying the
  recognise-don't-produce instruction and the "not a Brazilianism" framing; the
  alentejo Prompt context repeats "the learner should produce *estar a + infinitivo*".
  Untouched, as briefed.
- **`a gente` + 3sg**: appears only as a described regional preference (alentejo,
  algarve, madeira, sotaques), never as a teaching target; *nós* is named as the
  production form. Kept.
- **`você` discussion** (bairros-porto.md, sotaques.md, alentejo.md): framed as the
  trap to avoid, with *tu* / *o senhor, a senhora* as targets. Kept.
- madeira.md: the previously dropped thin-sourced object-pronoun claim was NOT
  reinstated.
- alentejo.md: *açougue* appears once, historically (the Templo Romano de Évora used
  as an açougue after 1501) — archaic EP usage in a historical fact, glossed, not
  vocabulary teaching. Kept.

## 4. Unsure / judgement calls (none left in place silently)

- *um cafezinho* (norte.md, bairros-porto.md): listed among northern warmth
  diminutives (*um cafezinho, uma sopinha, um bocadinho*). The -inho diminutive is
  fully productive EP; kept as is, flagging only because *cafezinho* is also the BP
  default word for coffee. Context (diminutive warmth, alongside `cimbalino`/`bica`
  as the actual coffee words) makes the EP reading unambiguous.
- *Fica quanto, tudo junto?* (transportes-e-mercados.md): wh-in-situ is genuine
  colloquial EP (*estás onde?*), so kept, but noting it here for the record.

## 5. Verdict

The corpus is EU-Portuguese clean. Brazilian forms exist only inside explicit
warnings or as documented regional-EP features carrying recognise-don't-produce
instructions. One non-EP idiom was fixed; orthography is now uniformly post-AO90 EP.

## 6. Structural integrity confirmed

- All fifteen files retain their `##` headings, names and order unchanged (edits were
  word-level only; verified against `git diff` — no heading lines touched).
- Every file has exactly one `## Prompt context` heading.
- Prompt-context word counts, all within cap:
  - Zone files (cap 200): algarve 169, madeira 179, ribatejo 185, lisboa 193,
    alentejo 195, norte 195, acores 196, oeste 196, centro 198, setubal 198.
  - Bairros/reference (cap 250): transportes-e-mercados 233, bairros-lisboa 240,
    servicos 244, sotaques 246, bairros-porto 249.
