# src/ — como o perfil é gerado

Cada painel do README é um SVG escrito por código, sem dependências.

```sh
npm run build   # baixa as contribuições, gera assets/*.svg e o README.md
```

Pra mudar texto, links, projetos ou a stack, edite **`profile.mjs`** e rode o build, ou só dê push na `main`: o workflow `.github/workflows/build.yml` reconstrói e comita. Ele também roda todo dia de madrugada, e é isso que faz o lago mudar.

## o lago (`panels/pond.mjs` + `art/koi.mjs`)

Um lago noturno em ASCII, alimentado pelo calendário de contribuições:

| o que muda | regra |
| --- | --- |
| quantas carpas | 1 a cada 100 contribuições nos últimos 12 meses (de 1 a 5) |
| ritmo | commits nos últimos 7 dias: mais commits, nado mais rápido; mais de 7 dias parado, ficam "com fome" e lentas |
| ondas | cada dia com commit nas últimas 2 semanas vira uma onda na água |
| fundo do lago | o próprio calendário, um caractere por dia (`·` vazio, `o O @` por intensidade) |

Cada carpa é desenhada vista de cima: uma espinha curva com perfil de corpo, nadadeiras e cauda bifurcada. Cada célula é supersampleada, sombreada com luz vinda de cima à esquerda e colorida pelo padrão da variedade (kohaku, yamabuki, sanke, tancho, chagoi). São 4 quadros da batida da cauda, e o `animateMotion` (SMIL) leva o sprite pelo caminho e o gira na direção do nado. Por isso o lago inteiro tem ~70 KB, e não uma animação quadro a quadro do lago todo.

## arquivos

- `profile.mjs`: tudo o que o perfil diz.
- `lib/contributions.mjs`: calendário dos últimos 12 meses. Usa a API GraphQL quando há `GITHUB_TOKEN` (na Action) e a página pública de contribuições quando não há (build local). Se as duas falharem, usa a última cópia em `data/contributions.json`.
- `lib/svg.mjs`: paleta, medidas de texto, texto em grade de caracteres.
- `data/icons.mjs`: logos (Simple Icons, CC0; a xícara do Java é desenhada à mão).
- `panels/stack.mjs`: blocos com os logos em cor. O contorno de cada um acende em sequência, e os números são os projetos onde a ferramenta aparece.
- `panels/project.mjs`: um cartão por projeto, com os logos da stack dele.
- `panels/closing.mjs`: experiência numa escala de meses, "por quê", contato e botões.
- `readme.mjs`: monta o README.md e a versão em texto.

## decisões

- **Texto sem fonte embutida.** Usa Helvetica/Arial do sistema para os títulos e a monoespaçada do sistema para o ASCII, com `textLength` em cada linha, então a grade fecha em qualquer fonte.
- **Estático completo.** Sem animação (prévia, `prefers-reduced-motion`), tudo continua visível; a animação só dá vida.
