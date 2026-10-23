// Everything the panels say lives here. Edit this file, run `npm run build`
// (or just push: the workflow rebuilds the SVGs) and the profile updates.

export const profile = {
  name: 'Edu Ferreira',
  handle: 'iHadesj',

  // prose for the plain-text version at the end of the README
  text: {
    intro: [
      'Dev full stack, 20 anos, do Grajaú, zona sul de SP. Passei 20 meses na VTT trabalhando com digital signage e retail media pro varejo, e hoje tô procurando a próxima vaga como full stack ou front-end.',
      'Gosto de fazer o app funcionar primeiro e depois foco na estética: regra de negócio no lugar certo, sem lotar de estados, rápido e fácil de usar. Meu dia a dia é React, Next.js e TypeScript. No back, minha base é Java, JPA e PostgreSQL.',
    ],
  },

  hero: {
    title: 'hades@grajau: ~/psycho — 160×72',
    command: './psycho --train ~/edu --epochs 5',
    result: ['training complete · loss 2.35e-09 ', '→ model: edu-ferreira/full-stack@latest'],
    // the session name sits quietly in the status bar
    session: 'psycho cibernetic',
    status: 'grajaú · zona sul · sp',
  },

  whoami: {
    name: 'Edu Ferreira',
    tagline: ['full stack dev', '20 anos', 'grajaú, zona sul de sp'],
    about: [
      ['status', 'procurando a próxima vaga — full stack ou front-end'],
      ['xp', '20 meses na VTT · digital signage e retail media pro varejo'],
      ['front', 'react · next.js · typescript'],
      ['back', 'java · jpa · postgresql'],
      ['estudo', 'análise e desenvolvimento de sistemas @ estácio'],
      ['regra', 'primeiro o app funciona, depois vem a estética'],
    ],
    focus: [
      'interface-responsiva-e-acessivel',
      'regra-de-negocio+estado-global',
      'pwa-offline-first+testes+performance',
      'animacao-e-3d-so-quando-ajudam',
    ],
  },

  stack: {
    rows: [
      { label: '# front-end', icons: ['react', 'nextdotjs', 'typescript', 'javascript', 'tailwindcss', 'threedotjs'] },
      { label: '# back-end · dados · qualidade', icons: ['java', 'postgresql', 'mysql', 'vitest', 'zod', 'git'] },
    ],
    more: [
      'html', 'css', 'motion', 'indexeddb', 'tanstack query', 'react router', 'zustand', 'dexie', 'jpa', 'tomcat',
      'playwright', 'radix ui', 'resend', 'react email', 'velite', 'fuse.js', 'workbox', 'eslint', 'prettier',
    ],
  },

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

  xp: {
    jobs: [
      {
        when: '2025.02 → 2026.10',
        where: 'VTT · Vector Two Technologies',
        role: 'desenvolvedor web',
        summary:
          'Projetos de digital signage e retail media pro varejo. Entrei sabendo HTML, CSS, JavaScript, Java e MySQL e saí com React, Tomcat e mais noção de arquitetura de sistema.',
        lines: [
          ['digital signage e retail media pro varejo'],
          ['entrei com  ', 'html · css · javascript · java · mysql'],
          ['saí com     ', '+ react · tomcat · mais noção de arquitetura de sistema'],
        ],
      },
    ],
    stages: ['ideia', 'regra de negócio', 'experiência', 'código', 'teste', 'evolução'],
    notes: [
      'projeto pessoal não é só tela bonita: é onde eu treino o que faria num produto de verdade —',
      'estrutura de domínio, tela de erro e de vazio, persistência, performance e documentação.',
      'quando é simulação, deixo claro onde ela termina e onde começaria um sistema de produção.',
    ],
  },

  contact: {
    pitch: 'curtiu algum projeto ou quer trocar ideia sobre vaga? é só chamar',
    links: [
      { id: 'linkedin', label: 'linkedin', href: 'https://www.linkedin.com/in/eduardo-alexandre-java/' },
      { id: 'portfolio', label: 'portfólio', href: 'https://edu-ferreira.vercel.app' },
      { id: 'repos', label: 'repositórios', href: 'https://github.com/iHadesj?tab=repositories' },
    ],
  },
};
