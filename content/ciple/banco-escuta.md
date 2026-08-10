# CIPLE — Banco de Escuta

> Twelve original pt-PT listening scripts written for the app's TTS, each with exam-style questions
> and a marked answer key. Built to the shape of the real CIPLE *Compreensão do Oral* paper as
> documented in `content/ciple/compreensao-oral.md`, and to the A2 content spec in
> `content/ciple/programa-a2.md`.

---

## What this file is, and what it is not

**It is** twelve scripts the app can send straight to a European Portuguese TTS voice, plus 3–4
multiple-choice items each, plus a key that names *why* each wrong option is wrong. Forty-seven
items in total.

**It is not** CAPLE material. CAPLE publishes one model listening paper, one audio file and one key,
and **no transcript of any kind** (`compreensao-oral.md`, *Gaps*, item 7). Everything below is
newly written for this app. Nothing here is copied from CAPLE, and no claim is made that any of it
has appeared in a real exam.

**Two deliberate departures from the real paper, stated up front so nobody is surprised:**

1. **These are longer.** The ten texts in CAPLE's model audio run **19–57 seconds** on first
   audition (measured, see the dossier). The brief for this bank is 30–90 seconds, so the scripts
   here sit at roughly 40–65 s. That is a *training* choice — more listening per item, more chances
   to hear a reduction — not a claim about exam length. Before a full mock exam, use the short ones
   (Áudios 1, 5, 9) and cut the long dialogues.
2. **Every script here carries 3–4 questions.** The real Parte 1 carries **one or two** per text.
   Splitting these into 1–2-question chunks is trivial and is the right move for mock-exam mode;
   the extra questions exist so that a single recording pays for itself in practice mode.

**Register warning that applies to every line below:** the administrative, commercial and medical
details inside these scripts are **invented** to create listening tasks. Opening hours, warranty
periods, postal prices, waiting times, which document a counter asks for — all fiction. This file
teaches Portuguese. It does not describe how any Portuguese public service actually works, and
nothing in it should be surfaced in the app as procedural advice.

---

## Production notes for the TTS pipeline

- **Voice must be pt-PT.** A pt-BR voice invalidates the entire exercise: it will not reduce
  unstressed vowels, will not produce final `s` → [ʃ], and will read `estar a + infinitivo` with the
  wrong prosody. If only one pt-PT voice is available, the dialogues still work — see below.
- **Speaker labels are metadata, not text.** `EMPREGADO:` / `CLIENTE:` must never be spoken. Strip
  the label, switch voice, insert ~350 ms of silence at each turn change.
- **One voice only?** Then insert ~500 ms between turns and change nothing else. It degrades the
  realism but not the vocabulary or the items. Do not have one voice read the labels aloud.
- **All numbers, times and prices are written out in words.** This is on purpose. It stops the TTS
  guessing (`18h30` gets read a dozen ways), and it fixes exactly which spoken form the learner is
  trained on. Where the alternative form matters, the key says so — e.g. *dezoito e trinta* and
  *seis e meia da tarde* are the same time and both must eventually be trainable.
- **Stage directions in round brackets** — `(tom de anúncio público)` — are for the voice
  configuration, not for speaking.
- **Reproduce the exam cycle when in mock mode.** From the measured CAPLE audio: text → ~6 s pause →
  ~2 s beep → ~4 s pause → the same text again → ~14 s to answer → ~9 s to read the next questions.
  The 9 seconds of pre-reading is the single most important thing to replicate; it is what makes
  the real paper hard.
- **Estimated durations below** are word count ÷ ≈2.6 words per second (≈155 wpm, a normal pt-PT TTS
  rate), counting spoken words only — labels and stage directions excluded. Dialogues will run about
  4–5 s longer than the figure given once the inter-turn silences are inserted, which keeps every
  script inside the 30–90 s window. They are estimates: measure them once against the real voice and
  correct this file.

### How the questions are built

Every distractor is one of the six traps documented in `compreensao-oral.md` §*How the items are
built to catch you*, and the key names which:

| Tag | Trap |
|---|---|
| `ECO` | Lexical echo — the wrong option quotes words that were definitely said; the right one paraphrases |
| `TROCA` | One-detail swap — right number, wrong floor/door/side/platform |
| `NÚM` | Number confusion — both numbers are spoken in the text |
| `NEG` | Negation and modality — *tem de* / *não é preciso* / *só* / *apenas* |
| `CAUSA` | Cause reversed — same ingredients, inverted logic |
| `OPIN` | Stance, not fact — the stem asks what someone *says* or *prefers* |

---

## Os doze guiões

### Áudio 1 — Atraso e mudança de porta no aeroporto

- **Tipo:** aviso público, uma voz · **Espaço:** aeroporto
- **Domínio A2:** 5. Viagens e deslocações (5.1, 5.6) · **Duração estimada:** ≈ 40 s
- **Foco:** números de porta e de voo, *atraso*, obrigação (*tem de se dirigir*), vocabulário de
  embarque. Fonética: *dezasseis* / *dezassete*, nasais em *não*, `s` final antes de vogal
  (*os senhores passageiros* → *ushenhôresh*).

**Guião:**

> (VOZ FEMININA, tom de anúncio público, ritmo pausado, ligeiro eco)
>
> Informação aos senhores passageiros. O voo mil duzentos e quarenta e cinco, com destino ao
> Funchal, com partida prevista para as dezasseis e vinte, vai partir com um atraso de
> aproximadamente quarenta minutos, por razões operacionais. O embarque passa a ser feito na porta
> vinte e três, e não na porta doze, como estava indicado nos ecrãs. Repetimos: porta vinte e três.
> Pedimos aos passageiros que tenham bagagem de mão de tamanho superior ao permitido que se dirijam
> ao balcão da companhia antes do embarque. Os passageiros com crianças pequenas e com mobilidade
> reduzida podem embarcar em primeiro lugar. Obrigada pela vossa compreensão e boa viagem.

**Perguntas:**

1. O voo para o Funchal
   A. foi cancelado.
   B. parte cerca de quarenta minutos mais tarde.
   C. parte mais cedo do que estava previsto.

2. Os passageiros devem dirigir-se
   A. à porta doze.
   B. ao balcão dos ecrãs.
   C. à porta vinte e três.

3. Quem tem de ir ao balcão da companhia antes de embarcar?
   A. Quem viaja com crianças pequenas.
   B. Quem leva bagagem de mão maior do que o permitido.
   C. Todos os passageiros do voo.

**Chave:** 1-B · 2-C · 3-B

- **1** `ECO`+`NEG` — "cancelado" is never said; *atraso de aproximadamente quarenta minutos* is.
  C inverts *atraso*.
- **2** `TROCA` — *porta doze* is spoken aloud, as the old gate. This is the commonest single
  mistake in airport announcements: the number you hear first is the wrong one.
- **3** `ECO` — A quotes a group that *is* mentioned, but for the opposite reason (they board first,
  they do not go to the counter). The condition is *bagagem de mão de tamanho superior ao permitido*.

---

### Áudio 2 — Marcar uma consulta no centro de saúde

- **Tipo:** diálogo, duas vozes · **Espaço:** centro de saúde
- **Domínio A2:** 6. Saúde e higiene (6.5); 9. Serviços (9.5) · **Duração estimada:** ≈ 65 s
- **Foco:** datas e horas concorrentes, *marcar* / *desmarcar*, condicional de cortesia (*queria*),
  *ter de* + infinitivo, *se faz favor*. Fonética: *dezassete* vs *vinte e sete*; *não sei de cor*.

**Guião:**

> **UTENTE (homem, 40 anos, sotaque estrangeiro ligeiro):** Boa tarde. Queria marcar uma consulta
> com a médica de família, se faz favor.
> **ADMINISTRATIVA:** Boa tarde. Tem aí o número de utente?
> **UTENTE:** Não sei de cor, mas trago o cartão de cidadão.
> **ADMINISTRATIVA:** Chega perfeitamente. Ora bem... a doutora Sousa só tem vaga no dia dezassete,
> de manhã, às dez e um quarto.
> **UTENTE:** Dezassete? É que eu de manhã estou a trabalhar. Não há nada à tarde?
> **ADMINISTRATIVA:** À tarde, só na semana seguinte, dia vinte e quatro, às quinze e trinta. Se for
> urgente, pode vir amanhã à consulta aberta, mas aí não é a sua médica e pode ter de esperar duas
> ou três horas.
> **UTENTE:** Não, urgente não é. Fico com o dia vinte e quatro, então.
> **ADMINISTRATIVA:** Muito bem. Fica marcado para as quinze e trinta. Traga o cartão de cidadão e,
> se estiver a tomar alguma medicação, traga também a lista dos medicamentos. E não se esqueça: se
> não puder vir, telefone a desmarcar com pelo menos vinte e quatro horas de antecedência.
> **UTENTE:** Está bem. Muito obrigado.

**Perguntas:**

1. O utente ficou com uma consulta
   A. no dia vinte e quatro, à tarde.
   B. no dia dezassete, de manhã.
   C. amanhã, na consulta aberta.

2. Porque é que ele não aceitou a primeira data?
   A. Porque a médica não é a dele.
   B. Porque teria de esperar duas ou três horas.
   C. Porque de manhã está a trabalhar.

3. A administrativa diz-lhe para levar
   A. o cartão de cidadão e, se tomar medicação, a lista dos medicamentos.
   B. o número de utente escrito num papel.
   C. uma receita da farmácia.

4. Se não puder ir à consulta, o utente
   A. não precisa de avisar.
   B. tem de telefonar no próprio dia de manhã.
   C. tem de avisar com, pelo menos, um dia de antecedência.

**Chave:** 1-A · 2-C · 3-A · 4-C

- **1** `NÚM` — three dates are live in the text (*dezassete*, *vinte e quatro*, *amanhã*). Only one
  is accepted, and the acceptance comes at the end: *fico com o dia vinte e quatro*.
- **2** `CAUSA` — A and B are both true statements about the *consulta aberta*, which is a different
  option; the reason for refusing the 17th is the morning work.
- **3** `ECO` — B quotes *número de utente*, which is said, but at the start and about something else.
- **4** `NEG` — *vinte e quatro horas de antecedência* has to be converted to *um dia*. The right
  option never repeats the number. This is exactly the CAPLE paraphrase pattern.

---

### Áudio 3 — Mensagem de voz da piscina municipal

- **Tipo:** mensagem de voz, uma voz · **Espaço:** instalação desportiva (tempos livres)
- **Domínio A2:** 4. Tempos livres (4.6); 3. Vida diária · **Duração estimada:** ≈ 50 s
- **Foco:** **dezanove vs dezoito e trinta** (the highest-yield confusion in the whole exam),
  dias da semana, *caducar*, *comprovativo de morada*, *dar jeito*.

**Guião:**

> (VOZ FEMININA, tom de mensagem de voz, natural e rápida)
>
> Boa tarde, senhor Oliveira. Estou a telefonar da piscina municipal, é a Marta, da receção. É só
> para o informar de que a aula de natação de terça-feira, às dezanove horas, vai mudar de horário a
> partir do próximo mês: passa a ser às dezoito e trinta. Se esse horário não lhe der jeito, temos
> vaga na turma de quinta-feira, à mesma hora. Já agora, o seu cartão de sócio caduca no fim do mês;
> pode renová-lo aqui na receção, de segunda a sexta, até às vinte e uma horas, e é preciso trazer um
> comprovativo de morada. Ah, e na próxima semana a piscina grande está fechada para limpeza, de
> segunda a quarta-feira; a piscina pequena continua aberta. Qualquer coisa, ligue para a receção.
> Até já, obrigada.

**Perguntas:**

1. A partir do próximo mês, a aula de terça-feira passa a ser
   A. às dezanove horas.
   B. às dezoito e trinta.
   C. às vinte e uma horas.

2. Se o novo horário não servir, o senhor Oliveira pode
   A. mudar para uma aula ao sábado.
   B. pedir a devolução do dinheiro.
   C. mudar para a turma de quinta-feira, à mesma hora.

3. Para renovar o cartão de sócio, é preciso levar
   A. um comprovativo de morada.
   B. uma fotografia.
   C. o cartão de sócio antigo e uma declaração médica.

4. Na próxima semana,
   A. a piscina está fechada toda a semana.
   B. a piscina grande está fechada de segunda a quarta-feira.
   C. a piscina pequena está fechada para limpeza.

**Chave:** 1-B · 2-C · 3-A · 4-B

- **1** `NÚM` — *dezanove* and *dezoito e trinta* are both spoken, in that order, and *dezanove* is
  the old one. Note also that a learner trained on pt-BR expects *dezenove*.
- **2** `ECO` — C paraphrases nothing, it repeats *quinta-feira*, but the trap here is the phrase
  *à mesma hora*: the same hour as **the new time**, not as the old one. Worth a follow-up question
  in tutor mode.
- **3** `NEG` — *é preciso trazer um comprovativo de morada*. Nothing else is required.
- **4** `TROCA` — *grande* and *pequena* swap. Same structure as the CAPLE floor/door items.

---

### Áudio 4 — Portátil avariado numa loja de informática

- **Tipo:** diálogo, duas vozes · **Espaço:** loja de produtos informáticos
- **Domínio A2:** 7. Compras (7.1, 7.5) · **Duração estimada:** ≈ 55 s
- **Foco:** *talão de compra*, *garantia*, *avariado*, *dias úteis*, *há* + tempo decorrido,
  condicional escondido em *se… então*. Um dos dez espaços da Parte 2.

**Guião:**

> **CLIENTE (mulher):** Boa tarde. Comprei aqui este portátil há cerca de oito meses e agora não
> carrega. Já experimentei outra tomada e nada.
> **TÉCNICO:** Deixe ver... Trouxe o carregador?
> **CLIENTE:** Trouxe, está aqui.
> **TÉCNICO:** E o talão de compra, trouxe?
> **CLIENTE:** O talão, não. Perdi-o. Mas paguei com multibanco, se isso ajudar.
> **TÉCNICO:** Ajuda, sim senhora. Com os últimos números do cartão encontramos a compra no sistema.
> Agora, atenção: se o problema for do carregador, trocamos o carregador no próprio dia. Se for da
> bateria, o computador tem de ficar cá e demora entre sete e dez dias úteis.
> **CLIENTE:** Dez dias? E não têm nenhum computador que me possam emprestar?
> **TÉCNICO:** Emprestar, não. Lamento. Mas, olhe, se quiser, leva hoje um carregador novo e
> experimenta em casa. Se resolver, ótimo; se não resolver, traz cá o computador na segunda-feira e
> nós tratamos disso.
> **CLIENTE:** Está bem, faço isso. Obrigada.

**Perguntas:**

1. Qual é o problema do computador?
   A. Não carrega.
   B. O ecrã está partido.
   C. Está muito lento.

2. A cliente não trouxe
   A. o carregador.
   B. o talão de compra.
   C. o computador.

3. Se o problema for da bateria, o computador
   A. fica na loja entre sete e dez dias úteis.
   B. é trocado no próprio dia.
   C. é substituído por outro igual.

4. O que é que a cliente vai fazer hoje?
   A. Deixar o computador na loja.
   B. Esperar por uma resposta da marca.
   C. Levar um carregador novo para experimentar em casa.

**Chave:** 1-A · 2-B · 3-A · 4-C

- **1** `ECO` — *carregador* and *tomada* are both said; the fault is *não carrega*.
- **2** — straight detail, but it hangs on one word: *o talão, não*. A learner who misses the
  negative particle in that elliptical answer gets it backwards. Drill: `não` after a repeated noun
  is the standard pt-PT way to answer "no" to a yes/no question.
- **3** `TROCA` — the two branches (*carregador* → same day / *bateria* → 7–10 days) are stated a
  second apart and are designed to be swapped.
- **4** `NEG` — *emprestar, não* rules out A-adjacent expectations; the plan is stated last.

---

### Áudio 5 — Aviso no mercado municipal

- **Tipo:** aviso público, uma voz · **Espaço:** mercado
- **Domínio A2:** 7. Compras (7.4, 7.5); 8. Alimentação · **Duração estimada:** ≈ 40 s
- **Foco:** preços ao quilo, **treze vs catorze**, *encerrar*, *feriado municipal*, peixe português.
  Fonética: *catorze* (nunca *quatorze*).

**Guião:**

> (VOZ MASCULINA, altifalante, tom institucional mas simpático)
>
> Senhores clientes, boa tarde. O mercado municipal informa que hoje, sábado, encerra às treze
> horas, e não às catorze, como é habitual. Na peixaria, a sardinha está hoje a três euros e noventa
> o quilo e o carapau a dois euros e cinquenta. Na secção da fruta, os melões nacionais estão a um
> euro e vinte cada um. Lembramos os senhores clientes de que os sacos reutilizáveis estão à venda
> na entrada principal e de que o parque de estacionamento é gratuito durante a primeira hora.
> Informamos ainda que, na próxima terça-feira, o mercado estará encerrado, por causa do feriado
> municipal. Bom fim de semana e boas compras.

**Perguntas:**

1. Hoje o mercado fecha
   A. às catorze horas, como é habitual.
   B. às treze horas.
   C. só ao fim da tarde.

2. Quanto custa o quilo de carapau?
   A. Dois euros e cinquenta.
   B. Três euros e noventa.
   C. Um euro e vinte.

3. O parque de estacionamento
   A. é sempre gratuito.
   B. custa um euro por hora.
   C. é gratuito na primeira hora.

4. Na próxima terça-feira, o mercado
   A. abre mais cedo.
   B. está encerrado.
   C. tem preços especiais na peixaria.

**Chave:** 1-B · 2-A · 3-C · 4-B

- **1** `NÚM` — *treze* and *catorze* in the same breath, with *catorze* attached to the word
  *habitual*. Exactly the CAPLE 14h30/18h30 mechanism.
- **2** `NÚM` — three prices, two of them fish. The stem names the fish, not the price: read the stem.
- **3** `NEG` — *gratuito durante a primeira hora*. A is the over-generalisation, B invents a figure.
- **4** `ECO` — C recycles *peixaria* and *preços*, both said, neither relevant.

---

### Áudio 6 — Enviar uma encomenda nos correios

- **Tipo:** diálogo, duas vozes · **Espaço:** correios
- **Domínio A2:** 9. Serviços (9.1) · **Duração estimada:** ≈ 65 s
- **Foco:** *encomenda*, *carta registada*, *impresso*, *código postal*, *levantar*, comparação de
  dois serviços (preço vs tempo), condição para levantar em nome de outra pessoa.

**Guião:**

> **CLIENTE (homem):** Bom dia. Queria enviar isto para a Alemanha, se faz favor.
> **FUNCIONÁRIA:** Bom dia. É uma carta ou uma encomenda?
> **CLIENTE:** É uma encomenda pequena. São uns livros.
> **FUNCIONÁRIA:** Ponha aqui em cima da balança, faz favor... Setecentos gramas. Quer o serviço
> normal ou o correio azul?
> **CLIENTE:** Qual é a diferença?
> **FUNCIONÁRIA:** No normal demora entre cinco e sete dias e fica por doze euros e cinquenta. No
> correio azul chega em dois ou três dias, mas são vinte e um euros.
> **CLIENTE:** Então fico pelo normal. Não tenho pressa nenhuma. E é preciso preencher alguma coisa?
> **FUNCIONÁRIA:** É. Tem de preencher este impresso com a morada do destinatário e o código postal.
> Escreva em letra de imprensa, se faz favor. Já agora, quer registada? São mais dois euros e depois
> recebe um comprovativo de entrega no telemóvel.
> **CLIENTE:** Quero, sim. Mais vale. Ah, e trago aqui um aviso para levantar uma carta registada em
> nome da minha mulher.
> **FUNCIONÁRIA:** Nesse caso preciso do documento de identificação dela e de uma autorização
> escrita. Só com o aviso não posso entregar.

**Perguntas:**

1. O cliente escolhe
   A. o correio azul.
   B. o serviço normal.
   C. levar a encomenda ele próprio.

2. Porquê?
   A. Porque é mais barato e ele não tem pressa.
   B. Porque quer que a encomenda chegue em dois ou três dias.
   C. Porque a encomenda pesa mais de um quilo.

3. Além de preencher o impresso, o cliente decide
   A. não registar a encomenda.
   B. fazer um seguro para os livros.
   C. pagar mais dois euros e enviá-la registada.

4. Para levantar a carta registada da mulher, ele precisa
   A. apenas do aviso.
   B. de ir ao balcão com ela.
   C. do documento de identificação dela e de uma autorização escrita.

**Chave:** 1-B · 2-A · 3-C · 4-C

- **2** `OPIN`/`CAUSA` — the stem asks for the reason, and the reason is a stance (*não tenho pressa
  nenhuma*), not a fact about the parcel. B is the correct description of the *other* service.
- **3** `NÚM` — three amounts are live (12,50 / 21 / +2). The stem asks about the decision, not the
  price.
- **4** `NEG` — the answer is carried by *só com o aviso não posso entregar*. A candidate who hears
  *aviso* and stops is caught by *só* + *não*, the exact pattern CAPLE uses with *apenas*.

---

### Áudio 7 — Mensagem de voz da secretaria da escola

- **Tipo:** mensagem de voz, uma voz · **Espaço:** escola
- **Domínio A2:** 3. Vida diária (3.2); 1. Identificação (1.2) · **Duração estimada:** ≈ 50 s
- **Foco:** documentos escolares (*boletim de vacinas*, *comprovativo de morada*), horários
  partidos, *falta-nos só*, marcação de reunião. Institutional vocabulary shared with the civics wing.

**Guião:**

> (VOZ FEMININA, 50 anos, tom de secretaria, cordial e eficiente)
>
> Boa tarde, dona Kateryna. Fala a Ana Paiva, da secretaria da escola básica. Estou a telefonar por
> causa da inscrição do Danylo no quinto ano. Está quase tudo tratado; falta-nos só uma coisa, o
> boletim de vacinas. O cartão de cidadão e o comprovativo de morada já cá estão, esses já os
> entregou. Pode trazer-nos o boletim até sexta-feira, dia vinte e nove? A secretaria está aberta
> das nove às doze e meia e das catorze às dezasseis e trinta; à sexta-feira só abrimos de manhã.
> Aproveito para lembrar que a reunião com a diretora de turma é no dia cinco de setembro, às
> dezoito horas, na sala doze. Se a essa hora não puder, diga-me qualquer coisa, que arranjamos
> outro dia. Boa tarde e até breve.

**Perguntas:**

1. O que é que falta entregar na secretaria?
   A. O cartão de cidadão.
   B. O comprovativo de morada.
   C. O boletim de vacinas.

2. Se a mãe for à escola na sexta-feira, tem de ir
   A. de manhã.
   B. à tarde, depois das catorze horas.
   C. até às dezasseis e trinta.

3. A reunião com a diretora de turma é
   A. no dia vinte e nove, às dezoito horas.
   B. no dia cinco de setembro, às dezoito horas.
   C. no dia cinco de setembro, de manhã.

4. Se a mãe não puder ir à reunião a essa hora,
   A. tem de escrever uma carta a justificar.
   B. o filho perde a inscrição.
   C. pode combinar outro dia com a secretaria.

**Chave:** 1-C · 2-A · 3-B · 4-C

- **1** `ECO` — A and B are named aloud, precisely because they are *already delivered*. The
  discriminating words are *falta-nos só*.
- **2** `TROCA` — the general opening hours are given first and in full; the Friday exception comes
  last and is one clause long. B and C are true of Monday–Thursday.
- **3** `NÚM`+`TROCA` — *vinte e nove*, *cinco de setembro*, *dezoito horas*, *sala doze*, *nove*,
  *doze e meia*, *catorze*, *dezasseis e trinta*: eight numbers in fifty-five seconds. This is the
  script to use for numbers dictation.
- **4** — the offer is *arranjamos outro dia*, paraphrased in C. Nothing in the message is a threat;
  B tests whether the learner is inventing consequences out of anxiety, which real candidates do.

---

### Áudio 8 — Na agência de emprego

- **Tipo:** diálogo, duas vozes · **Espaço:** agência de emprego
- **Domínio A2:** 3. Vida diária (3.3); 1. Identificação (1.11) · **Duração estimada:** ≈ 65 s
- **Foco:** *candidatura*, *currículo*, *a tempo inteiro* / *a tempo parcial*, *turnos*, *ordenado*,
  *subsídio de alimentação*; pretérito perfeito simples em narrativa de percurso profissional
  (*trabalhei*, *estive*, *saí*, *fechou*).

**Guião:**

> **TÉCNICA:** Então, senhor Silva, vejo aqui na sua candidatura que trabalhou três anos na
> restauração.
> **CANDIDATO:** Trabalhei, sim. Estive três anos num restaurante em Peniche, como empregado de
> mesa. Saí em março, quando o restaurante fechou.
> **TÉCNICA:** E agora, o que é que procura?
> **CANDIDATO:** Procuro alguma coisa a tempo inteiro e, de preferência, perto de casa. Moro em
> Torres Vedras e não tenho carro, ando de autocarro.
> **TÉCNICA:** Ora bem. Tenho aqui duas ofertas. Uma é num hotel na Ericeira, a tempo inteiro, mas
> com turnos, incluindo fins de semana. A outra é numa pastelaria aqui em Torres Vedras, mas é a
> tempo parcial, das sete da manhã à uma da tarde.
> **CANDIDATO:** E no hotel, o ordenado é como?
> **TÉCNICA:** O ordenado é melhor no hotel e ainda dão subsídio de alimentação. O problema é mesmo
> o transporte: à noite não há autocarros para Torres Vedras.
> **CANDIDATO:** Pois é... Olhe, eu gostava de me candidatar às duas, se for possível.
> **TÉCNICA:** É possível, com certeza. Preencha este impresso e traga-me o currículo atualizado até
> quinta-feira.

**Perguntas:**

1. Porque é que o candidato deixou o emprego anterior?
   A. Porque se mudou para Torres Vedras.
   B. Porque o restaurante fechou.
   C. Porque não gostava dos turnos.

2. O emprego na pastelaria
   A. é a tempo inteiro.
   B. é ao fim de semana.
   C. é a tempo parcial, de manhã.

3. Qual é o problema do emprego no hotel?
   A. À noite não há autocarros.
   B. O ordenado é mais baixo.
   C. Não dão subsídio de alimentação.

4. No fim da conversa, o candidato
   A. quer candidatar-se aos dois empregos.
   B. escolhe apenas o emprego do hotel.
   C. não aceita nenhuma das ofertas.

**Chave:** 1-B · 2-C · 3-A · 4-A

- **1** `ECO` — *turnos* and *Torres Vedras* are both in the recording, in other sentences. The
  reason is one short subordinate clause: *quando o restaurante fechou*.
- **2** `TROCA` — the two offers are described back to back with the same grammar; only
  *tempo inteiro* / *tempo parcial* and the place differ.
- **3** `CAUSA` — B and C are the *opposite* of what is said (*o ordenado é melhor no hotel e ainda
  dão subsídio*). Classic inverted-logic distractor.
- **4** `OPIN` — the stem asks what he decides, and the decision is expressed with the polite
  imperfect *eu gostava de me candidatar*, not with a plain present. Teach *gostava de* as a
  request/intention formula before teaching it as a tense (see `programa-a2.md` §4.1).

---

### Áudio 9 — Aviso na estação de comboios

- **Tipo:** aviso público, uma voz · **Espaço:** estação (transportes)
- **Domínio A2:** 5. Viagens (5.1, 5.6); 9. Serviços (9.2) · **Duração estimada:** ≈ 45 s
- **Foco:** **linha** (é a palavra dos comboios em Portugal; *plataforma* usa-se nos terminais rodoviários, não na ferrovia), *suprimido*, *validar*, *devolução do
  bilhete*, horas em formato de vinte e quatro horas. Fonética: *linha* /ʎ/, nasal em *supressão*.

**Guião:**

> (VOZ FEMININA, altifalante de estação, dicção muito clara, ligeiro eco)
>
> Senhores passageiros, atenção. O comboio regional número quatro mil e vinte e um, com destino a
> Caldas da Rainha, com partida prevista para as dezoito e cinco, vai efetuar a partida na linha
> três, e não na linha um. Repetimos: linha três. Informamos ainda que o comboio das dezanove e
> quarenta, com destino a Lisboa, Santa Apolónia, foi suprimido por avaria. Os passageiros com
> bilhete para esse comboio podem viajar no comboio seguinte, das vinte e dez, sem qualquer custo
> adicional, ou pedir a devolução do bilhete na bilheteira. Recordamos que os bilhetes devem ser
> validados antes de entrar no comboio e que não é permitido fumar dentro das carruagens. Obrigada.

**Perguntas:**

1. O comboio para as Caldas da Rainha parte
   A. da linha um.
   B. da linha três.
   C. às dezanove e quarenta.

2. O comboio das dezanove e quarenta
   A. está atrasado quarenta minutos.
   B. mudou de linha.
   C. não vai circular.

3. Quem tinha bilhete para esse comboio pode
   A. viajar no comboio das vinte e dez, sem pagar mais nada.
   B. trocar o bilhete por um lugar de primeira classe.
   C. viajar de autocarro, por conta da empresa.

4. O aviso lembra aos passageiros que
   A. devem comprar o bilhete dentro do comboio.
   B. devem validar o bilhete antes de entrar.
   C. devem mostrar o bilhete ao revisor à saída.

**Chave:** 1-B · 2-C · 3-A · 4-B

- **1** `TROCA` — *linha um* is spoken. Station announcements always name the old platform.
- **2** `NEG` — *suprimido* is the one word that decides the item, and it is an exam-level word a
  learner may not know. If they do not know it, *por avaria* plus *podem viajar no comboio seguinte*
  still gets them there — teach that inference, not just the word.
- **3** `NEG` — *sem qualquer custo adicional* → *sem pagar mais nada*. Pure paraphrase; nothing in
  the right option was said aloud.
- **4** `ECO` — all three options are plausible station rules; only one is in the recording.

---

### Áudio 10 — Almoço num restaurante

- **Tipo:** diálogo, duas vozes · **Espaço:** restaurante
- **Domínio A2:** 8. Alimentação (8.2, 8.3); 7. Compras (7.5) · **Duração estimada:** ≈ 60 s
- **Foco:** *ementa*, *prato do dia*, *a conta*, *multibanco*, restrições alimentares (o item mais
  frequente na prova modelo do CAPLE), *não faz mal*, *se faz favor*.

**Guião:**

> **EMPREGADO:** Boa tarde. São dois?
> **CLIENTE (mulher):** Somos, sim. Podemos ficar naquela mesa ao pé da janela?
> **EMPREGADO:** Com certeza. Faz favor. Aqui têm a ementa. O prato do dia é bacalhau à Brás; de
> carne, temos bifanas, e temos sopa de legumes.
> **CLIENTE:** Eu não como peixe. Têm alguma coisa vegetariana?
> **EMPREGADO:** Hoje temos um arroz de legumes, mas demora um bocadinho mais, uns vinte minutos.
> **CLIENTE:** Não faz mal, tenho tempo. E para o meu marido, uma bifana com batatas.
> **EMPREGADO:** E para beber?
> **CLIENTE:** Uma água sem gás e um sumo de laranja natural, se faz favor. Diga-me uma coisa: a sopa
> está incluída no prato do dia?
> **EMPREGADO:** Está: sopa, prato, pão e café. A sobremesa é que é à parte.
> **CLIENTE:** Ah, então traga também duas sopas.
> (mais tarde)
> **CLIENTE:** A conta, se faz favor. Podemos pagar com multibanco?
> **EMPREGADO:** Podem, sim, mas só acima de cinco euros. O total é vinte e três e sessenta,
> portanto não há problema nenhum.

**Perguntas:**

1. A senhora pediu
   A. bacalhau à Brás.
   B. arroz de legumes.
   C. uma bifana com batatas.

2. O empregado avisa que o prato dela
   A. demora cerca de vinte minutos a mais.
   B. já acabou.
   C. leva peixe.

3. No prato do dia estão incluídos
   A. sopa, prato, pão, café e sobremesa.
   B. só o prato e o pão.
   C. sopa, prato, pão e café.

4. Para pagar com multibanco é preciso
   A. pagar uma comissão.
   B. avisar antes de fazer o pedido.
   C. gastar mais de cinco euros.

**Chave:** 1-B · 2-A · 3-C · 4-C

- **1** `ECO` — *bacalhau à Brás* is the loudest thing in the recording and is the *prato do dia*;
  the bifana is ordered, but for her husband. Item 1 in CAPLE's model paper works the same way
  (*não come peixe*).
- **3** `NEG` — the discriminator is *a sobremesa é que é à parte*. The `é que` reinforcement is
  characteristic pt-PT and should be taught explicitly (`programa-a2.md` §4.4).
- **4** `NEG` — *só acima de cinco euros*. Once again *só* is the word doing all the work.

---

### Áudio 11 — Mensagem de voz da vizinha: água fechada no prédio

- **Tipo:** mensagem de voz, uma voz · **Espaço:** casa / vizinhança
- **Domínio A2:** 2. Casa e meio-ambiente (2.1, 2.3) · **Duração estimada:** ≈ 50 s
- **Foco:** **registo tu** (o único áudio deste banco em tu do princípio ao fim), ênclise
  (*telefonar-te*, *diz-me*, *deixaste*), vocabulário de habitação (*senhorio*, *canalizador*,
  *rutura*, *canos*, *garrafões*), pedido de autorização.

**Guião:**

> (VOZ FEMININA, 60 anos, tom de vizinha, informal e apressada)
>
> Olá, boa noite, é a dona Lurdes, a vizinha do primeiro andar. Estou a telefonar-te porque houve uma
> rutura de água na garagem e o senhorio mandou fechar a água do prédio amanhã, das nove da manhã até
> ao meio-dia, mais ou menos. É melhor encheres uns garrafões esta noite. Ah, e outra coisa: o senhor
> Costa, o canalizador, precisa de entrar no teu apartamento para ver os canos da casa de banho. Ele
> disse que pode ir amanhã à tarde, por volta das três, ou então sábado de manhã. Diz-me o que te dá
> mais jeito, que eu depois falo com ele. Se não estiveres em casa, posso abrir-lhe a porta com a
> chave que me deixaste, mas só se tu disseres que sim. Beijinhos, até amanhã.

**Perguntas:**

1. Amanhã de manhã, no prédio,
   A. não há água.
   B. não há eletricidade.
   C. a garagem fica fechada.

2. A vizinha aconselha-o a
   A. sair de casa durante a manhã.
   B. encher uns garrafões esta noite.
   C. telefonar ao senhorio.

3. O canalizador precisa de ver
   A. os canos da cozinha.
   B. a garagem.
   C. os canos da casa de banho.

4. A dona Lurdes só abre a porta ao canalizador
   A. se o vizinho disser que sim.
   B. se o senhorio pagar primeiro.
   C. se for sábado de manhã.

**Chave:** 1-A · 2-B · 3-C · 4-A

- **1** `ECO` — *garagem* is where the burst is, so C is one word away from being right.
- **3** `TROCA` — *casa de banho* (never *banheiro*) against a plausible *cozinha*.
- **4** `NEG` — *mas só se tu disseres que sim*. Present subjunctive after *se* is above A2 to
  produce, but must be recognised: `se` + `disseres`, `estiveres`, `for` all appear in this bank and
  in the CAPLE model paper. Teach them as fixed listening shapes, not as a paradigm.

---

### Áudio 12 — Ao balcão de atendimento: falta um documento

- **Tipo:** diálogo, duas vozes (mais chamada de senha) · **Espaço:** balcão de atendimento público
- **Domínio A2:** 9. Serviços; 1. Identificação e caracterização pessoais (1.2, 1.3)
- **Duração estimada:** ≈ 60 s
- **Foco:** **senha**, *marcação*, *impresso*, *dar entrada ao processo*, *comprovativo de morada*,
  *levantar o documento*. Este é o vocabulário administrativo que a prova modelo do CAPLE usa nos
  textos 6 e 8 (*visto*, *senha*, *impresso*, *passaporte*) e que se sobrepõe à ala da cidadania.
- **Aviso:** o procedimento descrito é **inventado** para efeitos de treino de escuta. Não descreve
  o funcionamento real de nenhum serviço público português.

**Guião:**

> (VOZ AUTOMÁTICA DE CHAMADA DE SENHA, monocórdica) Senha B quarenta e sete, ao balcão número quatro.
>
> **UTENTE (mulher):** Boa tarde. Trago aqui a marcação para as quinze horas.
> **FUNCIONÁRIO:** Boa tarde, faz favor de se sentar. Trouxe os documentos todos?
> **UTENTE:** Acho que sim: o passaporte, o impresso preenchido e duas fotografias.
> **FUNCIONÁRIO:** Deixe ver... O impresso está bem preenchido, mas falta assinar aqui em baixo. E o
> comprovativo de morada, trouxe?
> **UTENTE:** Comprovativo de morada? Ninguém me disse nada.
> **FUNCIONÁRIO:** Serve uma fatura da água ou da luz em seu nome, dos últimos três meses. Sem isso
> não posso dar entrada ao processo.
> **UTENTE:** E tenho de marcar outra vez? Esperei dois meses por esta marcação...
> **FUNCIONÁRIO:** Não, não é preciso. Olhe, eu deixo o processo aberto: traga o comprovativo até
> sexta-feira, ao balcão nove, e entrega-o diretamente, sem tirar senha. Depois recebe uma mensagem
> no telemóvel a dizer quando pode vir levantar o documento.
> **UTENTE:** Ah, ainda bem. Muito obrigada.
> **FUNCIONÁRIO:** De nada. Mas assine já aqui o impresso, para não se esquecer.

**Perguntas:**

1. Que documento é que falta à senhora?
   A. O passaporte.
   B. O comprovativo de morada.
   C. As fotografias.

2. Segundo o funcionário, serve como comprovativo de morada
   A. uma fatura da água ou da luz em nome dela.
   B. uma declaração escrita por um vizinho.
   C. o contrato de trabalho.

3. Para entregar o documento que falta, ela
   A. tem de marcar outro atendimento.
   B. tem de tirar uma senha e esperar.
   C. vai ao balcão nove, sem tirar senha.

4. Como é que ela vai saber que o documento está pronto?
   A. Recebe uma mensagem no telemóvel.
   B. Tem de telefonar todas as semanas.
   C. Recebe uma carta em casa.

**Chave:** 1-B · 2-A · 3-C · 4-A

- **1** `ECO` — passport and photographs are both listed aloud, by the person who *did* bring them.
  The candidate must hold "what she brought" and "what he asks for" apart for four seconds.
- **3** `NEG` — *não, não é preciso* + *sem tirar senha*. Two negatives in ten seconds, both decisive.
  This is the highest-value listening pattern in the whole bank: at a Portuguese counter, the
  information you need is usually in the negative clause.
- **4** — the answer is at the very end of a long turn, after the reassurance. Candidates relax when
  the problem is solved and stop listening. Train the opposite: **the last sentence of a service
  dialogue almost always carries an item.**

---

## Using the bank

**Distribuição da chave** (so nobody can pattern-hunt): 16 A · 15 B · 16 C across the 47 items,
deliberately near-even. Tell learners this and then tell them to ignore it — the real paper's model key
runs one A, six Bs and eight Cs (`compreensao-oral.md`), which proves the distribution of any single
paper says nothing.

**Three ways to run these:**

1. **Prática (default).** One audio, played twice with the beep, 9 s to pre-read, 14 s to answer.
   Show the key with the trap tag afterwards — the tag is the teaching, not the tick.
2. **Uma só audição.** Play once. The exam gives two, so training on one builds margin
   (`compreensao-oral.md`, weekly routine).
3. **Ditado.** Play 20–30 seconds and have the learner write it out. Then diff against the guião.
   This is the exercise the dossier calls the highest-yield of all, and this file is the first thing
   in the project that makes it possible, because **the script is the transcript** — which is
   exactly what CAPLE does not publish for its own audio.

**Coverage against the nine A2 domains** (`programa-a2.md` §3): 1. Identificação — Áudios 7, 8, 12 ·
2. Casa — 11 · 3. Vida diária — 2, 7, 8 · 4. Tempos livres — 3 · 5. Viagens — 1, 9 · 6. Saúde — 2 ·
7. Compras — 4, 5, 10 · 8. Alimentação — 5, 10 · 9. Serviços — 6, 9, 12.

**Coverage against the exam's own ten *espaços de comunicação*:** covered here — escola (7),
mercado (5), centro de saúde (2), agência de emprego (8), restaurante (10), correios (6),
aeroporto (1), loja de produtos informáticos (4). **Not covered: táxi and consulado/embaixada**
(Áudio 12 is a generic public counter, deliberately, to avoid inventing consular procedure). Two
more scripts would close the set; whoever writes them should also write the Parte 2 bank — ten
one-line utterances matched one-to-one to the ten places — which is **out of scope for this file**
and is, per the dossier, the cheapest 12 % of the whole exam.

---

## Gaps and honest limits

1. **Durations are calculated, not measured.** Word count ÷ ≈2.6 words/s. The real figure depends
   entirely on the TTS voice and rate chosen. Measure once, correct this file.
2. **No native-speaker review yet.** These scripts are written to the pt-PT rules in the project's
   CLAUDE.md and checked mechanically against a pt-BR blocklist, but they have not been read by a
   Portuguese speaker. The family must do that before publishing. Likely places to be corrected:
   the register of the counter staff (Portuguese service register alternates between *o senhor/a
   senhora* and bare third person more fluidly than a written script can capture) and regional
   turns of phrase.
3. **NÃO VERIFICADO — item difficulty.** There is no way to know whether these items are calibrated
   at A2 without trialling them. They are modelled on the published CAPLE model paper's mechanics,
   which is the best available anchor, but "modelled on" is not "calibrated to".
4. **The real paper's texts are shorter** (19–57 s). See the note at the top of this file. Do not
   let the app tell users these are exam-length.
5. **No audio has been generated.** This file is scripts only. Whether the app's TTS handles
   *encomenda*, *suprimido*, *rutura* or *bacalhau à Brás* acceptably is untested.
6. **CAPLE's own model listening PDF has no text layer** — it is a scan, confirmed by extraction
   attempt on 10 August 2026. Every quotation from that paper in this project comes via
   `compreensao-oral.md`, whose author transcribed it. That is a single point of failure worth
   knowing about.

---

## Fontes

1. `content/ciple/compreensao-oral.md` — this project's CIPLE listening dossier. Ground truth for
   the component's shape (30 min, 25 items, two parts), the measured audio cycle (each text played
   twice, ~9 s pre-read, ~14 s to answer, beep between auditions), the six distractor mechanisms
   used to build every key in this file, and the pt-PT phonetic hazards (vowel reduction, final
   `s` → [ʃ], `est-` collapse, nasals, enclisis, *catorze/dezasseis/dezassete/dezanove*).
2. `content/ciple/programa-a2.md` — this project's A2 content dossier. Ground truth for the nine
   thematic vocabulary domains used to spread these twelve scripts, the A2 grammar inventory
   (*estar a* + infinitive, *ter de* + infinitive, PPS vs imperfeito, *há* + elapsed time,
   enclisis/proclisis, *é que* reinforcement, imperfeito de cortesia), and the ten published
   *espaços de comunicação*.
3. CAPLE — Centro de Avaliação e Certificação de Português Língua Estrangeira, ULisboa, "CIPLE"
   (component durations and weightings, classification bands 55/70/85 %, 2026 fee €95,00, and the
   verbatim format line *"Audição de textos, de registo informal, próprios de situações de
   comunicação dos domínios público, profissional ou educativo. São usados itens de escolha
   múltipla."*) — https://caple.letras.ulisboa.pt/exame/2/ciple — retrieved and re-confirmed
   10 August 2026 for this file.
4. CAPLE — "CIPLE — Modelo — Compreensão do Oral", official model question paper —
   https://caple.letras.ulisboa.pt/files/exemplos/CIPLE_CO.pdf — fetched 10 August 2026 for this
   file. **Gap:** the PDF is an image scan with no extractable text layer (`pdftotext` returns
   empty), so its rubrics and item content are used here **only** as reported in Fonte 1.
5. CAPLE — "CIPLE — Modelo — Chave de Resposta" —
   https://caple.letras.ulisboa.pt/files/exemplos/CIPLE_CHAVE.pdf — cited via Fonte 1 for the
   model key distribution (one A, six Bs, eight Cs in Parte 1).
6. CAPLE — official model listening audio, `CIPLE_CO_EXEMPLO.mp3` (30:00) —
   https://caple.letras.ulisboa.pt/audio/CIPLE_CO_EXEMPLO.mp3 — cited via Fonte 1 for the measured
   playback cycle reproduced in the production notes.
7. Camões, I.P., *Referencial Camões PLE*, 1.ª ed., setembro 2017 —
   https://www.instituto-camoes.pt/images/REFERENCIAL_ebook.pdf — cited via Fonte 2 for the nine
   vocabulary domains and the A2 preposition inventory that the direction/location language in
   Áudios 1, 9 and 12 is built on.
8. Project register rules — `/Users/roberthanson/dev/port.robertjeremiah.com/CLAUDE.md` (European
   Portuguese only, AO1990 as applied in Portugal, *tu* in the teaching voice, *estar a* +
   infinitive, Portuguese clitic placement, Santa Cruz / Torres Vedras setting).

**Not consulted, and it matters:** no corpus of real spoken European Portuguese was used to check
frequency or naturalness. The scripts are written from the register rules and the dossiers, not
sampled from authentic speech. A native reviewer is the control for that, and has not run yet.

## Prompt context

O banco de escuta do CIPLE tem doze gravações em português europeu, de trinta a noventa segundos,
cada uma com três ou quatro perguntas de escolha múltipla. Há avisos públicos no aeroporto, no
mercado e na estação de comboios; diálogos no centro de saúde, na loja de informática, nos correios,
na agência de emprego, no restaurante e num balcão de atendimento; e mensagens de voz da piscina, da
escola e de uma vizinha.

Vocabulário por espaço: aeroporto — porta de embarque, atraso, bagagem de mão; centro de saúde —
marcar e desmarcar uma consulta, número de utente, consulta aberta; correios — encomenda, carta
registada, impresso, morada, código postal, levantar; loja — talão de compra, garantia, carregador,
avariado, dias úteis; agência de emprego — candidatura, currículo, a tempo inteiro, a tempo parcial,
turnos, ordenado; restaurante — ementa, prato do dia, a conta, multibanco; comboios — linha, bilhete,
validar, comboio suprimido; casa — senhorio, canalizador, rutura de água, garrafões.

Armadilhas: horas parecidas (dezanove e dezoito e trinta; treze e catorze), números de porta e de
linha que mudam, o documento que falta, e as palavras só, apenas, não é preciso e tem de, que
decidem sozinhas a resposta. As opções erradas repetem as palavras ouvidas; a certa diz o mesmo por
outras palavras. Fala-se tu com vizinhos e amigos, e o senhor ou a senhora ao balcão; diz-se estar a
mais infinitivo, nunca o gerúndio, e os clíticos vêm depois do verbo: chamo-me, diga-me,
telefonar-te.
