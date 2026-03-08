# ECONOPEDIA101 — Product Requirements Document (PRD) v2.0
# Definitive Refactoring Blueprint: WordPress → Modern TypeScript Architecture
# For use with Claude Code

---

## 0. Executive Summary

**Project:** Refactorización completa de Econopedia101.com desde WordPress (AxiomThemes + trx_addons + WooCommerce) hacia un stack moderno 100% TypeScript con maximum performance, diseño minimalista profesional y arquitectura preparada para escalar a un blog-business legítimo con monetización.

**Sitio actual:** https://econopedia101.com/
**Propietaria:** Tasmin Angelina Houssein (Founder & Creator)
**Dominio:** econopedia101.com

### Misión y Visión

ECONOPEDIA 101 es una plataforma educativa diseñada para ofrecer contenido de blog accesible e insightful sobre trading, inversión, economía, finanzas, startups, negocios, guías prácticas, herramientas interactivas (calculadoras y generadores) y recursos educativos incluyendo material para GCSE y A-Level.

**La visión:** Crear un blog-business legítimo y escalable, comenzando con contenido SEO-rich y evolucionando hacia un recurso con herramientas interactivas, partnerships de afiliados, y monetización por newsletter. El sitio combina valor informativo con potencial de monetización, apuntando tanto a learners B2C como, con el tiempo, a lectores B2B (dueños de pequeños negocios, emprendedores).

**Tagline:** "Where Money, Business & Economics Connect"

### Objetivos Principales

1. Performance score 95+ en Lighthouse (todas las métricas)
2. Diseño minimalista, profesional y visualmente atractivo (paleta financiera: green, black, white)
3. Stack 100% TypeScript con tooling moderno
4. SEO orgánico superior al sitio WordPress actual (schema markup, long-tail keywords, internal linking)
5. Arquitectura preparada para monetización (Mediavine ads, afiliados, lead magnets, newsletter)
6. Herramientas interactivas (calculadoras financieras) como traffic boosters
7. DX (Developer Experience) excelente para mantenimiento y escalamiento futuro

---

## 1. Target Audience

| Segmento | Descripción | Qué buscan |
|----------|-------------|------------|
| **Students** | GCSE, college, self-learners | Notas simplificadas, artículos fáciles, herramientas de estudio, quizzes |
| **Finance Curious** | Principiantes en trading/finanzas | Guías "how to start", explicadores de herramientas, artículos accesibles |
| **Professionals** | Business owners, freelancers | Insights financieros, economía aplicada, calculadoras |
| **Passive Readers** | Visitantes desde Google search | Definiciones, herramientas, guías cortas y directas |

---

## 2. Content Pillars & Categories

### 2.1 Trading (NUEVO — alta prioridad, alto CPC)
- Guías para principiantes: forex, crypto, stocks, derivados (arbitraje, especulación, hedging)
- Posiciones long/short, spot, strike prices, premiums
- Keywords long-tail informativos: "how to calculate pips in forex", etc.
- Tool pages: profit calculators, leverage calculators, ROI calculators
- CPC estimado: alto ($3+ por click en muchos términos)

### 2.2 Economics
- Micro y macro conceptos simplificados
- Temas de GCSE/A-Level economics
- Infografías y series de artículos
- Contenido evergreen de formato largo
- CPC estimado: £1.50 – £2.50

### 2.3 Finance
- Budgeting, inflación, finanzas personales
- Alto CPC con keywords como "how to manage debt", "best credit cards for students"
- Potencial de afiliados fuerte
- CPC estimado: £2.00 – £4.00

### 2.4 Business
- Guías de emprendimiento y estrategia empresarial
- Economía aplicada a startups
- Financial management para negocios
- CPC estimado: £1.00 – £3.00

### 2.5 Banking & Insurance (NUEVO)
- Artículos sobre sistemas bancarios y pólizas de seguros
- Impacto económico del sector financiero
- Altísimo CPC: £3.00 – £6.00
- Gran potencial de affiliate marketing para herramientas financieras

### 2.6 Education & Resources
- PDFs descargables, cheat sheets, concept explainers
- Artículos SEO tipo "what is XYZ?"
- Recursos para GCSE y A-Level
- Lead magnet opportunity (email capture a cambio de recursos)
- CPC estimado: £1.00 – £2.00

### 2.7 Tools (Traffic Boosters — NUEVO)
- Calculadoras interactivas embebidas como React islands:
  - Profit & Loss Calculator
  - Position Size Calculator
  - Inflation Calculator
  - Compound Interest Calculator
  - Demand & Supply Graph Generator
  - Leverage Calculator
  - ROI Calculator
- Incrementan page time, sessions, backlinks y tráfico
- Se pueden monetizar con ads alrededor

### 2.8 Quiz
- Quizzes interactivos para reforzar aprendizaje
- Engagement tool que aumenta session duration

---

## 3. Tech Stack

### Core

| Capa | Tecnología | Versión | Justificación |
|------|-----------|---------|---------------|
| **Framework** | Astro | 5.x | Zero JS by default, islands architecture, content collections, fastest SSG |
| **Lenguaje** | TypeScript | 5.x | Strict mode, type safety end-to-end |
| **UI Islands** | React 19 | 19.x | Solo para componentes interactivos (search, quiz, newsletter, calculators, charts) |
| **Styling** | Tailwind CSS | 4.x | Utility-first, tree-shaking, design tokens via CSS variables |
| **Animations** | Motion (framer-motion lite) | latest | View transitions + scroll animations, solo donde agreguen valor |
| **Content** | Astro Content Collections | built-in | Type-safe markdown/MDX con Zod schemas |
| **Search** | Pagefind | latest | Static search index, zero-config, client-side |
| **Charts** | Recharts | latest | Para gráficos en artículos de trading/finance y calculadoras |
| **Icons** | Lucide Icons | latest | Tree-shakeable, consistent, lightweight |
| **Math** | mathjs | latest | Para calculadoras financieras (compound interest, position sizing, etc.) |

### Infrastructure

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| **Deploy** | Cloudflare Pages | Fastest global CDN (300+ PoPs), unlimited bandwidth free tier, Workers for server logic, zero cold starts |
| **Images** | Astro Image (Sharp) | Build-time optimization, AVIF/WebP, responsive srcset |
| **Fonts** | Fontsource | Self-hosted, no external requests, zero FOUT |
| **Analytics (traffic)** | Cloudflare Web Analytics | Privacy-first, free, no cookies, pageviews + Core Web Vitals + top pages |
| **Analytics (behavior)** | Microsoft Clarity | Free unlimited, heatmaps, session recordings, scroll depth, rage/dead click detection |
| **Newsletter** | Resend + React Email | Modern email API, TypeScript SDK (reemplaza ConvertKit/Mailchimp) |
| **Forms** | Astro Server Endpoints on Cloudflare Workers | Contact form + newsletter via edge functions, zero cold starts |
| **RSS** | @astrojs/rss | Built-in RSS feed generation |
| **Sitemap** | @astrojs/sitemap | Auto-generated sitemap.xml |
| **MDX** | @astrojs/mdx | Rich content con componentes embebidos (calculadoras dentro de artículos) |

### Dev Tooling

| Herramienta | Uso |
|-------------|-----|
| **Biome** | Linting + formatting (reemplaza ESLint + Prettier, 100x faster) |
| **pnpm** | Package manager (fastest, strict, disk efficient) |
| **Husky + lint-staged** | Pre-commit hooks |
| **Vitest** | Unit testing (calculators logic, utils) |
| **Playwright** | E2E testing |

---

## 4. Project Structure

```
econopedia101/
├── astro.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── biome.json
├── package.json
├── _redirects                                   # Cloudflare Pages redirects WP → new
├── _headers                                     # Cloudflare Pages custom headers (caching)
├── public/
│   ├── fonts/
│   ├── images/
│   │   ├── logos/
│   │   │   ├── econopedia-logo-full.svg         # Full logo (text + icon)
│   │   │   ├── econopedia-logo-icon.svg         # Icon only (favicon-ready)
│   │   │   └── econopedia-logo-footer.svg       # Footer variant (stroke)
│   │   ├── og/
│   │   │   └── default-og.png                   # Open Graph fallback
│   │   └── lead-magnets/                        # Downloadable PDFs
│   │       ├── gcse-economics-cheatsheet.pdf
│   │       └── trading-beginners-guide.pdf
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── assets/
│   │   └── images/
│   │       ├── authors/
│   │       │   └── tasmin-angelina.webp
│   │       ├── posts/                           # Article featured images
│   │       └── decorative/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   ├── Navigation.astro
│   │   │   ├── MobileMenu.tsx                   # React island (fullscreen overlay)
│   │   │   ├── ThemeToggle.astro                # Dark/light mode
│   │   │   ├── Logo.astro
│   │   │   ├── SEOHead.astro                    # All meta, OG, JSON-LD
│   │   │   ├── Breadcrumbs.astro
│   │   │   ├── SkipLink.astro
│   │   │   └── ExchangeRateTicker.tsx           # React island — live rates banner
│   │   ├── home/
│   │   │   ├── HeroSection.astro
│   │   │   ├── ContentPillars.astro             # 6 pillar cards (Trading, Econ, etc.)
│   │   │   ├── FeaturedPost.astro
│   │   │   ├── PostGrid.astro
│   │   │   ├── RecentPosts.astro
│   │   │   ├── QuoteBlock.astro
│   │   │   ├── ToolsPreview.astro               # Preview of calculators
│   │   │   └── NewsletterCTA.astro
│   │   ├── blog/
│   │   │   ├── PostCard.astro
│   │   │   ├── PostCardCompact.astro
│   │   │   ├── PostCardFeatured.astro
│   │   │   ├── PostHeader.astro
│   │   │   ├── PostBody.astro
│   │   │   ├── AuthorBio.astro
│   │   │   ├── CategoryBadge.astro
│   │   │   ├── ShareButtons.astro
│   │   │   ├── RelatedPosts.astro
│   │   │   ├── TableOfContents.astro
│   │   │   ├── ReadingProgress.tsx              # React island
│   │   │   └── LeadMagnetCTA.astro              # In-article download CTA
│   │   ├── category/
│   │   │   ├── CategoryHeader.astro
│   │   │   └── CategoryGrid.astro
│   │   ├── tools/                               # Interactive calculators (React islands)
│   │   │   ├── ProfitLossCalculator.tsx
│   │   │   ├── PositionSizeCalculator.tsx
│   │   │   ├── InflationCalculator.tsx
│   │   │   ├── CompoundInterestCalculator.tsx
│   │   │   ├── LeverageCalculator.tsx
│   │   │   ├── ROICalculator.tsx
│   │   │   ├── SupplyDemandGraph.tsx            # Interactive D&S graph generator
│   │   │   └── shared/
│   │   │       ├── CalculatorShell.tsx           # Shared layout for all calcs
│   │   │       ├── ResultDisplay.tsx
│   │   │       ├── NumberInput.tsx
│   │   │       └── ChartDisplay.tsx             # Recharts wrapper
│   │   ├── interactive/                         # Other React islands
│   │   │   ├── SearchDialog.tsx
│   │   │   ├── NewsletterForm.tsx
│   │   │   ├── QuizWidget.tsx
│   │   │   └── CounterAnimation.tsx
│   │   └── ui/                                  # Design system primitives
│   │       ├── Button.astro
│   │       ├── Card.astro
│   │       ├── Badge.astro
│   │       ├── Container.astro
│   │       ├── Section.astro
│   │       ├── Separator.astro
│   │       ├── Skeleton.astro
│   │       ├── Input.astro
│   │       ├── Tooltip.astro
│   │       └── Prose.astro
│   ├── content/
│   │   ├── config.ts                            # Zod schemas
│   │   ├── posts/                               # Blog articles (.mdx)
│   │   │   ├── cleanliness-roi-outsourcing-vancouver-businesses.mdx
│   │   │   ├── why-high-maintenance-beauty-is-a-low-yield-asset.mdx
│   │   │   ├── the-growth-strategy-of-climate-custom-deck.mdx
│   │   │   ├── economic-model-behind-eula-aesthetics-success.mdx
│   │   │   ├── economics-education-with-story-boards-ai.mdx
│   │   │   ├── how-to-value-and-compare-gold-equities.mdx
│   │   │   ├── gold-etf-vs-physical-gold-returns.mdx
│   │   │   ├── how-to-build-a-gold-allocation-for-portfolio-diversification.mdx
│   │   │   └── why-is-gold-more-valuable-than-silver.mdx
│   │   ├── authors/
│   │   │   └── tasmin-angelina-houssein.yaml
│   │   └── tools/                               # Tool metadata (.yaml)
│   │       ├── profit-loss-calculator.yaml
│   │       ├── position-size-calculator.yaml
│   │       ├── inflation-calculator.yaml
│   │       ├── compound-interest-calculator.yaml
│   │       ├── leverage-calculator.yaml
│   │       ├── roi-calculator.yaml
│   │       └── supply-demand-graph.yaml
│   ├── layouts/
│   │   ├── BaseLayout.astro                     # HTML shell, fonts, meta, JSON-LD
│   │   ├── PageLayout.astro                     # Standard page (about, contact)
│   │   ├── PostLayout.astro                     # Blog article
│   │   ├── CategoryLayout.astro                 # Category listing
│   │   └── ToolLayout.astro                     # Calculator/tool page
│   ├── lib/
│   │   ├── constants.ts                         # Site metadata, social links, nav items
│   │   ├── utils.ts                             # Date formatting, slug helpers
│   │   ├── reading-time.ts                      # Calculate reading time
│   │   ├── og-image.ts                          # Dynamic OG image generation
│   │   ├── seo.ts                               # JSON-LD schema builders
│   │   └── finance/                             # Calculator logic (pure functions, testable)
│   │       ├── profit-loss.ts
│   │       ├── position-size.ts
│   │       ├── inflation.ts
│   │       ├── compound-interest.ts
│   │       ├── leverage.ts
│   │       ├── roi.ts
│   │       └── supply-demand.ts
│   ├── pages/
│   │   ├── index.astro                          # Homepage
│   │   ├── about.astro                          # About Us + Team
│   │   ├── contact.astro                        # Contact form
│   │   ├── privacy.astro                        # Privacy Policy
│   │   ├── sitemap-html.astro                   # HTML sitemap (user-friendly)
│   │   ├── trading/
│   │   │   └── index.astro                      # Trading section landing
│   │   ├── economics/
│   │   │   └── index.astro                      # Economics 101 landing
│   │   ├── finance/
│   │   │   └── index.astro                      # Finance 101 landing
│   │   ├── business/
│   │   │   └── index.astro                      # Business landing
│   │   ├── banking/
│   │   │   └── index.astro                      # Banking & Insurance landing
│   │   ├── education/
│   │   │   └── index.astro                      # Education & Resources landing
│   │   ├── blog/
│   │   │   ├── index.astro                      # All articles (paginated)
│   │   │   └── [...slug].astro                  # Dynamic article pages
│   │   ├── category/
│   │   │   └── [category].astro                 # Category archive
│   │   ├── author/
│   │   │   └── [author].astro                   # Author profile + articles
│   │   ├── tools/
│   │   │   ├── index.astro                      # Tools hub (all calculators)
│   │   │   ├── profit-loss-calculator.astro
│   │   │   ├── position-size-calculator.astro
│   │   │   ├── inflation-calculator.astro
│   │   │   ├── compound-interest-calculator.astro
│   │   │   ├── leverage-calculator.astro
│   │   │   ├── roi-calculator.astro
│   │   │   └── supply-demand-graph.astro
│   │   ├── quiz/
│   │   │   └── index.astro                      # Quiz section
│   │   ├── api/
│   │   │   └── subscribe.ts                     # Newsletter endpoint → Resend
│   │   ├── rss.xml.ts                           # RSS feed
│   │   └── 404.astro                            # Custom 404 with search
│   ├── styles/
│   │   ├── global.css                           # Tailwind directives + design tokens
│   │   ├── prose.css                            # Article typography
│   │   └── transitions.css                      # View transition animations
│   └── types/
│       └── index.ts                             # Shared TypeScript types
├── tests/
│   ├── unit/
│   │   └── finance/                             # Calculator logic tests
│   │       ├── compound-interest.test.ts
│   │       ├── profit-loss.test.ts
│   │       └── ...
│   └── e2e/
└── scripts/
    └── migrate-wp-content.ts                    # WP REST API → MDX migration
```

---

## 5. Content Collections Schema

```typescript
// src/content/config.ts
import { defineCollection, z, reference } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().max(160),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    author: reference('authors'),
    categories: z.array(z.enum([
      'trading',
      'economics',
      'finance',
      'business',
      'banking-insurance',
      'education',
      'tools-and-reviews',
      'quiz',
    ])),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    cover: image(),
    coverAlt: z.string(),
    draft: z.boolean().default(false),
    // SEO
    ogImage: image().optional(),
    canonicalUrl: z.string().url().optional(),
    // Lead magnet CTA dentro del artículo
    leadMagnet: z.object({
      title: z.string(),
      description: z.string(),
      file: z.string(),  // path in public/lead-magnets/
    }).optional(),
    // Computed via remark plugin
    readingTime: z.string().optional(),
    // Monetization hints
    affiliateDisclosure: z.boolean().default(false),
  }),
});

const authors = defineCollection({
  type: 'data',
  schema: ({ image }) => z.object({
    name: z.string(),
    slug: z.string(),
    role: z.string(),
    bio: z.string(),
    shortBio: z.string().max(100),
    avatar: image(),
    socials: z.object({
      twitter: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      instagram: z.string().url().optional(),
      website: z.string().url().optional(),
    }).optional(),
  }),
});

const tools = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string().max(160),
    longDescription: z.string(),
    icon: z.string(),           // Lucide icon name
    category: z.enum(['trading', 'finance', 'economics']),
    keywords: z.array(z.string()),   // SEO long-tail keywords
    relatedPosts: z.array(z.string()).default([]),  // slugs of related articles
  }),
});

export const collections = { posts, authors, tools };
```

---

## 6. Design System

### 6.1 Design Principles
1. **Content-first:** El contenido es el protagonista, el UI se mantiene invisible
2. **Whitespace generoso:** Breathing room entre secciones, nunca claustrofóbico
3. **Tipografía como elemento de diseño:** Jerarquía clara, tamaños dramáticos en headings
4. **Microtransiciones:** Animaciones sutiles que den vida sin distraer
5. **Contraste intencional:** Light mode limpio y profesional, dark mode sofisticado
6. **Finance-grade credibility:** Paleta Green/Black/White que comunique confianza y profesionalismo

### 6.2 Design Tokens

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  /* --- Typography --- */
  --font-sans: 'Inter Variable', 'Inter', system-ui, -apple-system, sans-serif;
  --font-serif: 'Newsreader Variable', 'Newsreader', Georgia, serif;
  --font-mono: 'JetBrains Mono Variable', 'JetBrains Mono', monospace;

  /* --- Color Palette: Finance Green + Neutral --- */

  /* Light Mode (default) */
  --color-background: #FAFAF9;           /* warm white */
  --color-surface: #FFFFFF;              /* cards, elevated surfaces */
  --color-surface-elevated: #F5F5F4;    /* subtle sections */
  --color-text-primary: #0A0A0A;         /* near-black for readability */
  --color-text-secondary: #525252;       /* muted body text */
  --color-text-muted: #A3A3A3;          /* timestamps, labels */
  --color-border: #E5E5E5;
  --color-border-subtle: #F5F5F4;

  /* Brand: Finance Green — professional, trustworthy, growth */
  --color-accent: #16A34A;               /* primary green */
  --color-accent-hover: #15803D;         /* darker green on hover */
  --color-accent-light: #DCFCE7;         /* green tint backgrounds */
  --color-accent-dark: #14532D;          /* green on dark surfaces */
  --color-accent-muted: #BBF7D0;        /* badges, subtle highlights */

  /* Secondary accent: charcoal black for modern & bold feel */
  --color-secondary: #171717;            /* dark UI elements */
  --color-secondary-hover: #262626;

  /* Semantic */
  --color-success: #16A34A;
  --color-warning: #D97706;
  --color-error: #DC2626;
  --color-info: #2563EB;

  /* Category colors (for badges and section accents) */
  --color-cat-trading: #7C3AED;          /* purple — finance/markets vibe */
  --color-cat-economics: #2563EB;        /* blue — academic, institutional */
  --color-cat-finance: #16A34A;          /* green — money, growth */
  --color-cat-business: #EA580C;         /* orange — entrepreneurship, energy */
  --color-cat-banking: #0891B2;          /* cyan — corporate, trust */
  --color-cat-education: #D946EF;        /* pink — learning, creativity */

  /* --- Spacing --- */
  --spacing-section: clamp(4rem, 8vw, 8rem);
  --spacing-block: clamp(2rem, 4vw, 4rem);

  /* --- Border Radius --- */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.25rem;
  --radius-full: 9999px;

  /* --- Shadows (Minimal, professional) --- */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.03);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05);
  --shadow-card: 0 1px 3px rgb(0 0 0 / 0.04), 0 1px 2px rgb(0 0 0 / 0.06);

  /* --- Max Widths --- */
  --max-w-prose: 65ch;
  --max-w-content: 72rem;     /* 1152px */
  --max-w-wide: 80rem;        /* 1280px */
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #0A0A0A;
    --color-surface: #171717;
    --color-surface-elevated: #1C1C1C;
    --color-text-primary: #FAFAFA;
    --color-text-secondary: #A3A3A3;
    --color-text-muted: #737373;
    --color-border: #262626;
    --color-border-subtle: #1C1C1C;
    --color-accent: #4ADE80;
    --color-accent-hover: #86EFAC;
    --color-accent-light: #14532D;
    --color-accent-dark: #DCFCE7;
    --color-secondary: #FAFAFA;
    --color-secondary-hover: #E5E5E5;
  }
}
```

### 6.3 Typography

| Rol | Font | Weight | Tamaño (fluido) |
|-----|------|--------|-----------------|
| **Display (Hero H1)** | Newsreader (serif) | 600 | `clamp(2.5rem, 5vw, 4.5rem)` |
| **Headings (H1-H3)** | Inter (sans) | 700 | `clamp(1.75rem, 3vw, 2.5rem)` descendiendo |
| **Body** | Inter (sans) | 400 | `1rem / 1.125rem` (16-18px) |
| **Article Body** | Newsreader (serif) | 400 | `1.125rem` (18px), line-height 1.8 |
| **UI / Labels** | Inter (sans) | 500 | `0.875rem` (14px) |
| **Code** | JetBrains Mono | 400 | `0.875rem` |
| **Calculator inputs** | Inter (sans) | 500 | `1rem` tabular-nums |

### 6.4 Layout Patterns

```
Max content width:  1152px (72rem)   → general pages
Prose width:        65ch             → article body
Wide sections:      1280px (80rem)   → hero, featured, tools
Full bleed:         100vw            → hero backgrounds
Calculator width:   640px (40rem)    → tool pages, centered
```

---

## 7. Component Specifications

### 7.1 Header / Navigation

```
┌─────────────────────────────────────────────────────────────┐
│  📊 BTC: $68,420  ·  ETH: $3,891  ·  S&P: 5,892  ·  ...   │  ← ExchangeRateTicker (optional, toggleable)
├─────────────────────────────────────────────────────────────┤
│  [Logo]     Trading  Economics  Finance  Business  Tools [🔍]│
└─────────────────────────────────────────────────────────────┘
```

- **Ticker:** React island (`client:idle`), fetches rates from free API (optional, can be toggled on/off)
- **Nav:** Sticky con backdrop-blur, shrinks on scroll (64px → 48px)
- **Mobile:** Hamburger → fullscreen overlay slide-in
- **Search:** `Cmd/Ctrl+K` shortcut, modal con Pagefind
- **Active state:** Underline animada bajo link activo

### 7.2 Hero Section (Homepage)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│     Simplified Economics                                     │
│     Starts Here.                                             │
│                                                              │
│     Where Money, Business & Economics Connect.               │
│     Your friendly guide to financial literacy.               │
│                                                              │
│     [Explore Articles ↓]    [Try Our Tools →]                │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐│
│  │📈Trading│ │🏛Econom.│ │💰Finance│ │🏢Busine.│ │🔧Tools││
│  │ Learn to│ │ Micro & │ │ Budget, │ │ Start & │ │ Calcs ││
│  │ trade   │ │ macro   │ │ invest  │ │ grow    │ │ & more││
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └───────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

- **Título:** Serif display font, dramático
- **Pillar cards:** Cada una con icono, título, descripción corta, color de categoría como accent
- **CTAs funcionales:** Cada card navega a su sección real
- **Background:** Sutil gradient o grain texture
- **NO:** Slider/carousel (anti-pattern de performance)

### 7.3 Post Card

```
┌──────────────────────────────┐
│  ┌──────────────────────┐    │
│  │     [Cover Image]    │    │
│  │     aspect-[3/2]     │    │
│  └──────────────────────┘    │
│  Trading                     │  ← CategoryBadge con color
│                              │
│  Article Title Goes Here     │  ← H3, font-semibold
│  in Two Lines Maximum        │
│                              │
│  Brief excerpt text that     │  ← text-secondary, line-clamp-2
│  gives a preview...          │
│                              │
│  [Avatar] Tasmin · Jan 2026  │
│                · 5 min read  │
└──────────────────────────────┘
```

- **Variantes:** `default` (vertical), `compact` (horizontal), `featured` (full-width hero style)
- **Hover:** Image scale 1.02, card subtle lift
- **Image:** Astro `<Image>`, lazy, AVIF/WebP, responsive srcset

### 7.4 Article Page Layout

```
┌──────────────────────────────────────────────────┐
│  Home > Economics > Article Title                 │  ← Breadcrumbs (schema markup)
│                                                   │
│  Economics                                        │  ← Category badge
│                                                   │
│  The Cleanliness ROI:                             │  ← H1 display serif
│  Vancouver's Top Pixel Cleaners                   │
│                                                   │
│  Brief meta description subtitle                  │
│                                                   │
│  [Avatar] Tasmin Angelina · Jan 9, 2026           │
│           5 min read                              │
│                                                   │
│  ┌────────────────────────────────────────┐       │
│  │         [Featured Image 16:9]          │       │
│  └────────────────────────────────────────┘       │
│                                                   │
│  ┌─ On this page ────────────────────────┐        │
│  │  1. The "Broken Window" Theory        │        │  ← Auto-generated TOC
│  │  2. Buying Back Your Opportunity      │        │
│  └───────────────────────────────────────┘        │
│                                                   │
│  [Article body — serif, 65ch, line-height 1.8]    │
│                                                   │
│  ┌─ 📥 Free Download ───────────────────┐         │  ← LeadMagnetCTA (if defined in frontmatter)
│  │  Get our Economics Cheat Sheet        │         │
│  │  [Download PDF →]                     │         │
│  └───────────────────────────────────────┘         │
│                                                   │
│  ⚠️ Affiliate Disclosure (if applicable)          │
│                                                   │
│  Tags: #gold #investment #etf                     │
│  Share: [Copy] [X] [Facebook] [LinkedIn]          │
│                                                   │
│  ┌── About the Author ──────────────────┐         │
│  │  [Photo]  Tasmin Angelina Houssein    │         │
│  │           Founder & Creator           │         │
│  │           "That one student who..."   │         │
│  └───────────────────────────────────────┘         │
│                                                   │
│  ── You might also like (3 cards) ──              │
└──────────────────────────────────────────────────┘
```

### 7.5 Tool/Calculator Page

```
┌──────────────────────────────────────────────────┐
│  Tools > Compound Interest Calculator             │
│                                                   │
│  Compound Interest Calculator                     │  ← H1
│  See how your money grows over time.              │
│                                                   │
│  ┌────────────────────────────────────────┐       │
│  │  Initial Investment  [£ 10,000      ]  │       │
│  │  Annual Rate         [   7          %] │       │
│  │  Time Period         [  10      years] │       │
│  │  Compound Frequency  [Monthly      ▾]  │       │
│  │                                        │       │
│  │  [Calculate]                           │       │
│  │                                        │       │
│  │  ┌── Results ───────────────────────┐  │       │
│  │  │  Final Amount:     £19,671.51    │  │       │
│  │  │  Total Interest:    £9,671.51    │  │       │
│  │  │  Total Deposits:   £10,000.00    │  │       │
│  │  └──────────────────────────────────┘  │       │
│  │                                        │       │
│  │  [============ Chart ==============]   │       │  ← Recharts line/bar chart
│  │  [  Growth over time visualization ]   │       │
│  │                                        │       │
│  └────────────────────────────────────────┘       │
│                                                   │
│  ── How Compound Interest Works (prose) ──        │  ← SEO content below tool
│  ── Related Articles (3 cards) ──                 │
└──────────────────────────────────────────────────┘
```

- **Cada tool page tiene:** Calculator React island (`client:visible`) + SEO prose content debajo
- **Calculator logic:** Pure functions en `src/lib/finance/`, testeables con Vitest
- **Inputs:** Números formateados con `tabular-nums`, validación con Zod
- **Charts:** Recharts para visualizaciones, lazy loaded
- **Schema markup:** `SoftwareApplication` para que Google muestre rich snippets
- **Internal linking:** Related posts al fondo, links a otros tools

### 7.6 Newsletter Form

```
┌──────────────────────────────────────────────────┐
│                                                   │
│  Stay curious. 💡                                 │
│  Get weekly econ & finance tips                   │
│  straight to your inbox.                          │
│                                                   │
│  ┌────────────────────────┐ ┌──────────────┐     │
│  │  your@email.com        │ │  Subscribe   │     │
│  └────────────────────────┘ └──────────────┘     │
│                                                   │
│  No spam, ever. Unsubscribe anytime.              │
│                                                   │
└──────────────────────────────────────────────────┘
```

- React island (`client:visible`)
- Endpoint: `/api/subscribe.ts` → Resend API
- Validación: Zod client + server
- Aparece en: homepage, footer de artículos, about page

### 7.7 Footer

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  [Logo]                                                      │
│  Where Money, Business & Economics Connect                    │
│                                                              │
│  Explore           Categories        Tools            Legal  │
│  Home              Trading           Profit/Loss      Privacy│
│  About             Economics         Position Size    Terms  │
│  Contact           Finance           Inflation Calc          │
│  Blog              Business          Compound Int.           │
│                    Banking           ROI Calculator           │
│                    Education                                  │
│                                                              │
│  ──────────────────────────────────────────────              │
│  © 2026 Econopedia 101. All rights reserved.                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. Monetization Architecture

### 8.1 Ad Placements (Mediavine-ready)

Definir slots semánticos en los layouts para cuando Mediavine se active:

```astro
<!-- PostLayout.astro -->
<div id="ad-slot-top" class="my-8" data-ad="leaderboard" />    <!-- Above article -->
<article class="prose">
  <!-- Article content -->
  <div id="ad-slot-mid" class="my-8" data-ad="rectangle" />    <!-- Mid-article -->
</article>
<div id="ad-slot-bottom" class="my-8" data-ad="leaderboard" /> <!-- Below article -->

<!-- ToolLayout.astro -->
<div id="ad-slot-tool-sidebar" data-ad="sidebar" />            <!-- Beside calculator -->
```

- Los slots existen pero están vacíos hasta que Mediavine se integre
- No afectan el layout ni performance cuando están vacíos
- Mediavine requiere ~50,000 sessions/month para aplicar

### 8.2 Affiliate Links

- Posts con `affiliateDisclosure: true` en frontmatter muestran disclosure automático
- Links de afiliados se marcan con `rel="sponsored nofollow"` automáticamente
- Tracking via UTM parameters

### 8.3 Lead Magnets

- PDFs descargables en `public/lead-magnets/`
- `LeadMagnetCTA.astro` aparece dentro de artículos cuando `leadMagnet` está definido en frontmatter
- Opcionalmente gated tras email signup (fase posterior)

### 8.4 Newsletter Monetization

- Email list via Resend
- Copy semanal: "Get Weekly Econ & Finance Tips — Straight to Your Inbox."
- CTAs en: footer de artículos, sidebar, homepage, about page
- Potencial para sponsored newsletter content en el futuro

---

## 9. SEO Specifications

### 9.1 Technical SEO (todos los requerimientos del project breakdown original)

| Requisito | Implementación |
|-----------|---------------|
| XML Sitemap | `@astrojs/sitemap` → auto-generated, submitted a Google Search Console + Bing |
| HTML Sitemap | `/sitemap-html.astro` → user-friendly page con todos los links |
| robots.txt | `public/robots.txt` con referencia a sitemap |
| HTTPS | Enforced por Cloudflare (automatic SSL, free) |
| Mobile-Friendly | Mobile-first responsive design, tested con Google Mobile-Friendly Test |
| Breadcrumbs | `Breadcrumbs.astro` con `BreadcrumbList` JSON-LD schema |
| Canonical Tags | En `SEOHead.astro`, configurable por página |
| Page Speed | Astro SSG + Cloudflare CDN (300+ PoPs) + image optimization → target <1s FCP |
| Image Optimization | Astro Image: AVIF/WebP, responsive srcset, lazy loading nativo |
| Minification | Astro build minifica HTML, Tailwind purga CSS, Cloudflare auto-minify + Brotli compression |
| CDN | Cloudflare global network (300+ PoPs, fastest CDN worldwide, unlimited bandwidth) |
| Schema Markup | JSON-LD en cada página: WebSite, Article, BreadcrumbList, Person, SoftwareApplication |
| Rich Snippets | FAQ schema en artículos educativos, Calculator schema en tools |
| Header Tags | Semantic H1-H6 enforced por content schema y componentes |
| 404 Page | Custom `/404.astro` con search + links a contenido popular |
| Internal Linking | Cross-links entre glossary, tools, y blog content (relatedPosts en schema) |

### 9.2 Meta Tags Template

```html
<title>{page.title} | Econopedia101</title>
<meta name="description" content="{page.description}" />
<link rel="canonical" href="{fullUrl}" />

<!-- Open Graph -->
<meta property="og:title" content="{page.title}" />
<meta property="og:description" content="{page.description}" />
<meta property="og:image" content="{ogImage}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Econopedia101" />
<meta property="og:url" content="{fullUrl}" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />

<!-- Article specific -->
<meta property="article:published_time" content="{publishedAt}" />
<meta property="article:modified_time" content="{updatedAt}" />
<meta property="article:author" content="{author.name}" />
<meta property="article:section" content="{categories[0]}" />
<meta property="article:tag" content="{tags.join(',')}" />
```

### 9.3 JSON-LD Schemas

```typescript
// src/lib/seo.ts — Schema builder functions

// WebSite (homepage)
function websiteSchema() → WebSite + SearchAction (Pagefind)

// Article (blog posts)
function articleSchema(post) → Article + author + datePublished + image

// BreadcrumbList (all pages)
function breadcrumbSchema(items) → BreadcrumbList

// Person (author pages)
function personSchema(author) → Person

// Organization (site-wide)
function organizationSchema() → Organization + logo

// SoftwareApplication (tool pages)
function toolSchema(tool) → SoftwareApplication

// FAQPage (educational articles with Q&A format)
function faqSchema(questions) → FAQPage
```

### 9.4 SEO Content Strategy

- **Long-tail keywords:** Focus en low-competition, informational (Vol: 100+)
- **Question-based titles:** "What is a budget deficit?", "How to start trading forex?"
- **Internal linking matrix:** Cada artículo linkeado a herramientas relevantes y viceversa
- **Google Helpful Content Update alignment:** Contenido útil primero, monetización después

### 9.5 Analytics Integration

**Dual analytics strategy:** Cloudflare para métricas de tráfico, Microsoft Clarity para comportamiento de usuario. Ambos son gratuitos, sin límites de tráfico, y con impacto mínimo en performance.

#### Cloudflare Web Analytics
- Activar desde el dashboard de Cloudflare (zero-config para Cloudflare Pages)
- No requiere script en el cliente (se inyecta a nivel de edge)
- No usa cookies → zero banner GDPR requerido
- Métricas: pageviews, unique visitors, top pages, countries, Core Web Vitals

#### Microsoft Clarity
- Script async (~6KB gzipped), no bloquea render
- Integrar en `BaseLayout.astro` via `<script>` en `<head>`
- GDPR compliant, no usa cookies para tracking
- Project ID se configura como env variable `PUBLIC_CLARITY_ID`

```astro
<!-- src/layouts/BaseLayout.astro — dentro de <head> -->
{import.meta.env.PROD && (
  <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", import.meta.env.PUBLIC_CLARITY_ID);
  </script>
)}
```

**Lo que Clarity trackea (relevante para monetización):**

| Dato | Uso para Econopedia101 |
|------|------------------------|
| **Heatmaps** | Ver qué secciones del artículo reciben más atención, optimizar placement de CTAs |
| **Scroll depth** | Medir si los lectores llegan al newsletter CTA y lead magnets dentro de artículos |
| **Session recordings** | Ver cómo interactúan con las calculadoras, identificar UX friction |
| **Rage clicks** | Detectar elementos que parecen clickeables pero no lo son (UX bugs) |
| **Dead clicks** | Encontrar links rotos o CTAs que no responden |
| **Referrers + pages** | Entender qué keywords de Google llevan a qué páginas (complementa Cloudflare) |
| **Device/browser split** | Optimizar responsive design según el tráfico real |

**Configuración recomendada en Clarity dashboard:**
- Activar "Smart Events" para detectar automáticamente form submissions (newsletter signups)
- Crear custom tags para: `calculator-used`, `lead-magnet-clicked`, `affiliate-link-clicked`
- Filtrar recordings por páginas de herramientas (`/tools/*`) para optimizar UX de calculadoras
- Masking automático activado para inputs de email (privacy)

---

## 10. Performance Requirements

### Lighthouse Targets

| Métrica | Target |
|---------|--------|
| Performance | ≥ 95 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 95 |
| SEO | ≥ 95 |
| FCP | < 1.0s |
| LCP | < 1.5s |
| CLS | < 0.05 |
| TBT | < 100ms |

### Performance Strategies

1. **Zero JS default:** Astro SSG, solo React islands donde hay interactividad real
2. **Image optimization:** AVIF > WebP > JPEG, responsive srcset, lazy loading nativo
3. **Font optimization:** Self-hosted Fontsource, `font-display: swap`, preload critical subset
4. **CSS:** Tailwind 4 tree-shakes automáticamente, zero unused CSS
5. **Prefetch:** Links visibles en viewport se pre-fetchean para navegación instantánea
6. **View Transitions:** Astro built-in, smooth page transitions sin SPA overhead
7. **Calculator islands:** `client:visible` para que solo carguen cuando entran en viewport
8. **Pagefind:** Índice estático, descargado solo cuando el usuario abre search
9. **CDN:** Cloudflare global network, assets cacheados en 300+ edge locations worldwide
10. **Browser caching:** Headers configurados en `_headers` para assets estáticos + Cloudflare cache rules

---

## 11. Accessibility Requirements

- WCAG 2.1 AA compliant
- Skip-to-content link
- Full keyboard navigation (Tab order, focus indicators, Escape para modals)
- ARIA labels en calculadoras y elementos interactivos
- Color contrast ≥ 4.5:1 (text), ≥ 3:1 (large text/UI)
- `@media (prefers-reduced-motion: reduce)` desactiva todas las animaciones
- Alt text obligatorio (enforced por Zod schema `coverAlt`)
- Semantic HTML: `<article>`, `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>`, `<section>`
- Focus-visible styling prominente (green ring)
- Screen reader friendly heading hierarchy
- Calculator inputs con labels asociados y `aria-live` para resultados

---

## 12. URL Structure & Redirects

### New URL Map

```
/                              → Homepage
/trading                       → Trading section landing
/economics                     → Economics 101 landing
/finance                       → Finance 101 landing
/business                      → Business landing
/banking                       → Banking & Insurance landing
/education                     → Education & Resources landing
/blog                          → All articles (paginated)
/blog/[slug]                   → Article detail
/category/[category]           → Category archive
/author/[author-slug]          → Author profile
/tools                         → Tools hub
/tools/profit-loss-calculator  → Individual tool pages
/tools/compound-interest-calculator
/tools/inflation-calculator
/tools/position-size-calculator
/tools/leverage-calculator
/tools/roi-calculator
/tools/supply-demand-graph
/quiz                          → Quiz section
/about                         → About + team
/contact                       → Contact form
/privacy                       → Privacy policy
/sitemap-html                  → HTML sitemap
/rss.xml                       → RSS feed
```

### WordPress → New Redirects (public/_redirects)

```
# Cloudflare Pages _redirects file
# Format: /old-path /new-path STATUS_CODE

# Section landings
/economics-101/                                                     /economics                301
/finance-101/                                                       /finance                  301
/about-us/                                                          /about                    301
/contacts/                                                          /contact                  301

# Categories
/category/business/                                                 /category/business        301
/category/economics-archives/                                       /category/economics       301
/category/education/                                                /category/education       301
/category/tools-and-reviews/                                        /category/tools-and-reviews 301
/category/quiz/                                                     /quiz                     301

# Authors
/author/econoangelina/                                              /author/tasmin-angelina-houssein 301

# Legal
/privacy-policy-your-privacy-matters/                               /privacy                  301

# Articles (WP root-level slugs → /blog/ prefix)
/cleanliness-roi-outsourcing-vancouver-businesses/                  /blog/cleanliness-roi-outsourcing-vancouver-businesses 301
/why-high-maintenance-beauty-is-a-low-yield-asset/                  /blog/why-high-maintenance-beauty-is-a-low-yield-asset 301
/the-growth-strategy-of-climate-custom-deck/                        /blog/the-growth-strategy-of-climate-custom-deck 301
/economic-model-behind-eula-aesthetics-success/                     /blog/economic-model-behind-eula-aesthetics-success 301
/economics-education-with-story-boards-ai/                          /blog/economics-education-with-story-boards-ai 301
/how-to-value-and-compare-gold-equities/                            /blog/how-to-value-and-compare-gold-equities 301
/gold-etf-vs-physical-gold-returns-2/                               /blog/gold-etf-vs-physical-gold-returns 301
/how-to-build-a-gold-allocation-for-portfolio-diversification/      /blog/how-to-build-a-gold-allocation-for-portfolio-diversification 301
/why-is-gold-more-valuable-than-silver/                             /blog/why-is-gold-more-valuable-than-silver 301

# Kill WordPress legacy paths
/wp-admin/*        /404  302
/wp-content/*      /404  302
/wp-login.php      /404  302
/wp-json/*         /404  302
```

### Custom Headers (public/_headers)

```
# Cloudflare Pages _headers file

# Global security headers
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

# Cache static assets aggressively (fonts, images, CSS, JS)
/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=2592000
```

---

## 13. Astro Configuration

```typescript
// astro.config.ts
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: 'https://econopedia101.com',
  output: 'hybrid',   // Static by default, server only for API routes (newsletter, contact)
  adapter: cloudflare({
    platformProxy: { enabled: true },  // Local dev with Wrangler bindings
    imageService: 'passthrough',        // Use Astro Sharp at build, Cloudflare serves optimized
  }),
  integrations: [
    react(),
    tailwind(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
    pagefind(),
  ],
  image: {
    domains: ['econopedia101.com'],
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  markdown: {
    shikiConfig: { theme: 'github-dark-default' },
  },
});
```

### Wrangler Configuration

```toml
# wrangler.toml
name = "econopedia101"
compatibility_date = "2025-01-01"
pages_build_output_dir = "./dist"

# KV namespace for future use (rate limiting, caching, etc.)
# [[kv_namespaces]]
# binding = "CACHE"
# id = "xxxxx"

# Environment variables (set in Cloudflare dashboard, NOT here)
# RESEND_API_KEY — for newsletter/contact form
# PUBLIC_CLARITY_ID — Microsoft Clarity project ID (public, safe to expose)
```

---

## 14. Key Dependencies

```json
{
  "name": "econopedia101",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "wrangler pages dev ./dist",
    "deploy": "pnpm build && wrangler pages deploy ./dist",
    "check": "astro check && biome check .",
    "format": "biome format --write .",
    "lint": "biome lint --write .",
    "test": "vitest",
    "test:e2e": "playwright test",
    "migrate": "tsx scripts/migrate-wp-content.ts"
  },
  "dependencies": {
    "astro": "^5.x",
    "@astrojs/react": "^4.x",
    "@astrojs/tailwind": "^6.x",
    "@astrojs/mdx": "^4.x",
    "@astrojs/sitemap": "^4.x",
    "@astrojs/cloudflare": "^12.x",
    "@astrojs/rss": "^4.x",
    "astro-pagefind": "^1.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "@fontsource-variable/inter": "^5.x",
    "@fontsource-variable/newsreader": "^5.x",
    "@fontsource-variable/jetbrains-mono": "^5.x",
    "lucide-react": "latest",
    "motion": "latest",
    "recharts": "^2.x",
    "mathjs": "latest",
    "resend": "^4.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.x",
    "@tailwindcss/typography": "latest",
    "typescript": "^5.x",
    "vitest": "latest",
    "@playwright/test": "latest",
    "tsx": "latest",
    "wrangler": "^3.x"
  }
}
```

---

## 15. Implementation Milestones

### Phase 1: Foundation (Scaffolding + Design System)
- [ ] Init Astro 5 project con TypeScript strict
- [ ] Configurar Tailwind 4 + design tokens (green/black/white palette)
- [ ] Instalar y configurar fonts (Inter, Newsreader, JetBrains Mono) via Fontsource
- [ ] Crear componentes UI primitivos: `Button`, `Card`, `Badge`, `Container`, `Section`, `Input`
- [ ] Implementar `BaseLayout.astro` con SEOHead, fonts, meta, JSON-LD base
- [ ] Implementar `Header` + `Navigation` (desktop + mobile)
- [ ] Implementar `Footer` con columnas de links
- [ ] Configurar Biome + tsconfig strict
- [ ] Setup `_redirects` + `_headers` + `wrangler.toml` para Cloudflare Pages

### Phase 2: Content Architecture
- [ ] Definir Content Collections schema completo (posts + authors + tools)
- [ ] Crear author data file (Tasmin Angelina Houssein)
- [ ] Migrar al menos 3 artículos existentes como MDX de prueba
- [ ] Implementar `PostLayout.astro` con prose styling serif
- [ ] Implementar `PostCard` (default, compact, featured variants)
- [ ] Crear `/blog/[slug].astro` dinámico con breadcrumbs, TOC, share, author bio
- [ ] Crear `/blog/index.astro` con paginación
- [ ] Implementar `CategoryBadge` con colores por categoría

### Phase 3: Pages
- [ ] Homepage completa (hero + pillars + featured + recent + quote + newsletter)
- [ ] Trading landing page
- [ ] Economics 101 landing page
- [ ] Finance 101 landing page
- [ ] Business landing page
- [ ] Banking & Insurance landing page
- [ ] Education landing page
- [ ] Category archive pages dinámicas
- [ ] About page con team section y estadísticas
- [ ] Contact page con server action (Resend)
- [ ] Author profile page
- [ ] Privacy policy page
- [ ] HTML sitemap page
- [ ] Custom 404 page con search

### Phase 4: Interactive Tools (Calculators)
- [ ] Crear `CalculatorShell.tsx` (shared layout)
- [ ] Crear `NumberInput.tsx`, `ResultDisplay.tsx`, `ChartDisplay.tsx` (shared components)
- [ ] Implementar pure function logic en `src/lib/finance/` con unit tests:
  - [ ] `compound-interest.ts` + tests
  - [ ] `profit-loss.ts` + tests
  - [ ] `position-size.ts` + tests
  - [ ] `inflation.ts` + tests
  - [ ] `leverage.ts` + tests
  - [ ] `roi.ts` + tests
  - [ ] `supply-demand.ts` + tests
- [ ] Construir cada calculator como React island:
  - [ ] Compound Interest Calculator
  - [ ] Profit & Loss Calculator
  - [ ] Position Size Calculator
  - [ ] Inflation Calculator
  - [ ] Leverage Calculator
  - [ ] ROI Calculator
  - [ ] Supply & Demand Graph Generator
- [ ] Crear `/tools/index.astro` (tools hub)
- [ ] Crear cada tool page con calculator + SEO content + related posts

### Phase 5: Interactivity & Polish
- [ ] Search modal con Pagefind (`Cmd/Ctrl+K`)
- [ ] Newsletter form (React island + `/api/subscribe.ts` → Resend)
- [ ] Reading progress bar
- [ ] Share buttons (Copy, X, Facebook, LinkedIn)
- [ ] Table of Contents auto-generated
- [ ] View Transitions (Astro built-in)
- [ ] Dark mode toggle (respects `prefers-color-scheme` + manual toggle)
- [ ] Scroll animations (Motion, subtiles)
- [ ] Lead Magnet CTAs en artículos
- [ ] Quiz widget (React island)
- [ ] Exchange rate ticker (optional, React island)

### Phase 6: SEO & Deploy
- [ ] JSON-LD structured data en todas las páginas
- [ ] Open Graph images (static default + per-article si hay cover)
- [ ] RSS feed (`/rss.xml`)
- [ ] XML Sitemap (auto via `@astrojs/sitemap`)
- [ ] HTML Sitemap (`/sitemap-html`)
- [ ] `robots.txt` con sitemap reference
- [ ] Affiliate disclosure component automático
- [ ] Ad slot placeholders (Mediavine-ready)
- [ ] Lighthouse audit + optimization pass (target 95+ all categories)
- [ ] Deploy a Cloudflare Pages (connect GitHub repo for auto-deploys)
- [ ] Activate Cloudflare Web Analytics from dashboard
- [ ] Setup Microsoft Clarity project + integrate script in BaseLayout (prod only)
- [ ] Configure Clarity: smart events, custom tags (calculator-used, lead-magnet-clicked, affiliate-link-clicked), email input masking
- [ ] Submit sitemap a Google Search Console + Bing Webmaster Tools
- [ ] Migrar todo el contenido restante de WordPress

---

## 16. Scope Out (NOT included)

- ❌ WooCommerce / Shop (no se usa)
- ❌ Login / Register system (innecesario por ahora)
- ❌ Multiple homepage layouts (1 sola, limpia)
- ❌ Instagram feed embed
- ❌ WordPress admin panel
- ❌ Comments system (considerar Giscus en futuro si se necesita)
- ❌ AxiomThemes popup ("Best Choice for Creatives")
- ❌ Legacy `?page_id=` WordPress routes
- ❌ TradingView affiliate bar (reemplazado por exchange rate ticker propio)

---

## 17. Notes for Claude Code

**Al ejecutar este PRD:**

1. **Empieza por Phase 1.** No saltes a contenido sin el design system sólido.
2. **TypeScript strict mode siempre.** No `any`, tipos explícitos everywhere.
3. **Astro components por defecto.** Solo React (`client:visible` o `client:idle`) cuando hay interactividad real (calculators, search, newsletter, quiz).
4. **Tailwind utilities directo.** No custom CSS classes salvo tokens globales y prose overrides.
5. **Mobile-first.** Diseña desde 320px y sube.
6. **Semantic HTML.** `<article>`, `<nav>`, `<main>`, `<section>`, `<aside>` siempre.
7. **Performance obsession.** Si no necesita JS en el cliente, no le metas JS.
8. **Calculator logic separada del UI.** Pure functions en `src/lib/finance/` testeables con Vitest. Los componentes React solo consumen esas funciones.
9. **Internal linking everywhere.** Los tools referencian artículos, los artículos referencian tools. Esto es CLAVE para SEO.
10. **La paleta es GREEN (finance) + BLACK (modern) + WHITE (clean).** No teal, no blue como acento principal. Green es el accent color.
11. **Contenido placeholder OK** para arrancar, pero usa la estructura real del sitio (títulos reales, categorías reales, slugs reales).
12. **Cada componente tipado.** Props interfaces con JSDoc donde ayude.
13. **Commits atómicos.** 1 componente o feature por commit idealmente.
14. **Monetization-ready desde día 1.** Ad slots vacíos, affiliate disclosure component, lead magnet CTA — todo listo para activar cuando haya tráfico.
