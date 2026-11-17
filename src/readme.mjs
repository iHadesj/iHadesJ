// README.md is generated from the same data as the panels, so links, alt
// texts and the plain-text version never drift apart.

import { num } from './panels/stack.mjs';

const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const img = (src, alt, width) => `<img src="${src}" width="${width}" alt="${attr(alt)}" />`;
const link = (href, inner) => `<a href="${attr(href)}">${inner}</a>`;

export function readme(p, s) {
  const tools = p.stack.flatMap((g) => g.items.map((i) => i.name));

  // one raw HTML block without blank lines: images flow inline, full-width
  // panels stack, cards pair up two by two, buttons sit three in a row
  const panels = [
    img('assets/poster.svg', `${p.first} ${p.last}, ${p.role}, ${p.facts.join(', ')}. ${p.status.join(': ')}. ${s.total} contribuições nos últimos 12 meses.`, '100%'),
    img('assets/stack.svg', `Stack: ${tools.join(', ')}`, '100%'),
    ...p.projects.map((pr, i) => link(pr.link, img(`assets/projects/${pr.slug}.svg`, `${num(i)} ${pr.title}: ${pr.tagline}`, '49%'))),
    img('assets/closing.svg', `${p.job.company}, ${p.job.role}. ${p.why[0]}`, '100%'),
    p.contact.links.map((l) => link(l.href, img(`assets/links/${l.id}.svg`, l.label, '32.6%'))).join(''),
  ];

  const plain = [
    `**${p.first} ${p.last}** · ${p.role} · ${p.facts.join(' · ')} · ${p.status.join(': ')}`,
    '',
    ...p.intro.flatMap((t) => [t, '']),
    ...p.stack.map((g) => `**${g.name}:** ${g.items.map((i) => i.name).join(', ')}  `),
    `**também:** ${p.more.join(', ')}`,
    '',
    ...p.projects.map((pr, i) => `${num(i)}. [${pr.title}](${pr.link}) — ${pr.tagline} ${pr.description} \`${pr.tags.join('` `')}\``),
    '',
    `**${p.job.company}** · ${p.job.role} · ${p.job.from.replace('-', '.')} a ${p.job.to.replace('-', '.')}  `,
    `${p.job.what}. entrei com ${p.job.before.join(', ')}; saí com ${p.job.after.join(', ')}.`,
    '',
    ...p.why.map((l) => `> ${l}  `),
    '',
    `${p.contact.pitch.join(' ')} ${p.contact.links.map((l) => `[${l.label}](${l.href})`).join(' · ')}`,
  ];

  return [
    '<!-- gerado por src/readme.mjs (npm run build): edite src/profile.mjs, não este arquivo -->',
    '<div align="center">',
    ...panels,
    '</div>',
    '',
    '<details>',
    '<summary>versão em texto</summary>',
    '',
    ...plain,
    '',
    '</details>',
    '',
  ].join('\n');
}
