// README.md is generated too, from the same profile data as the panels,
// so links, alt texts and the plain-text version never drift apart.

import { ICONS } from './data/icons.mjs';

const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const img = (src, alt, size) => `<img src="${src}" ${size} alt="${attr(alt)}" />`;
const link = (href, inner) => `<a href="${attr(href)}">${inner}</a>`;

export function readme({ whoami, stack, projects, xp, contact, text }) {
  const logos = stack.rows.flatMap((r) => r.icons.map((k) => ICONS[k].label));

  const panels = [
    img('assets/hero.svg', 'Terminal rodando ./psycho --train: um rosto em arte ASCII, gerado de um modelo 3D feito em código, converge época por época enquanto um log de treino espelhado sobe pelo rastro de pixels.', 'width="100%"'),
    img('assets/whoami.svg', `whoami: ${whoami.name}, ${whoami.tagline.join(', ')}`, 'width="100%"'),
    img('assets/stack.svg', `Stack: ${logos.join(', ')}`, 'width="100%"'),
    ...projects.map((p) => link(p.link, img(`assets/projects/${p.slug}.svg`, `${p.title}: ${p.tagline}`, 'width="49%"'))),
    img('assets/xp.svg', `Experiência: ${xp.jobs.map((j) => `${j.where} (${j.when})`).join(', ')}`, 'width="100%"'),
    img('assets/contact.svg', contact.pitch, 'width="100%"'),
  ];
  const buttons = contact.links.map((l) => link(l.href, img(`assets/links/${l.id}.svg`, l.label, 'height="44"')));

  const plain = [
    `**${whoami.name}** · ${whoami.tagline.join(' · ')}`,
    '',
    ...text.intro.flatMap((p) => [p, '']),
    ...whoami.focus.map((f) => `- \`~/foco/${f}/\``),
    '',
    `**Stack:** ${logos.join(', ')}  `,
    `**Também:** ${stack.more.join(', ')}`,
    '',
    '**Projetos**',
    '',
    ...projects.map((p) => `- [${p.title}](${p.link}) — ${p.tagline} ${p.description} \`${p.tags.join('` `')}\``),
    '',
    ...xp.jobs.map((j) => `**${j.where}** · ${j.role} · ${j.when.replace('→', 'a')}  \n${j.summary}`),
    '',
    ...xp.why.map((l) => `> ${l}  `),
    '',
    `${contact.pitch}: ${contact.links.map((l) => `[${l.label}](${l.href})`).join(' · ')}`,
  ];

  // one raw HTML block (no blank lines): images flow inline, so full-width
  // panels stack with a hairline gap and project cards pair up two by two
  return [
    '<!-- gerado por src/readme.mjs (npm run build): edite src/profile.mjs, não este arquivo -->',
    '<div align="center">',
    ...panels,
    ...buttons,
    '</div>',
    '',
    '<details>',
    '<summary><code>cat README.txt</code> — versão em texto, sem animação</summary>',
    '',
    ...plain,
    '',
    '</details>',
    '',
    '<sub>tudo acima é gerado por código: o rosto é um modelo 3D feito com SDFs e ray marching, convertido em ASCII no build. sem foto, sem gif. veja <a href="src/">src/</a>.</sub>',
    '',
  ].join('\n');
}
