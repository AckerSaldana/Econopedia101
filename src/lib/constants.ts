export const SITE = {
  name: 'Econopedia 101',
  title: 'Econopedia 101 — Where Money, Business & Economics Connect',
  description: 'Your friendly guide to financial literacy. Simplified economics, trading guides, finance tips, and interactive tools for students and professionals.',
  url: 'https://econopedia101.com',
  tagline: 'Where Money, Business & Economics Connect',
  author: 'Tasmin Angelina Houssein',
  locale: 'en-GB',
  lang: 'en',
} as const;

export const SOCIALS = {
  twitter: 'https://twitter.com/econopedia101',
  instagram: 'https://instagram.com/econopedia101',
  linkedin: 'https://linkedin.com/company/econopedia101',
} as const;

export const NAV_ITEMS = [
  { label: 'Trading', href: '/trading' },
  { label: 'Economics', href: '/economics' },
  { label: 'Finance', href: '/finance' },
  { label: 'Business', href: '/business' },
  { label: 'Banking', href: '/banking' },
  { label: 'Education', href: '/education' },
  { label: 'Tools', href: '/tools' },
] as const;

export const CATEGORIES = {
  trading: { label: 'Trading', color: '#7C3AED', slug: 'trading', description: 'Forex, crypto, stocks, derivatives — learn to trade with confidence.' },
  economics: { label: 'Economics', color: '#2563EB', slug: 'economics', description: 'Micro & macro concepts simplified for students and curious minds.' },
  finance: { label: 'Finance', color: '#19155C', slug: 'finance', description: 'Budgeting, investing, personal finance — manage your money smarter.' },
  business: { label: 'Business', color: '#EA580C', slug: 'business', description: 'Entrepreneurship, strategy, and financial management for startups.' },
  'banking-insurance': { label: 'Banking & Insurance', color: '#0891B2', slug: 'banking', description: 'Banking systems, insurance, and the financial sector explained.' },
  education: { label: 'Education', color: '#D946EF', slug: 'education', description: 'GCSE & A-Level resources, study guides, and concept explainers.' },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export const FOOTER_LINKS = {
  explore: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '/blog' },
  ],
  categories: [
    { label: 'Trading', href: '/trading' },
    { label: 'Economics', href: '/economics' },
    { label: 'Finance', href: '/finance' },
    { label: 'Business', href: '/business' },
    { label: 'Banking', href: '/banking' },
    { label: 'Education', href: '/education' },
  ],
  tools: [
    { label: 'Profit & Loss', href: '/tools/profit-loss-calculator' },
    { label: 'Compound Interest', href: '/tools/compound-interest-calculator' },
    { label: 'ROI Calculator', href: '/tools/roi-calculator' },
    { label: 'Inflation Calculator', href: '/tools/inflation-calculator' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Sitemap', href: '/sitemap-html' },
  ],
} as const;
