# Registo de QA de registo — português europeu

> Auditoria de registo pt-PT de todo o conteúdo em `content/ciple/` e `content/civica/`, mais
> `syllabus-ciple.json` e `syllabus-civica.json`. Feita a 10 de agosto de 2026.
> Procurou-se: gerúndio progressivo, *você* como tratamento por defeito na voz de ensino,
> léxico brasileiro (*ônibus*, *café da manhã*, *banheiro*, *celular*, *sobrenome*…),
> próclise brasileira (*me chamo*), ortografia brasileira, e inglês infiltrado em campos
> que têm de ser pt-PT.

**Ficheiros lidos na íntegra:** os 10 dossiês de `ciple/`, os 6 de `civica/` e os dois
ficheiros de sílabo em JSON. Nenhum JSON foi alterado.

---

## 1. Alterações aplicadas

### Ortografia — acentuação em falta (o achado de maior volume)

- `civica/banco-estado.md`: `**Explicacao:**` -> `**Explicação:**` (97 rótulos) — texto português sem acentuação; o ficheiro irmão `banco-cultura.md` já usava a forma acentuada, tal como o AO 1990 aplicado em Portugal exige.
- `civica/banco-historia.md`: `**Explicacao:**` -> `**Explicação:**` (96 rótulos) — mesma razão.
- `civica/banco-estado.md`: `> ESTADO: PROVISORIO — a regulamentacao do exame ainda nao foi publicada; conteudo baseado no ambito definido na lei` -> `> ESTADO: PROVISÓRIO — a regulamentação do exame ainda não foi publicada; conteúdo baseado no âmbito definido na lei` (a linha acentuada é a que `syllabus-civica.json` §90 manda usar textualmente, e a que `banco-cultura.md` já usa).
- `civica/banco-historia.md`: mesma linha de estado, sem acentos -> com acentos (mesma razão).
- `civica/banco-estado.md`: `Nota de formato: os rótulos ... foram escritos sem acentuação, exatamente como especificado no formato de ingestão.` -> nota reescrita a dizer que todo o conteúdo usa acentuação AO 1990 e que, se o parser de ingestão esperar rótulos sem acentos, a normalização se faz no parser e não no conteúdo (a nota antiga ficava falsa depois da correção, e contradizia frontalmente a nota equivalente de `banco-cultura.md`).

### Léxico brasileiro em texto de ensino

- `ciple/simulado-2.md` e `ciple/simulado-1.md`: `simulado` / `Simulado` / `SIMULADO` -> `simulacro` / `Simulacro` / `SIMULACRO` (23 ocorrências no total, incluindo os dois títulos H1 e o `FIM DO SIMULADO 1`) — o Priberam marca explicitamente o sentido nominal «teste que reproduz as condições de um exame real» como **[Brasil]**. `syllabus-ciple.json` já usava a forma portuguesa, «O Simulacro Cronometrado». **Os nomes dos ficheiros (`simulado-1.md`, `simulado-2.md`) e o slug `civica-revisao-e-simulado` NÃO foram tocados** — ver secção 3.
- `ciple/compreensao-oral.md`: `guichê` -> `guiché` (a grafia `guichê` estava na coluna «Portugal» de uma tabela de contraste pt-PT/pt-BR; `guiché` é a entrada principal em Portugal).

### Grafia da própria forma brasileira, em lista de contraste

- `ciple/simulado-1.md`: `**autocarro** (não ónibus)` -> `**autocarro** (não ônibus)` — a palavra que se manda evitar é brasileira e escreve-se com circunflexo; `ónibus` era um híbrido que não existe em nenhuma das duas normas. Todos os outros ficheiros do projeto já escreviam `ônibus`.

### Afirmação errada sobre o que é brasileiro

- `ciple/banco-escuta.md`: `**linha** (pt-PT; *plataforma* é brasileiro)` -> `**linha** (é a palavra dos comboios em Portugal; *plataforma* usa-se nos terminais rodoviários, não na ferrovia)` — `plataforma` não é brasileirismo: usa-se em Portugal nos terminais rodoviários, e `ciple/banco-oral.md` §4.1 usa-a corretamente para um autocarro («Sai da plataforma três»). A afirmação antiga ensinava um erro e contradizia outro ficheiro do mesmo banco.

---

## 2. Verificado e mantido (sem alteração)

- **Gerúndio progressivo:** zero ocorrências na voz de ensino. As 20+ ocorrências de `estou falando`, `estava chovendo`, `está vendendo`, `estão jantando` estão todas em construções de contraste («nunca X», «not X», tabelas *Não/Sim*) ou na resposta deliberadamente má `Fraca 1` de `banco-escrita.md`. Correto.
- **`você` / `vocês`:** 62 ocorrências, todas intencionais e corretas — ou reproduzem o enunciado autêntico do CAPLE («Você marcou um encontro com os seus amigos…»), ou ensinam explicitamente a não devolver esse *você* a amigos. A voz de ensino usa `tu` em todo o lado; o examinador usa a 3.ª pessoa formal sem `tu`, como o exame real. Correto.
- **Clíticos:** zero casos de próclise brasileira. As duas ocorrências de `me chamo` são a forma errada citada em «`chamo-me` (nunca `me chamo`)». Ênclise/próclise ensinadas corretamente (`chamo-me`, `telefona-me`, `não me telefones`, `se não te importas`).
- **Léxico:** `ônibus`, `trem`, `banheiro`, `celular`, `sobrenome`, `café da manhã`, `geladeira`, `aluguel`, `cardápio`, `garçom`, `moça`, `terno`, `suco`, `bonde`, `carona`, `açougue`, `rotatória`, `faixa`, `cupom`, `carteira de motorista`, `ruim`, `Tchau`, `Oi`, `dezenove`, `dezesseis`, `dezessete`, `quatorze` — todas as ocorrências estão em colunas «Brasil» de tabelas de contraste ou em listas «Nunca digas isto». Nenhuma em texto-modelo.
- `calçada`: 8 ocorrências, todas corretas — ou o contraste `o passeio (não calçada)`, ou `calçada portuguesa`, o nome da arte do empedrado.
- `W (dâblio)` em `ciple/banco-oral.md`: **não corrigido**. Verificado no Ciberdúvidas: em português europeu a letra W chama-se `dáblio` (tradicionalmente grafado `dâblio`) **ou** `duplo vê` — ambas são formas de Portugal, não brasileirismos.
- `stress` (`ciple/simulado-2.md`), `part-time`, `online`: anglicismos correntes e dicionarizados em Portugal. Mantidos.
- Ortografia AO 1990 de Portugal confirmada em todo o corpo: `ativa`, `eletrónica`, `aspeto`, `objetivo`, `receção`, mas `contacto` e `facto` com `c`; `carácter` com acento; `terramoto`, não `terremoto`; `ficámos`/`chegámos`/`jantámos` com agudo. Nenhum circunflexo brasileiro (`ônico`, `êmico`, `António`→`Antônio`) fora das colunas de contraste.
- Citações pré-Acordo do CAPLE («Interacção», «actualidade») mantidas por serem literais e virem já assinaladas como tal nos ficheiros.

---

## 3. Sinalizado, não corrigido — decisão para o orquestrador

1. **Nomes de ficheiro e slug com o brasileirismo `simulado`.** O texto foi corrigido para `simulacro`, mas `content/ciple/simulado-1.md`, `content/ciple/simulado-2.md` e o slug `civica-revisao-e-simulado` em `syllabus-civica.json` continuam com a forma brasileira. Não foram alterados porque renomear ficheiros e mudar slugs é uma alteração estrutural (rotas, chaves de base de dados, referências de outros agentes), fora do mandato «edições mínimas, não alterar a estrutura do JSON». **Nenhum ficheiro em `content/` referencia `simulado-1.md` ou `simulado-2.md` por caminho**, por isso um rename só depende do código da aplicação. Decisão a tomar por quem coordena.
2. **Contradição entre bancos sobre a acentuação dos rótulos, agora resolvida a favor dos acentos.** Se existir mesmo um parser de ingestão que espera `**Explicacao:**` sem acentos, é o parser que tem de normalizar — mas alguém tem de o confirmar antes de publicar.
3. **Concordância de género em `ciple/banco-oral.md` §2, pergunta 25:** «Se um amigo viesse visitá-**lo**…» dirigida a uma persona feminina (Kelly). Não é questão de registo, por isso não foi mexido; corrigir para `visitá-la` ou reformular para forma neutra.
4. **Inconsistência de grafia de topónimo:** `Tratado de Alcanizes` (`civica/historia.md`, `civica/banco-historia.md`) vs `Tratado de Alcanises` (`civica/estado-cultura.md`). Ambas circulam; escolher uma.

---

## Fontes

1. Dicionário Priberam da Língua Portuguesa — verbete *simulado*: o sentido nominal «teste ou experiência que pretende reproduzir as condições de um exame, prova ou evento real, como forma de estudo, treino ou preparação» está marcado **[Brasil]**. <https://dicionario.priberam.org/simulado>
2. Dicionário Priberam da Língua Portuguesa — verbete *guiché*, com as variantes *guichê* e *guichet*. <https://dicionario.priberam.org/guiché>
3. Ciberdúvidas da Língua Portuguesa (Iscte) — «O nome da letra w»: em português europeu, `dáblio` (tradicionalmente `dâblio`) e `duplo vê` são ambas designações válidas. <https://ciberduvidas.iscte-iul.pt/consultorio/perguntas/o-nome-da-letra-w/10633>
4. Ciberdúvidas da Língua Portuguesa (Iscte) — «As novas letras do alfabeto k, w e y, outra vez». <https://ciberduvidas.iscte-iul.pt/consultorio/perguntas/as-novas-letras-do-alfabeto-k-w-e-y-outra-vez/27435>
5. `content/civica/banco-cultura.md`, secção «Lacunas e avisos de verificação», nota «Registo linguístico» — regra interna do projeto que fixa acentuação AO 1990 nos rótulos e manda normalizar do lado do parser. Usada como critério de desempate contra `banco-estado.md` e `banco-historia.md`.
6. `content/syllabus-civica.json`, item `civica-o-teste-de-cidadania` — especifica textualmente a linha `> ESTADO: PROVISÓRIO …` com acentuação.
7. `content/syllabus-ciple.json`, item `ciple-simulacro-cronometrado` — usa a forma portuguesa «Simulacro», adotada como referência.
8. `CLAUDE.md` do projeto — português europeu apenas, registo `tu` na voz de ensino, `estar a` + infinitivo, colocação portuguesa dos clíticos.

## Prompt context

Escreve sempre português europeu. Usa estar a + infinitivo e nunca o gerúndio: estou a falar, está a chover, estão a jantar. Põe os clíticos depois do verbo nas afirmativas — chamo-me, dá-me, telefona-me, disseram-me — e antes do verbo depois de negação, de que e de se: não me telefones, que te enviei, se não te importas. Trata o aluno por tu; usa você ou o senhor só quando fores examinador ou funcionário de balcão. Diz autocarro, paragem, comboio, elétrico, boleia, telemóvel, ecrã, casa de banho, sanita, pequeno-almoço, frigorífico, rebuçado, sumo, ementa, empregado de mesa, morada, apelido, talão, senha, renda, arrendar, carta de condução, rapariga, guiché, passeio, passadeira, rotunda, imperial, bica, multibanco. Nunca ônibus, trem, banheiro, celular, café da manhã, geladeira, aluguel, cardápio, garçom, sobrenome, endereço, suco, bala, terno, moça, calçada por passeio, faixa por passadeira, rotatória, ponto de ônibus, carteira de motorista, ruim, tchau, oi. Ao telefone atende-se com «Estou?», nunca «Alô». Números: catorze, dezasseis, dezassete, dezanove. Ortografia do Acordo de 1990 como se aplica em Portugal: ativa, eletrónica, aspeto, receção, objetivo, mas contacto e facto com c, e carácter com acento. O pretérito perfeito da primeira pessoa do plural dos verbos em -ar leva agudo: chegámos, ficámos, jantámos. Diz terramoto, não terremoto, e simulacro, não simulado.
