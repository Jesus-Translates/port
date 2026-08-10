# O teste de cultura e cidadania — estado da regulamentação

> Status check, verified 10 August 2026: does an official spec for the new civics/culture test exist yet, and what does the law itself already fix?

*Body written in English so the family can check it fast; every legal provision is quoted verbatim in European Portuguese, because the exact wording is what a product has to be built against. The final block, for AI tutor injection, is pt-PT only.*

---

## 1. The short answer

**NO. As of 10 August 2026 the implementing regulation has NOT been published.**

There is no portaria, no decreto regulamentar and no amended *Regulamento da Nacionalidade Portuguesa* in the *Diário da República* defining the format, syllabus, provider, fee or exam dates for the new civics/culture test. The requirement exists in the law and is legally in force since 19 May 2026, but the machinery to sit the test does not yet exist.

The Government's own service page says so, in the present tense:

> «Algumas destas alterações dependem de regulamentação complementar para definição das regras necessárias à sua aplicação, tornando necessário proceder à alteração do Regulamento da Nacionalidade Portuguesa no prazo de 90 dias.»
> — justica.gov.pt, *Submeter pedido de nacionalidade*

The statutory deadline for that regulation is **16 August 2026** — six days after this dossier was written. So this file has a very short shelf life and must be re-checked weekly through late August and September 2026.

**What this means for the product:** the *scope* of the test is already fixed by primary legislation and is safe to build a curriculum against (section 3). The *exam mechanics* — number of questions, pass mark, duration, language of the paper, price, sittings, awarding body — are entirely unknown and must not be asserted anywhere in the app. Anything we publish about mechanics before mid-August 2026 is a guess.

---

## 2. The law that created the test

| Item | Detail |
|---|---|
| Diploma | **Lei Orgânica n.º 1/2026, de 18 de maio** |
| What it does | Amends **Lei n.º 37/81, de 3 de outubro** (Lei da Nacionalidade); republishes it in full as an annex |
| Published | *Diário da República*, 1.ª série, **N.º 95, 18-05-2026**, pp. 2–20 |
| Approved in Parliament | 1 April 2026 |
| Promulgated | 3 May 2026 (President António José Martins Seguro) |
| Countersigned (*referendada*) | 4 May 2026 (Prime Minister Luís Montenegro) |
| Entry into force | **19 May 2026** — art. 8.º: «A presente lei entra em vigor no dia seguinte ao da sua publicação.» |

A **Declaração de Retificação n.º 17/2026/1** is listed alongside it in the Ordem dos Advogados legislation index, correcting art. 6.º n.º 11 (the criminal-record threshold, from «pena de prisão igual ou superior a 2 anos» to «pena de prisão efetiva superior a 3 anos»). It does not touch the knowledge requirements. *Flagged as reported by the OA index — not independently read.*

---

## 3. What the LAW itself defines as the test's scope

This is the load-bearing section. It comes from the text of Lei Orgânica n.º 1/2026 as published, not from press coverage.

### Article 6.º, n.º 1 — cumulative requirements for naturalisation

> «1 — O Governo concede a nacionalidade portuguesa aos indivíduos que, no momento do pedido, satisfaçam cumulativamente os seguintes requisitos:»

The two knowledge requirements:

> «**c)** Comprovarem, **através de teste ou de certificado**, conhecer suficientemente a língua e a cultura portuguesas, a história e os símbolos nacionais;»
>
> «**d)** Conhecerem suficientemente os direitos e deveres fundamentais inerentes à nacionalidade portuguesa e a organização política do Estado português;»

And the adjacent one that is often bundled with them in press coverage but is legally distinct — a solemn declaration, not a test:

> «**e)** Declararem solenemente a sua adesão aos princípios fundamentais do Estado de direito democrático;»

**So the syllabus, as fixed by statute, is five domains:**

1. Língua portuguesa
2. Cultura portuguesa
3. História de Portugal
4. Símbolos nacionais
5. Direitos e deveres fundamentais + organização política do Estado português

That is enough to build a curriculum. It is not enough to build a mock exam.

### A textual detail with real consequences

Alínea **c)** specifies the mechanism — «através de teste ou de certificado». Alínea **d)** does **not**. The law says applicants must *know* rights, duties and political organisation but is silent on how that is proven.

Three readings are open, and only the Regulamento can settle it:
- one combined exam covering c) and d);
- a language certificate (c, first part) plus a separate civics test (rest of c, plus d);
- d) evidenced by interview or declaration rather than by exam.

**Do not assume a single unified exam.** Build the content so it can be split.

### Other requirements changed at the same time (context, not test scope)

- **b)** residence: **7 years** for nationals of Portuguese-official-language countries and EU Member States; **10 years** for everyone else.
- **f)–h)** criminal record, security/defence threat, UN/EU restrictive measures.
- **i)** «Possuírem capacidade para assegurar a sua subsistência.» — a new means requirement.

---

## 4. The CPLP question — the single most commercially important paragraph

Article 6.º, n.º 10:

> «10 — Presume-se que os nacionais de países de língua oficial portuguesa preenchem o requisito da **primeira parte da alínea c)** do n.º 1, salvo nos casos em que a falta de domínio da língua portuguesa, evidenciada pelo requerente junto dos serviços competentes, seja manifesta.»

Read this carefully. The presumption is expressly limited to **«a primeira parte da alínea c)»** — the *first part* of c), i.e. «conhecer suficientemente a língua … portuguesa».

It does **not** extend to:
- the rest of alínea c): **cultura portuguesa, história, símbolos nacionais**;
- alínea d): **direitos e deveres fundamentais, organização política do Estado**.

**Conclusion, straight from the statute: a Brazilian, Angolan, Cape Verdean, Mozambican, Guinean, São Tomean or Timorese applicant is presumed to have the language, but is NOT exempt from the culture / history / symbols / civics requirement.** This confirms the premise the product is built on, and it is confirmed by primary source rather than by inference from press reporting.

Note also that the presumption is rebuttable — it falls away where «a falta de domínio da língua portuguesa … seja manifesta».

### Full exemption, by contrast

Article 6.º, n.º 9 grants a genuine exemption from alínea c) entirely — but only for a tiny group:

> «9 — O Governo pode conceder a nacionalidade, com dispensa dos requisitos previstos nas alíneas b) e c) do n.º 1, aos estrangeiros que tenham prestado ou sejam chamados a prestar serviços relevantes ao Estado português.»

Note this dispensa covers c) but **not** d).

---

## 5. Who must take it

Working from the statute. Each row cites the paragraph that pulls in the knowledge requirements.

| Route | Knowledge requirement applies? | Basis |
|---|---|---|
| Ordinary naturalisation (adults, 7 or 10 years' residence) | **Yes** — c) and d) | art. 6.º n.º 1 |
| CPLP nationals naturalising | **Yes** for culture/history/symbols/civics; language presumed | art. 6.º n.os 1 and 10 |
| **Grandchildren** claiming *nacionalidade originária* (2nd degree ascendant) | **Yes** — c) to h) | art. 1.º n.º 1 al. d) + art. 1.º n.º 3 |
| Stateless persons resident 4+ years | **Yes** — c) to h) | art. 6.º n.º 3 |
| Minors born in Portugal to foreign parents | **No** — only e) to h) apply | art. 6.º n.º 2 al. c) |
| Minors in institutional care | Discretionary grant, no c)/d) requirement stated | art. 6.º n.º 4 |
| Former Portuguese nationals recovering nationality | c) applies (only b) is waived) | art. 6.º n.º 6 |
| 3rd-degree descendants, 5 years' residence | c) applies (only b) is waived) | art. 6.º n.º 8 |
| Relevant services to the Portuguese State | c) waived; d) still applies | art. 6.º n.º 9 |
| Spouses / *união de facto* (3+ years) — art. 3.º | **Indirectly** — see below | art. 9.º n.º 1 al. a) |

### The spouse route is not as clean as it looks

Acquisition by marriage or *união de facto* under art. 3.º is by declaration and does not itself list the knowledge requirements. But the Public Prosecutor can oppose registration, and the grounds were rewritten:

> «a) A inexistência de laços de efetiva ligação à comunidade nacional, tendo em consideração os parâmetros materiais constantes das **alíneas c) a i) do n.º 1 do artigo 6.º**, incluindo a ponderação de condenação por crime de ultraje aos símbolos nacionais;»
> — art. 9.º n.º 1 al. a)

Alíneas c) and i) are inside that range. So culture/history/symbols/civics knowledge becomes a **material parameter for opposition** even on the spouse route. The safe harbour is art. 9.º n.º 2: no opposition where the marriage or union exceeds six years, or where there are common children with Portuguese nationality — except on grounds f) to h).

**Product implication:** the addressable market for civics prep is wider than "naturalisation applicants". It includes the grandchildren route (art. 1.º n.º 1 al. d), a very large cohort) and, defensively, spouses under six years of marriage.

---

## 6. Transition rules for pending applications

Article 7.º of Lei Orgânica n.º 1/2026:

> «1 — A presente lei produz efeitos a partir da data da sua entrada em vigor, sem prejuízo do disposto no número seguinte.
> 2 — Aos procedimentos administrativos pendentes à data da entrada em vigor da presente lei aplica-se a Lei n.º 37/81, de 3 de outubro, na redação anterior à presente lei.»

So: **applications already pending on 19 May 2026 are governed by the OLD law in full** — old residence periods, and **no knowledge test**.

The IRN has reportedly clarified that the operative moment is the electronic submission date, not the date the file is processed — «o momento relevante para enquadramento legal do processo é a data de submissão eletrónica» (reported 8 May 2026). *Reported via secondary source; the IRN circular itself was not located — see Gaps.*

There is a live petition to Parliament on the transition regime (participacao.parlamento.pt, initiative 6439), which suggests the cut-off is contested in practice. Not a source of law.

**Product implication:** a meaningful share of prospective users filed before 19 May 2026 and owe no civics test at all. Any onboarding flow should ask for the submission date first, and should tell pre-19-May-2026 applicants honestly that they are probably exempt. Getting this wrong sells prep to people who do not need it.

---

## 7. The 90-day deadline and its status

Article 4.º of Lei Orgânica n.º 1/2026:

> «**Regulamentação**
> O Governo procede às necessárias alterações ao Regulamento da Nacionalidade Portuguesa, aprovado em anexo ao Decreto-Lei n.º 237-A/2006, de 14 de dezembro, no prazo de 90 dias a contar da publicação da presente lei.»

- Clock starts at **publication**: 18 May 2026.
- 90 days → **16 August 2026**.
- Days remaining as of 10 August 2026: **6**.

Note the instrument named is an amendment to the **Regulamento da Nacionalidade Portuguesa**, i.e. a **decreto-lei** amending the annex to Decreto-Lei n.º 237-A/2006 — not a standalone portaria. A ministerial portaria may still follow to set exam logistics and fees (that is how the existing language test works, under Portaria n.º 176/2014), but the primary vehicle to watch is a decreto-lei.

### Evidence that it has not been published — five independent checks

1. **Government service page** (justica.gov.pt) still describes the regulation as outstanding and required «no prazo de 90 dias». Present tense, no link to a published diploma.
2. **Ordem dos Advogados** legislation index for *Nacionalidade* lists nothing later than Lei Orgânica n.º 1/2026 and its Declaração de Retificação, both 18 May 2026.
3. **Council of Ministers communiqués for July 2026** (9, 17, 23 and 30 July) were checked individually. **None mentions nationality, the Regulamento da Nacionalidade, Decreto-Lei 237-A/2006, or any knowledge test.** A decreto-lei must be approved in Council of Ministers, so its absence from every July communiqué is strong negative evidence.
4. **A search restricted to diariodarepublica.pt / dre.pt** returned no 2026 decreto-lei or portaria amending the Regulamento — only the Lei Orgânica itself and the pre-existing consolidated DL 237-A/2006.
5. **No public consultation draft** (*consulta pública*) of the new Regulamento was found.

### What to watch, in priority order

1. *Diário da República*, 1.ª série — any decreto-lei amending Decreto-Lei n.º 237-A/2006.
2. Council of Ministers communiqués at portugal.gov.pt.
3. justica.gov.pt and the IRN nationality pages.
4. Any follow-on portaria naming an awarding body (IAVE, CAPLE or a new one), fee and calendar.

Deadlines of this kind are frequently missed in Portugal, and missing it carries no automatic sanction. Plan for slippage into the autumn as the base case, not the exception.

---

## 8. Official prep resources

**None exist for the civics/culture test.** No syllabus, no question bank, no handbook, no sample paper has been published by any Portuguese public body. There is no Portuguese equivalent of the UK *Life in the UK* handbook or the German *Gesamtfragenkatalog* as of 10 August 2026.

This is the commercial opening and the commercial risk in the same sentence: nobody can be accurate yet, and whoever is ready the week the syllabus lands wins.

### What does exist, for the LANGUAGE half of alínea c)

Pre-existing machinery, in place before this reform and not yet repealed:

- **Prova de Língua Portuguesa para Aquisição de Nacionalidade**, governed by **Portaria n.º 176/2014, de 11 de setembro**, administered by **IAVE, I.P.** (per the DGE page, which is itself visibly out of date).
- Alternative accepted proofs, per DGE: certificates from Portuguese educational establishments after two years' study; approved tests at public schools or Camões-accredited centres; **CAPLE** certification (this is the CIPLE A2 route covered elsewhere in this content set); and qualification certificates showing A2 or above.

**Caveat:** all of the above was built to prove *language* alone. Whether it survives unchanged, is re-levelled, or is folded into a new combined exam is exactly what the pending Regulamento decides. Treat the current CIPLE/IAVE route as the best available evidence of how Portugal administers this kind of exam, not as a guarantee of the future format.

---

## 9. Editorial rules for the app until the regulation lands

1. Every civics page carries a dated status banner: *«Ainda não regulamentado — última verificação: 10 de agosto de 2026.»*
2. Teach the five statutory domains. Do not invent question counts, pass marks, durations or fees.
3. Never state that CPLP nationals are exempt from the civics test. Article 6.º n.º 10 says the opposite.
4. Ask for the application submission date in onboarding; tell pre-19-May-2026 applicants they are likely covered by the old law (art. 7.º n.º 2).
5. Re-verify weekly until published, then rewrite this file in full.

---

## Fontes

1. **Lei Orgânica n.º 1/2026, de 18 de maio** — «Alteração à Lei n.º 37/81, de 3 de outubro, que aprova a Lei da Nacionalidade». *Diário da República*, 1.ª série, N.º 95, 18-05-2026, pp. 2–20. Full PDF retrieved and read in full; all verbatim quotations in this file come from it. https://files.diariodarepublica.pt/1s/2026/05/09500/0000200020.pdf
2. Diário da República Eletrónico — diploma record for Lei Orgânica n.º 1/2026. https://diariodarepublica.pt/dr/detalhe/lei-organica/1-2026-1123539996
3. Diário da República Eletrónico — consolidated *Lei da Nacionalidade* (Lei n.º 37/81). https://diariodarepublica.pt/dr/legislacao-consolidada/lei/1981-34536975-48300175
4. Diário da República Eletrónico — consolidated *Regulamento da Nacionalidade Portuguesa* (Decreto-Lei n.º 237-A/2006, de 14 de dezembro). https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/2006-34442175-46640975
5. Ministério da Justiça / justica.gov.pt — *Submeter pedido de nacionalidade* (source of the quotation on pending regulation). https://justica.gov.pt/Servicos/Submeter-pedido-de-nacionalidade
6. Ordem dos Advogados — *Informação Jurídica: Nacionalidade* legislation index (used to confirm no diploma later than 18-05-2026). https://portal.oa.pt/publicacoes/informacao-juridica/direito-nacional/áreas-de-referencia/justica/nacionalidade/
7. XXV Governo Constitucional — Comunicados do Conselho de Ministros de 9, 17, 23 e 30 de julho de 2026 (each checked individually; none mentions nationality). https://portugal.gov.pt/pt/gc25/governo/comunicados-do-conselho-de-ministros
8. Direção-Geral da Educação (DGE) — *Prova de Língua Portuguesa para Aquisição de Nacionalidade*; Portaria n.º 176/2014, de 11 de setembro; IAVE, I.P.; CAPLE and alternative proofs. https://www.dge.mec.pt/prova-de-lingua-portuguesa-para-aquisicao-de-nacionalidade
9. Executive Digest (SAPO), 8 May 2026 — IRN clarification that the governing law is fixed by the electronic submission date. *Secondary source.* https://executivedigest.sapo.pt/nova-lei-da-nacionalidade-irn-esclarece-que-pedidos-submetidos-antes-da-nova-lei-mantem-regras-antigas/
10. Assembleia da República — petition on the transition regime of Lei Orgânica n.º 1/2026. https://participacao.parlamento.pt/initiatives/6439
11. Presidência da República, 3 May 2026 — promulgation of the parliamentary decree. https://www.presidencia.pt/atualidade/toda-a-atualidade/2026/05/presidente-da-republica-promulga-decreto-da-assembleia-da-republica/

### Gaps and access notes — NÃO VERIFICADO

- **diariodarepublica.pt is a client-rendered OutSystems application.** Sources 2, 3 and 4 could not be read programmatically — every request returns a 2.3 KB JavaScript shell. The negative finding in section 7 therefore rests on the government service page, the OA index, the July Council of Ministers communiqués and a domain-restricted search, **not** on a direct reading of a DRE "Alterado por" table. A human should open sources 2 and 4 in a browser to confirm no 2026 amending diploma is listed.
- **dre.tretas.org returned HTTP 403**; that independent mirror could not be used as a cross-check.
- **Declaração de Retificação n.º 17/2026/1** is reported by the Ordem dos Advogados index only. Its number, date and exact content were not read at source.
- **The IRN circular** behind the submission-date rule was not located on irn.justica.gov.pt (the nationality URL 301-redirects to justica.gov.pt). Only the press report of it was read.
- **No August 2026 Council of Ministers communiqué** was located or checked. If a meeting was held between 1 and 10 August 2026, it has not been reviewed here. Check this first on the next pass.
- **Exam mechanics are entirely unknown**: format, number of questions, pass mark, duration, language of the paper, provider, fee, sitting calendar, retake rules, validity period of a pass, and any accommodation for age or disability. None of this is inferable from the statute.
- Whether alínea **d)** will be examined at all, or evidenced some other way, is genuinely open — the statute does not say.

---

## Prompt context

A Lei Orgânica n.º 1/2026, de 18 de maio, alterou a Lei da Nacionalidade (Lei n.º 37/81) e entrou em vigor a 19 de maio de 2026. Para a naturalização, o artigo 6.º, n.º 1, exige agora: residência legal de sete anos, no caso de nacionais de países de língua oficial portuguesa e da União Europeia, ou de dez anos, no caso dos outros países; comprovar, através de teste ou de certificado, conhecer suficientemente a língua e a cultura portuguesas, a história e os símbolos nacionais (alínea c); conhecer suficientemente os direitos e deveres fundamentais e a organização política do Estado português (alínea d); declarar solenemente a adesão aos princípios fundamentais do Estado de direito democrático (alínea e); e ter capacidade para assegurar a sua subsistência (alínea i). O n.º 10 do artigo 6.º presume que os nacionais de países de língua oficial portuguesa cumprem apenas a primeira parte da alínea c), ou seja, a língua. A cultura, a história, os símbolos nacionais e a organização política não estão abrangidos por essa presunção: quem vem do Brasil, de Angola ou de Cabo Verde continua a ter de demonstrar esses conhecimentos. O artigo 4.º deu ao Governo 90 dias, a contar de 18 de maio de 2026, para alterar o Regulamento da Nacionalidade Portuguesa. Até 10 de agosto de 2026 esse regulamento não foi publicado: ainda não há formato, matéria, taxas nem datas oficiais para o teste. Os pedidos entregues antes de 19 de maio de 2026 continuam sujeitos à lei antiga (artigo 7.º, n.º 2).
