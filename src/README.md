# src/ — como o perfil é gerado

Cada painel do README é um SVG escrito por código, sem dependências.

```sh
npm run build   # baixa as contribuições, gera assets/*.svg e o README.md
```

Pra mudar texto, links, projetos ou a stack, edite **`profile.mjs`** e rode o build, ou só dê push na `main`: o workflow `.github/workflows/build.yml` reconstrói e comita. Ele também roda todo dia de madrugada pra atualizar o mapa de contribuições.

## arquivos

- `profile.mjs`: tudo o que o perfil diz.
- `lib/contributions.mjs`: calendário dos últimos 12 meses. Usa a API GraphQL quando há `GITHUB_TOKEN` (na Action) e a página pública de contribuições quando não há (build local). Se as duas falharem, usa a última cópia em `data/contributions.json`.
- `lib/svg.mjs`: paleta, medidas de texto e elementos básicos.
- `panels/poster.mjs`: nome, status e a matriz de pontos (1 ponto = 1 dia; tamanho = quantidade).
- `panels/stack.mjs`: tabela da stack. Os números em vermelho são os projetos onde cada ferramenta aparece, calculados a partir das tags e descrições.
- `panels/project.mjs`: um cartão por projeto, todos com a mesma altura.
- `panels/closing.mjs`: experiência numa escala de meses, "por quê", contato e botões.
- `readme.mjs`: monta o README.md e a versão em texto.

## decisões

- **Sem fonte embutida.** O texto usa Helvetica/Arial do sistema. As larguras vêm da métrica do Arial, que Helvetica e Liberation Sans compartilham, então o layout fecha em Mac, Windows e Linux, e os 14 painéis somam ~46 KB.
- **Animação só como ênfase.** O SVG estático já está completo; a agulha que varre o mapa, o "pulo" das colunas e o status piscando são extras. Com `prefers-reduced-motion`, nada anima.
- **Contraste:** texto pequeno fica acima de 4.5:1 (cinza `#66635b` no papel, branco no vermelho `#cf2f18`).
