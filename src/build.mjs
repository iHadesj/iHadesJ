// Renders every panel into assets/ and writes README.md.
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { profile } from './profile.mjs';
import { contributions, stats } from './lib/contributions.mjs';
import { hero } from './panels/hero.mjs';
import { contrib } from './panels/contrib.mjs';
import { stack } from './panels/stack.mjs';
import { projectCard, layout, cardHeight } from './panels/project.mjs';
import { closing, button } from './panels/closing.mjs';
import { readme } from './readme.mjs';

const OUT = new URL('../assets/', import.meta.url);
rmSync(OUT, { recursive: true, force: true });
for (const dir of ['projects/', 'links/']) mkdirSync(new URL(dir, OUT), { recursive: true });

const days = await contributions(profile.login);
const cardH = Math.max(...profile.projects.map((p) => cardHeight(layout(p))));

const files = {
  hero: hero(profile),
  contrib: contrib(profile, days),
  stack: stack(profile),
  ...Object.fromEntries(profile.projects.map((p, i) => [`projects/${p.slug}`, projectCard(p, i, cardH)])),
  closing: closing(profile),
  ...Object.fromEntries(profile.contact.links.map((l, i) => [`links/${l.id}`, button(l, i)])),
};

let bytes = 0;
for (const [name, svg] of Object.entries(files)) {
  writeFileSync(new URL(`${name}.svg`, OUT), svg);
  bytes += svg.length;
  console.log(`assets/${name}.svg  ${(svg.length / 1024).toFixed(1)} KB`);
}
console.log(`total ${(bytes / 1024).toFixed(1)} KB`);

writeFileSync(new URL('../README.md', import.meta.url), readme(profile, stats(days)));
console.log('README.md');
