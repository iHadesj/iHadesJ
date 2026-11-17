// The contribution calendar (last ~12 months) that drives the poster.
//
// 1. GITHUB_TOKEN set (the Action)  → GraphQL API
// 2. no token (local build)         → the public calendar page
// 3. both fail / offline            → the last copy saved in src/data/
// Every successful fetch refreshes that copy, so the build never breaks.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const CACHE = new URL('../data/contributions.json', import.meta.url);

async function fromGraphQL(login, token) {
  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{
    weeks{contributionDays{date contributionCount}}}}}}`;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { authorization: `bearer ${token}`, 'content-type': 'application/json', 'user-agent': 'profile-build' },
    body: JSON.stringify({ query, variables: { login } }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(JSON.stringify(json.errors ?? res.status));
  return json.data.user.contributionsCollection.contributionCalendar.weeks
    .flatMap((w) => w.contributionDays)
    .map((d) => ({ date: d.date, count: d.contributionCount }));
}

async function fromPublicPage(login) {
  const res = await fetch(`https://github.com/users/${login}/contributions`, { headers: { 'user-agent': 'profile-build' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const byId = new Map();
  for (const [, date, id] of html.matchAll(/data-date="([\d-]+)" id="([^"]+)"/g)) byId.set(id, { date, count: 0 });
  for (const [, id, count] of html.matchAll(/for="([^"]+)"[^>]*>(\d+) contributions? on/g)) {
    if (byId.has(id)) byId.get(id).count = Number(count);
  }
  if (byId.size < 300) throw new Error('calendar markup changed');
  return [...byId.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export async function contributions(login) {
  const sources = [
    process.env.GITHUB_TOKEN && ['graphql', () => fromGraphQL(login, process.env.GITHUB_TOKEN)],
    ['public page', () => fromPublicPage(login)],
  ].filter(Boolean);

  for (const [name, load] of sources) {
    try {
      const days = await load();
      writeFileSync(CACHE, `${JSON.stringify({ source: name, days })}\n`);
      console.log(`contributions: ${days.length} days via ${name}`);
      return days;
    } catch (err) {
      console.warn(`contributions: ${name} failed (${err.message})`);
    }
  }
  if (!existsSync(CACHE)) throw new Error('no contribution data and no cache');
  console.warn('contributions: using cached copy');
  return JSON.parse(readFileSync(CACHE, 'utf8')).days;
}

/** Numbers worth printing big. */
export function stats(days) {
  const total = days.reduce((s, d) => s + d.count, 0);
  const active = days.filter((d) => d.count > 0).length;
  const best = days.reduce((a, d) => (d.count > a.count ? d : a), days[0]);
  let streak = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    streak = Math.max(streak, run);
  }
  return { total, active, best, streak };
}
