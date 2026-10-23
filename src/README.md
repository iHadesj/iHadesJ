# src/ — como o perfil é gerado

Nada no README é imagem pronta: cada painel é um SVG escrito por código, sem dependências.

```sh
npm run build        # gera assets/*.svg e o README.md
npm run build:hero   # só o terminal principal (o mais lento, ~15 s)
```

Pra mudar texto, links, projetos ou a stack, edite **`profile.mjs`** e rode o build — ou só dê push na `main`: o workflow `.github/workflows/build.yml` reconstrói tudo e comita.

## o rosto (`art/`)

1. **`head.mjs`** — uma cabeça modelada com SDFs (*signed distance functions*), escrita em centímetros com proporções de cabeça adulta padrão (olhos na metade da altura, rosto em terços, traços neutros tipo manequim). Crânio, face, nariz, lábios e olhos são ~30 primitivas misturadas com `smin`.
2. **ray marching** com luz direcional, sombra suave e oclusão ambiente → um buffer de luminância.
3. **`portrait.mjs`** — luminância → rampa de caracteres (`.` `:` `-` `=` `+` `*` `#` `%` `@`) com dithering Floyd–Steinberg. A parte de trás da cabeça se desfaz em pixels que escorrem pra esquerda, e o log de treino espelhado sobe pelo rastro.
4. **`trainingFrames()`** — as épocas do "treino": wireframe → blocos → rosto final.

## o resto

- `art/raster.mjs` — rasterizador de path SVG (béziers, arcos, preenchimento *nonzero*) que transforma os logos da stack em ASCII.
- `art/glyphs.json` — quanto cada caractere preenche a célula (gerado por `scripts/glyph-shapes.py`).
- `art/banner.mjs` — letras em bloco no estilo do figlet "ANSI Shadow".
- `lib/term.mjs`, `lib/script.mjs` — janela de terminal, prompt, digitação e uma "sessão" que anima linha por linha.
- `panels/` — um arquivo por painel.

**Animação:** só CSS e SMIL dentro do SVG (o GitHub não roda JavaScript em imagens). O CSS normal de cada elemento é o estado final; a animação só toca a introdução — com `prefers-reduced-motion`, aparece tudo pronto.

**Fonte:** JetBrains Mono (OFL), um subset embutido em base64 em cada SVG (`fonts/`). O build avisa se algum painel usar um caractere que não está no subset.
