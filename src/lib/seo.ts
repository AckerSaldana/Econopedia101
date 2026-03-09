import { SITE, SOCIALS } from './constants';

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/favicon.svg`,
    sameAs: [SOCIALS.twitter, SOCIALS.instagram, SOCIALS.linkedin],
  };
}

export function articleSchema(post: {
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt?: Date;
  cover?: string;
  slug: string;
  author: { name: string };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt.toISOString(),
    ...(post.updatedAt && { dateModified: post.updatedAt.toISOString() }),
    ...(post.cover && { image: post.cover }),
    url: `${SITE.url}/blog/${post.slug}/`,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE.url}/favicon.svg`,
      },
    },
  };
}

export function personSchema(author: {
  name: string;
  role: string;
  bio: string;
  avatar?: string;
  socials?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    website?: string;
  };
}) {
  const sameAs = [
    author.socials?.twitter,
    author.socials?.linkedin,
    author.socials?.instagram,
    author.socials?.website,
  ].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    jobTitle: author.role,
    description: author.bio,
    ...(author.avatar && { image: author.avatar }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export function toolSchema(tool: {
  name: string;
  description: string;
  slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
    },
    url: `${SITE.url}/tools/${tool.slug}`,
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
