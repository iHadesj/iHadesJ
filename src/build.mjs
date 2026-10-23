// Renders every panel into assets/ and writes README.md.
// Usage: node src/build.mjs [panel...]   e.g. `hero`, `projects`, `readme`
import { mkdirSync, writeFileSync } from 'node:fs';
import { profile } from './profile.mjs';
import { hero } from './panels/hero.mjs';
import { whoami } from './panels/whoami.mjs';
import { stack } from './panels/stack.mjs';
import { projectCard, cardMetrics } from './panels/project.mjs';
import { xp } from './panels/xp.mjs';
import { goodbye, button } from './panels/contact.mjs';
import { readme } from './readme.mjs';
import { missingGlyphs } from './lib/guard.mjs';
import { embedFonts } from './lib/fonts.mjs';

const OUT = new URL('../assets/', import.meta.url);

const panels = {
  hero: () => hero(profile.hero),
  whoami: () => whoami(profile.whoami),
  stack: () => stack(profile.stack),
  ...projectPanels(),
  xp: () => xp(profile.xp),
  contact: () => goodbye(profile.contact),
  ...Object.fromEntries(profile.contact.links.map((l, index) => [`links/${l.id}`, () => button({ ...l, index })])),
};

// one card per project, all with the same height so they line up in pairs
function projectPanels() {
  const metrics = profile.projects.map(cardMetrics);
  const lines = Math.max(...metrics.map((m) => m.lines));
  const chipRows = Math.max(...metrics.map((m) => m.chipRows));
  return Object.fromEntries(profile.projects.map((p, index) =>
    [`projects/${p.slug}`, () => projectCard(p, { index: index % 2, lines, chipRows })]));
}

const only = process.argv.slice(2);
for (const dir of ['projects/', 'links/']) mkdirSync(new URL(dir, OUT), { recursive: true });
for (const [name, render] of Object.entries(panels)) {
  if (only.length && !only.some((o) => name.startsWith(o))) continue;
  const started = performance.now();
  const svg = embedFonts(render());
  const missing = missingGlyphs(svg);
  if (missing.length) {
    console.error(`✗ ${name}: not in the embedded font: ${missing.join(' ')} (see scripts/subset-fonts.sh)`);
    process.exitCode = 1;
  }
  writeFileSync(new URL(`${name}.svg`, OUT), svg);
  console.log(`assets/${name}.svg  ${(svg.length / 1024).toFixed(1)} KB  ${Math.round(performance.now() - started)} ms`);
}

if (!only.length || only.includes('readme')) {
  writeFileSync(new URL('../README.md', import.meta.url), readme(profile));
  console.log('README.md');
}
