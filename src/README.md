# src/ — como o perfil é gerado

Cada painel do README é um SVG escrito por código, sem dependências. A carpa é a exceção: um GIF do [git-koi](https://github.com/yalongwastaken/git-koi).

```sh
npm run build   # baixa as contribuições, gera assets/*.svg e o README.md
```

Pra mudar texto, links, projetos ou a stack, edite **`profile.mjs`** e rode o build, ou só dê push na `main`. O workflow `.github/workflows/build.yml` desenha a carpa do dia, reconstrói os painéis e comita. Ele também roda toda noite, logo depois da meia-noite UTC.

## a carpa (`koi/koi.gif`)

O workflow roda a Action do git-koi, que lê a atividade pública da conta e desenha uma carpa em pixel art. As linguagens dão as cores, as contribuições fazem ela crescer, as sequências deixam marcas, e o dia que acabou decide como ela nada. O GIF tem fundo transparente e aparece com `width="256"` (o tamanho nativo dele).

O GIF só existe depois da primeira execução do workflow. Localmente, o README aponta pra um arquivo que ainda não está lá.

## arquivos

- `profile.mjs`: tudo o que o perfil diz.
- `lib/contributions.mjs`: calendário dos últimos 12 meses. Usa a API GraphQL quando há `GITHUB_TOKEN` (na Action) e a página pública de contribuições quando não há (build local). Se as duas falharem, usa a última cópia em `data/contributions.json`.
- `lib/svg.mjs`: paleta, medidas de texto e `enter()`, a animação de entrada compartilhada.
- `data/icons.mjs`: logos (Simple Icons, CC0; a xícara do Java é desenhada à mão).
- `panels/hero.mjs`: o nome, letra por letra.
- `panels/contrib.mjs`: o calendário como o GitHub desenha (verdes e legenda iguais), preenchendo semana a semana.
- `panels/stack.mjs`: blocos com os logos em cor. Os números são os projetos onde a ferramenta aparece.
- `panels/project.mjs`: um cartão por projeto, com os logos da stack dele.
- `panels/closing.mjs`: experiência numa escala de meses e "por quê".
- `readme.mjs`: monta o README.md e a versão em texto.

## decisões

- **Sem fonte embutida.** O texto usa Helvetica/Arial do sistema, com larguras pela métrica do Arial (que Helvetica e Liberation Sans compartilham).
- **Animação só em CSS dentro do SVG** (o GitHub não roda JavaScript em imagens). Com `prefers-reduced-motion`, tudo aparece pronto.
