# QA de factos — bancos CIPLE e cívica

> Auditoria factual de todo o conteúdo em `content/ciple/` e `content/civica/`, feita a
> 10 de agosto de 2026, depois da QA de registo (`content/qa-registo.md`).
> **Nenhum ficheiro de conteúdo foi editado.** Este relatório só reporta.
>
> Verificou-se: (1) todas as alegações de formato do CIPLE contra o dossiê `exame.md` **e**
> contra o próprio CAPLE ao vivo; (2) uma amostra de 35 perguntas de cívica espalhadas pelos
> três bancos, com verificação em fonte viva para datas, nomes e titulares de cargos;
> (3) contagem e integridade estrutural de **todos** os bancos de perguntas; (4) contradições
> internas entre ficheiros.

---

## 1. Contagens verificadas

### Bancos de cívica — escolha múltipla

Validação por script: cabeçalho `## Q###`, exatamente 4 linhas `- [ ]`/`- [x]`, exatamente
uma `- [x]`, e um par `**Pergunta:**` / `**Explicação:**` / `**Fonte:**` por item.

| Ficheiro | Perguntas | Etiquetas | Opções | Violações |
|---|---|---|---|---|
| `civica/banco-estado.md` | **97** | estado 54 · simbolos 21 · direitos 22 | 388 = 97 × 4 | **0** |
| `civica/banco-cultura.md` | **78** | cultura 58 · geografia 20 | 312 = 78 × 4 | **0** |
| `civica/banco-historia.md` | **96** | historia 96 | 384 = 96 × 4 | **0** |
| **Total** | **271** | — | 1084 | **0** |

Numeração `Q001…Q0NN` contígua nos três ficheiros, sem saltos nem duplicados. **Zero
perguntas com duas respostas certas, zero com nenhuma, zero com número de opções diferente
de quatro.** Não há violações a reportar por número de pergunta.

### Bancos e simulacros do CIPLE

| Ficheiro | Alegação do próprio ficheiro | Contagem real | Estado |
|---|---|---|---|
| `ciple/banco-oral.md` | "Banco de 40 perguntas por tema", 8 temas | 40 perguntas, 8 temas × 5, sequência 1–40 intacta | ✅ |
| `ciple/banco-oral.md` | "complementam as 35 do dossiê `producao-oral.md` §8" | `producao-oral.md` §8 tem 35 | ✅ |
| `ciple/banco-escrita.md` | "20 practice tasks", 10 A + 10 B | A1–A10 e B1–B10 = 20 | ✅ |
| `ciple/banco-escuta.md` | "twelve scripts… Forty-seven items in total" | 12 guiões, 47 itens (3 + 4×11) | ✅ |
| `ciple/simulado-1.md` | Leitura 20 itens · Oral 25 itens | 5+5+5+5 = 20 · 15+10 = 25 | ✅ |
| `ciple/simulado-2.md` | Leitura 20 itens · Oral 25 itens | 5+5+5+5 = 20 · 15+10 = 25 | ✅ |

**Chaves de correção conferidas item a item:**

- `simulado-1.md` Tarefa C: chave 11-B · 12-C · 13-E · 14-G · 15-H confere com o texto da
  Olena; as opções que sobram são exatamente **A, D, F**, como o ficheiro promete.
- `simulado-1.md` Parte 2 da escuta: `A E I F J C D G H B` — dez letras, cada uma uma só vez.
- `simulado-2.md` Parte 2 da escuta: chave `A C G F D B E H I J` conferida **frase a frase**
  contra o quadro A–J (comprimidos→farmácia A, dente→dentista C, triagem→urgências G,
  candidatou-se→entrevista F, travões→oficina D, o 34 já passou→paragem B, linha→estação E,
  atestado→junta H, passadeira→ginásio I, ecrã/garantia→loja J). **10/10 corretas.**
- `simulado-1.md` Tarefa A e D e `simulado-2.md` Tarefa A: chaves conferidas contra os textos.
  Nenhum erro.

---

## 2. Formato do CIPLE — reverificado no CAPLE ao vivo

WebFetch de `caple.letras.ulisboa.pt/exame/2/ciple` e da FAQ, a 10 de agosto de 2026.
Tudo o que segue está **confirmado na fonte oficial** e bate certo com `exame.md`:

| Facto | CAPLE ao vivo | `exame.md` |
|---|---|---|
| Compreensão da Leitura e Produção e Interação Escritas | 1h15 · 45 % | ✅ igual |
| Compreensão do Oral | 30 min · 30 % | ✅ igual |
| Produção e Interação Orais | **15 m** · 25 % | ✅ igual |
| Muito Bom / Bom / Suficiente | 85–100 · 70–84 · 55–69 | ✅ igual |
| Taxa 2026 | 95,00 € | ✅ igual |
| Texto das Partes I e II de cada componente | verbatim | ✅ igual |
| Caixa-resumo "N.º de componentes: 4" | confirmada (o intervalo de 15 min conta como o 4.º) | ✅ `compreensao-oral.md` já assinala esta incoerência do CAPLE, e assinala-a corretamente |
| FAQ: idades 16+, versões escolares 12–15, TEJO 9–11 | confirmado | ✅ igual (`exame.md` §4) |
| FAQ: mínimo por componente | **não publicado** | ✅ o tratamento NÃO VERIFICADO em `exame.md`, `producao-oral.md`, `leitura-escrita.md` e `simulado-1.md` está correto e é coerente entre si |

---

## 3. Erros encontrados

Formato: `- ficheiro Q### / linha: alegação -> correção (fonte)`

### Bloqueadores (corrigir antes de seed)

- **`ciple/producao-oral.md` linha 19:** tabela dá a Produção e Interação Orais como
  **"10–15 min per pair"**, e a linha 20 atribui a tabela a *"Source: CAPLE's own CIPLE page"*
  -> **o CAPLE publica "15m"**. O valor 10–15 vem, na verdade, do **Centro de Língua
  Portuguesa de Cáceres**, terceiro, que é a fonte 9 do próprio ficheiro (linha 493). Corrigir
  para 15 min e reatribuir a fonte. (CAPLE, página do CIPLE, lida a 10-08-2026)

- **`ciple/simulado-1.md` linha 30:** tabela de componentes dá **"10–15 min por par"**
  -> **15 min por par**. Contradiz o próprio ficheiro: a nota de Fontes na linha 1073 diz que
  o CAPLE dá as durações *"(1h15 / 30 m / 15 m por par)"*. (CAPLE, página do CIPLE; e
  `simulado-1.md` linha 1073)

- **`ciple/simulado-2.md` linha 580:** *"Duração: **10–15 minutos**, com dois candidatos ao
  mesmo tempo sempre que possível"* marcada **`[FORMATO OFICIAL]`** -> **15 min**, e a etiqueta
  `[FORMATO OFICIAL]` não se aplica a este número. Contradiz a tabela de componentes do próprio
  ficheiro, na linha 32, que já diz **"15 min por par"**. (CAPLE, página do CIPLE;
  `simulado-2.md` linha 32)

- **`civica/estado-cultura.md` linha 175:** *"os nacionais dos **países da CPLP** estão
  **dispensados** do exame de língua"* -> a categoria legal do artigo 6.º, n.º 10 é
  **"nacionais de países de língua oficial portuguesa"**, e o efeito é uma **presunção
  ilidível** («presume-se»), não uma dispensa. Ser membro da CPLP não é o mesmo que ser país
  de língua oficial portuguesa — a Guiné Equatorial é membro da CPLP e o seu estatuto
  linguístico não é equiparável. Esta linha viola a regra editorial 3 do próprio
  `civica/regulamento.md` e é a formulação mais frouxa de todo o conjunto; `banco-estado.md`
  Q094 acerta («presumivelmente dispensados… apenas da primeira parte da alínea c)»).
  (Lei Orgânica n.º 1/2026, art. 6.º n.º 10; `civica/regulamento.md` §4 e §9)

### Correções de menor gravidade (não bloqueiam)

- **`ciple/exame.md` linha 64:** *"the exact label used below 55% (e.g. Não aprovado) is not
  published on the CIPLE page"* (marcado NÃO VERIFICADO) -> **está publicado**, na FAQ do
  CAPLE: *«Recebe uma informação sobre a classificação geral obtida: Insuficiente, Suficiente,
  Bom ou Muito Bom.»* O rótulo é **Insuficiente**. `producao-oral.md` linhas 29–30 já tem isto
  certo e cita a FAQ; `exame.md` está atrasado em relação ao ficheiro irmão. (CAPLE, FAQ, lida
  a 10-08-2026)

- **`ciple/exame.md` linha 45:** *"NÃO VERIFICADO: the exact number of items per part, and the
  required word count for the two written texts. CAPLE's public page does not publish them"*
  -> a ressalva é boa para a *página* do exame, mas ambos os dados **estão publicados nos
  modelos do CAPLE**, ligados a partir dessa mesma página, e estão citados literalmente noutros
  ficheiros deste conjunto: `leitura-escrita.md` linhas 52 e 145–166 dá *"Esta componente tem 6
  páginas e 2 partes"*, 20 itens em 4 tarefas de 5, *"deve ter uma extensão de 25-35 palavras"*
  e *"cerca de 60-80 palavras"*, tudo marcado `[MODELO]`; `compreensao-oral.md` linha 67 dá
  *"Esta componente tem 4 páginas e 25 questões"*. Estreitar a ressalva para "não estão na
  página do exame, estão nos modelos". (`leitura-escrita.md`; `compreensao-oral.md`)

- **`civica/banco-historia.md` Q070:** a resposta certa («Grândola, Vila Morena») **está
  correta** para o enunciado, que pergunta pela senha do *início das operações*. Mas o
  distrator **«E Depois do Adeus»** é a outra senha real do 25 de Abril — a primeira, às 22h55
  do dia 24, nos Emissores Associados de Lisboa — e a explicação só desmonta «A Portuguesa»,
  nunca menciona o distrator mais forte. Acrescentar uma linha à explicação, ou o item pune
  quem sabe mais história. (`civica/historia.md` §11; Centro de Documentação 25 de Abril)

- **`civica/banco-cultura.md` Q073:** enunciado diz *"de que estão **dispensados**"* onde a lei
  diz «presume-se». A categoria («países de língua oficial portuguesa») está certa e a resposta
  certa está substantivamente correta; só o verbo é mais forte do que o estatuto.
  (Lei Orgânica n.º 1/2026, art. 6.º n.º 10)

- **Topónimo inconsistente:** `Tratado de **Alcanizes**` (`civica/historia.md`,
  `civica/banco-historia.md` Q012 e Q094) vs `Tratado de **Alcanises**`
  (`civica/estado-cultura.md` §8). Ambas as grafias circulam; escolher uma. **Já sinalizado
  pela QA de registo** (`qa-registo.md` §3, item 4) — repetido aqui só para não se perder.

### Duplicação entre bancos — decisão de seed, não erro factual

Onze perguntas repetem-se entre bancos, oito delas com o enunciado **byte a byte igual**. Se a
aplicação sortear de um conjunto unificado, o aluno vê a mesma pergunta duas vezes.

| Par / trio | Assunto |
|---|---|
| estado Q035 = cultura Q046 | 18 distritos |
| estado Q036 = cultura Q045 | as duas regiões autónomas |
| estado Q040 = cultura Q047 | 308 municípios |
| estado Q047 = historia Q090 | Schengen 1995 |
| estado Q053 = cultura Q072 | CPLP tem nove membros |
| estado Q073 = cultura Q066 | o que se celebra a 25 de abril |
| estado Q074 = cultura Q067 | o que se celebra a 5 de outubro |
| estado Q075 = cultura Q068 | o que se celebra a 1 de dezembro |
| estado Q045 ≈ historia Q088 | data da adesão à CEE |
| estado Q046 ≈ historia Q086 | onde se assinou o Tratado de Adesão |
| estado Q054 ≈ historia Q089 | qual país NÃO é da CPLP |

Recomendação: manter os três bancos como estão (cada um é coerente por si) e desduplicar na
ingestão, com uma chave de deduplicação sobre o enunciado normalizado.

---

## 4. Amostra de 35 perguntas de cívica — verificação dirigida

Escolhidas em intervalos regulares nos três bancos. Todas as respostas assinaladas com `[x]`
foram conferidas contra os dossiês e, nos casos de data, nome ou titular de cargo, contra
fonte viva.

**`banco-estado.md`** — Q004 (Constituição 1976) ✅ · Q011 (35 anos, CRP art. 122.º) ✅ ·
Q019 (230 deputados) ✅ · Q028 (substituição pelo Presidente da AR, CRP art. 132.º) ✅ ·
Q040 (308 municípios) ✅ · Q049 (21 deputados ao PE) ✅ · Q051 (ONU desde 1955) ✅ ·
Q053 (CPLP nove) ✅ · Q061 (cinco besantes por quina) ✅ · Q062 (bandeira 1911) ✅ ·
Q080 (pena de morte 1867) ✅ · Q087 (voto aos 18) ✅ · Q094 (presunção só da língua) ✅

**`banco-historia.md`** — Q005 (Zamora 1143) ✅ · Q021 (Saragoça 1529) ✅ ·
Q029 (Tratado de Lisboa 1668) ✅ · Q042 (152 fortificações) ✅ · Q055 (Manuel de Arriaga
1911) ✅ · Q061 (Salazar Presidente do Conselho desde 1932) ✅ · Q065 (Angola, 4-02-1961) ✅ ·
Q070 (Grândola — certa, mas ver §3) ⚠️ · Q076 (CRP em vigor a 25-04-1976) ✅ ·
Q081 (Guiné-Bissau, 1974) ✅ · Q084 (Macau 1999) ✅ · Q090 (Schengen 1995) ✅

**`banco-cultura.md`** — Q002 (Os Lusíadas 1572) ✅ · Q013 (Saramago, Nobel 1998) ✅ ·
Q016 (fado, UNESCO 2011) ✅ · Q018 (guitarra portuguesa, doze cordas) ✅ ·
Q029 (Região Demarcada do Douro, 1756) ✅ · Q039 (Torre, 1993 m) ✅ · Q056 (17 bens
UNESCO) ✅ · Q064 (13 feriados obrigatórios) ✅ · Q071 (mais de 250 milhões de falantes) ✅ ·
Q076 (≈14 % de estrangeiros) ✅

**Resultado da amostra: 35/35 com a resposta assinalada correta.** Um item (historia Q070)
tem a resposta certa mas a explicação incompleta.

### Factos confirmados em fonte viva (nenhuma alteração necessária)

- **Presidente da República:** António José Seguro, eleito na 2.ª volta a **8 de fevereiro de
  2026**, com **3 502 613 votos** e **66,84 %** — os três números batem exatamente com
  `estado-cultura.md` §3. (presidencia.pt)
- **Primeiro-Ministro:** Luís Montenegro, **XXV Governo Constitucional, empossado a 5 de junho
  de 2025** — confere com "empossado em junho de 2025". (portugal.gov.pt)
- **Revisões constitucionais:** **sete** concluídas, a última de **2005**. O processo de oitava
  revisão arrancou em 2023 e **caducou** com a dissolução do parlamento. `banco-estado.md` Q006
  ("Sete, sendo a última de 2005") está **correto**, e a dúvida deixada em `historia.md` §Lacunas
  ponto 3 pode ser fechada. (parlamento.pt / Tribunal Constitucional)
- **Património Mundial da UNESCO em Portugal:** **17** bens. `banco-cultura.md` Q056 correto.
- **Feriados obrigatórios:** **13** no artigo 234.º do Código do Trabalho, três deles móveis
  (Sexta-feira Santa, Domingo de Páscoa, Corpo de Deus), mais Terça-feira de Carnaval e feriado
  municipal como facultativos. `banco-cultura.md` Q064, Q065 e Q070 corretos.
- **Regulamento da Nacionalidade:** **continua por publicar** a 10 de agosto de 2026; o prazo
  de 90 dias do artigo 4.º só termina a **16 de agosto de 2026**. A conclusão de
  `civica/regulamento.md` §1 e §7, de `civica/historia.md` §Lacunas e de `ciple/exame.md` §6
  está **atual e correta**. Nenhum ficheiro afirma indevidamente que o teste já tem formato.

---

## 5. Recomendação GO / NO-GO por ficheiro

| Ficheiro | Recomendação | Porquê |
|---|---|---|
| `civica/banco-estado.md` | **GO** | 97 itens, estrutura perfeita, amostra 13/13 correta. Desduplicar na ingestão. |
| `civica/banco-cultura.md` | **GO** | 78 itens, estrutura perfeita, amostra 10/10 correta, incluindo os números difíceis (17 UNESCO, 13 feriados). |
| `civica/banco-historia.md` | **GO** | 96 itens, estrutura perfeita, amostra 12/12 correta. Melhorar a explicação de Q070 quando houver oportunidade — não bloqueia. |
| `civica/regulamento.md` | **GO** | Conclusão negativa reconfirmada ao vivo; datas e citações da lei corretas. Reverificar a 16-08-2026. |
| `civica/historia.md` | **GO** | Cronologia e lacunas honestas; a lacuna 3 (oitava revisão) pode agora ser fechada como "sete, a última de 2005". |
| `civica/estado-cultura.md` | **NO-GO até corrigir a linha 175** | Tudo o resto verifica, incluindo os titulares de cargos ao dia. A conflação CPLP / país de língua oficial portuguesa é o erro comercialmente mais perigoso de todo o conjunto e contradiz a regra do próprio `regulamento.md`. |
| `ciple/exame.md` | **GO com duas edições** | Formato, taxa, bandas, centros e calendário todos confirmados no CAPLE. Só as duas ressalvas NÃO VERIFICADO estão desatualizadas (§3 rótulo *Insuficiente*; §2 contagens e número de palavras). |
| `ciple/leitura-escrita.md` | **GO** | É o ficheiro mais bem sourced do conjunto; as citações do modelo conferem. |
| `ciple/compreensao-oral.md` | **GO** | 30 min / 25 itens confirmados no modelo; a incoerência "4 componentes" do CAPLE está corretamente assinalada. |
| `ciple/producao-oral.md` | **NO-GO até corrigir a linha 19** | Número errado (10–15) atribuído ao CAPLE. O resto do ficheiro — sobretudo a análise do falso mínimo de 25 % por componente — é sólido e deve ficar como está. |
| `ciple/programa-a2.md` | **GO** | Tabela de formato bate certo com o CAPLE (15 min por par). |
| `ciple/banco-escuta.md` | **GO** | 12 guiões, 47 itens conforme anunciado; declara com honestidade que nada é material do CAPLE. |
| `ciple/banco-escrita.md` | **GO** | 20 tarefas conforme anunciado; contagens de palavras corretas contra o modelo. |
| `ciple/banco-oral.md` | **GO** | 40 perguntas, 8 × 5, sequência intacta; recusa explicitamente o mínimo de 25 % por componente, e bem. |
| `ciple/simulado-1.md` | **GO com uma edição** | Chaves 100 % consistentes. Só a linha 30 (10–15 min) contradiz a própria fonte do ficheiro. |
| `ciple/simulado-2.md` | **GO com uma edição** | Chaves 100 % consistentes, incluindo as 10 correspondências da Parte 2. Só a linha 580 (10–15 min, marcada oficial) contradiz a linha 32. |

**Resumo:** 271 perguntas de cívica e todos os bancos do CIPLE estão estruturalmente
impecáveis e factualmente sólidos. **Dois ficheiros ficam NO-GO** (`civica/estado-cultura.md`,
`ciple/producao-oral.md`) e **quatro precisam de uma edição de uma linha**
(`ciple/exame.md` ×2, `ciple/simulado-1.md`, `ciple/simulado-2.md`). Nenhum banco de perguntas
precisa de alteração para poder ser semeado.

---

## Fontes

1. CAPLE — página do exame CIPLE (componentes, durações, pesos, bandas de classificação, taxa de 95,00 €, texto das Partes I e II, caixa "N.º de componentes: 4"), lida a 10-08-2026 — https://caple.letras.ulisboa.pt/exame/2/ciple
2. CAPLE — Perguntas Frequentes (rótulos *Insuficiente, Suficiente, Bom ou Muito Bom*; ausência de mínimo por componente; idades 16+, versões escolares 12–15, TEJO 9–11), lida a 10-08-2026 — https://caple.letras.ulisboa.pt/pagina/2/faq
3. Presidência da República Portuguesa — biografia do Presidente (eleição a 8 de fevereiro de 2026, 3 502 613 votos, 66,84 %) — https://www.presidencia.pt/presidente-da-republica/o-presidente/biografia/
4. XXV Governo Constitucional — Primeiro-Ministro Luís Montenegro (governo empossado a 5 de junho de 2025) — https://www.portugal.gov.pt/pt/gc25/primeiro-ministro
5. Assembleia da República — Revisões Constitucionais (sete revisões concluídas, a última em 2005) — https://www.parlamento.pt/RevisoesConstitucionais/paginas/default.aspx
6. Tribunal Constitucional — Leis de Revisão Constitucional — https://www.tribunalconstitucional.pt/tc/crp-revisoes.html
7. UNESCO / Lista do Património Mundial — Portugal, 17 bens inscritos — https://whc.unesco.org/en/statesparties/pt
8. Diário da República — Lei Orgânica n.º 1/2026, de 18 de maio, artigo 6.º n.os 1 e 10 e artigo 4.º — https://files.diariodarepublica.pt/1s/2026/05/09500/0000200020.pdf
9. Código do Trabalho, artigo 234.º — feriados obrigatórios e facultativos — https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2009-34546475
10. `content/ciple/exame.md`, `content/ciple/leitura-escrita.md`, `content/ciple/compreensao-oral.md`, `content/ciple/producao-oral.md` — dossiês do repositório usados como termo de comparação
11. `content/civica/regulamento.md`, `content/civica/estado-cultura.md`, `content/civica/historia.md` — dossiês do repositório usados como termo de comparação
12. `content/qa-registo.md` — QA de registo pt-PT anterior, de 10-08-2026 (item 4 da secção 3, grafia Alcanizes/Alcanises)

### Lacunas desta auditoria — NÃO VERIFICADO

- A amostra dirigida cobriu **35 de 271** perguntas de cívica. As restantes 236 foram lidas e
  conferidas contra os dossiês, mas **não** tiveram verificação em fonte viva item a item.
- O **calendário de 2026 do CAPLE** continua publicado apenas como imagem; as datas nacionais e
  as datas do LAPE-FLUL em `exame.md` §9 não foram reverificadas nesta passagem.
- Os artigos do **PÚBLICO** citados em `exame.md` §10 continuam a devolver HTTP 403 a acesso
  automático; escassez de vagas e diplomas falsos permanecem por confirmar em texto integral.
- O **mínimo por componente** do CIPLE continua por publicar pelo CAPLE. A posição dos ficheiros
  (tratá-lo como NÃO VERIFICADO) é a correta e foi mantida.
- O **Regulamento da Nacionalidade** tem de ser reverificado a partir de **16 de agosto de 2026**;
  toda a secção de cívica assenta na sua ausência.

---

## Prompt context

O CIPLE é o exame A2 do CAPLE e tem três componentes: Compreensão da Leitura e Produção e Interação Escritas, com 1h15 e 45% da nota; Compreensão do Oral, com 30 minutos, 25 questões e 30%; e Produção e Interação Orais, com 15 minutos por par de candidatos e 25%. A prova escrita tem 20 itens de leitura em quatro tarefas de cinco e dois textos para escrever, um de 25 a 35 palavras e outro de cerca de 60 a 80 palavras. As classificações são Muito Bom, dos 85% aos 100%, Bom, dos 70% aos 84%, Suficiente, dos 55% aos 69%, e Insuficiente abaixo dos 55%. Aprova-se com 55% no total; o CAPLE não publica nota mínima por componente. A taxa em 2026 é de 95 euros. Fazem o exame pessoas a partir dos 16 anos; há versões escolares dos 12 aos 15 e o TEJO dos 9 aos 11. Para a nacionalidade, a Lei Orgânica n.º 1/2026 exige conhecer a língua, a cultura, a história e os símbolos nacionais e ainda os direitos e deveres fundamentais e a organização política do Estado. Quem é nacional de país de língua oficial portuguesa beneficia apenas de uma presunção quanto à língua, que pode ser afastada; não está dispensado da cultura, da história, dos símbolos nem da cidadania. A 10 de agosto de 2026 o regulamento do teste de cidadania ainda não estava publicado, pelo que não há formato, matéria, nota mínima nem datas oficiais.
