// Everything the profile says lives here. Edit, run `npm run build`
// (or just push: the workflow rebuilds) and the README follows.

export const profile = {
  login: 'iHadesj',
  first: 'Edu',
  last: 'Ferreira',
  role: 'full stack dev',
  facts: ['20 anos', 'grajaú, zona sul de sp'],
  status: ['procurando vaga', 'full stack ou front-end'],
  intro: [
    'Dev full stack, 20 anos, do Grajaú, zona sul de SP. Passei 20 meses na VTT trabalhando com digital signage e retail media pro varejo, e hoje tô procurando a próxima vaga como full stack ou front-end.',
    'Gosto de fazer o app funcionar primeiro e depois foco na estética: regra de negócio no lugar certo, sem lotar de estados, rápido e fácil de usar. Meu dia a dia é React, Next.js e TypeScript. No back, minha base é Java, JPA e PostgreSQL.',
  ],

  // `match`: words looked up in each project's tags/description, so the
  // stack table can point at the projects where each tool shows up.
  stack: [
    {
      name: 'front-end',
      items: [
        { icon: 'react', match: ['react'] },
        { icon: 'nextdotjs', match: ['next.js'] },
        { icon: 'typescript', match: ['typescript'] },
        { icon: 'javascript', match: ['javascript'] },
        { icon: 'tailwindcss', match: ['tailwind v4'] },
        { icon: 'threedotjs', match: ['three.js'] },
      ],
    },
    {
      name: 'back-end · dados · qualidade',
      items: [
        { icon: 'java', match: ['java'] },
        { icon: 'postgresql', match: ['postgresql'] },
        { icon: 'mysql', match: ['mysql'] },
        { icon: 'vitest', match: ['vitest'] },
        { icon: 'zod', match: ['zod'] },
        { icon: 'git', note: 'sempre' },
      ],
    },
  ],
  more: [
    'jpa / hibernate', 'tomcat', 'zustand', 'dexie / indexeddb', 'tanstack query', 'react router', 'motion',
    'playwright', 'radix ui', 'web audio api', 'workbox', 'fuse.js', 'resend', 'velite', 'eslint', 'prettier',
  ],

  projects: [
    {
      slug: 'levva-loja-e-sorte',
      title: 'Levva — Loja & Sorte',
      tagline: 'E-commerce gamificado, meu laboratório de produto.',
      description:
        'PWA com catálogo de 400 produtos, busca fuzzy, carrinho/checkout com dinheiro em centavos, cassino/gacha com RTP auditável, 29 testes, offline-first.',
      tags: ['react', 'typescript', 'zustand', 'dexie', 'vitest', 'pwa'],
      link: 'https://github.com/iHadesj/Levva-loja-e-sorte',
    },
    {
      slug: 'eduardo-ferreira',
      title: 'Portfólio Pessoal',
      tagline: 'Minha experiência transformada em site.',
      description:
        'Site spec-driven: 3D lazy-loaded (230 KB gz), animações com Motion, testes unitários + e2e, validação Zod, conteúdo tipado.',
      tags: ['next.js', 'react', 'typescript', 'tailwind v4', 'three.js'],
      link: 'https://github.com/iHadesj/EduardoFerreira',
    },
    {
      slug: 'change_in_the_house_of_flies',
      title: 'change_in_the_house_of_flies',
      tagline: 'Música transformada em UI interativa.',
      description:
        'Espectro realtime via Web Audio API, letra sincronizada (.lrc), Media Session API, refrão dispara intensidade visual (halo, zoom, tremor).',
      tags: ['javascript', 'web audio api', 'vite'],
      link: 'https://github.com/iHadesj/change_in_the_house_of_flies',
    },
    {
      slug: 'devtrack',
      title: 'DevTrack',
      tagline: 'Tracker de progresso de estudos e projetos.',
      description: 'Foco em produtividade dev: organização de tarefas, métricas de tempo, visualização de evolução.',
      tags: ['typescript'],
      link: 'https://github.com/iHadesj/DevTrack',
    },
    {
      slug: 'jpa-postgresql',
      title: 'API Java + PostgreSQL',
      tagline: 'CRUD limpo em arquitetura MVC.',
      description: 'Controller → Service → Repository, consultas versionadas em SQL, testes com JUnit.',
      tags: ['java', 'spring', 'jpa/hibernate', 'postgresql', 'junit'],
      link: 'https://github.com/iHadesj/JPA_PostgreSQL',
    },
    {
      slug: 'projeto-crud',
      title: 'Projeto CRUD',
      tagline: 'Base de CRUD com JDBC/MySQL.',
      description: 'Fundamentos de persistência: conexão, statements, transações, padrão DAO.',
      tags: ['java', 'jdbc', 'mysql'],
      link: 'https://github.com/iHadesj/Projeto_CRUD',
    },
  ],

  job: {
    short: 'VTT',
    company: 'Vector Two Technologies',
    role: 'desenvolvedor web',
    from: '2025-02',
    to: '2026-10',
    what: 'digital signage e retail media pro varejo',
    before: ['html', 'css', 'javascript', 'java', 'mysql'],
    after: ['react', 'tomcat', 'arquitetura de sistema'],
  },

  why: [
    'code got cheap. reading it never did.',
    'the crowd hands its thinking to a prompt and ships whatever comes back.',
    'i stay in the editor, line by line, learning how things are meant to stand.',
    'to me code was always a kind of art, and art was never meant to be outsourced.',
    'every repo here is my taste in syntax. the judgment is mine too.',
  ],

  contact: {
    pitch: ['curtiu algum projeto', 'ou quer falar de vaga?'],
    links: [
      { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/eduardo-alexandre-java/' },
      { id: 'portfolio', label: 'Portfólio', href: 'https://edu-ferreira.vercel.app' },
      { id: 'repos', label: 'Repositórios', href: 'https://github.com/iHadesj?tab=repositories' },
    ],
  },
};
