import { defineCollection, z, reference } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(160),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      author: reference('authors'),
      categories: z.array(
        z.enum([
          'trading',
          'economics',
          'finance',
          'business',
          'banking-insurance',
          'education',
          'tools-and-reviews',
          'quiz',
        ]),
      ),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      cover: image(),
      coverAlt: z.string(),
      draft: z.boolean().default(false),
      ogImage: image().optional(),
      canonicalUrl: z.string().url().optional(),
      leadMagnet: z
        .object({
          title: z.string(),
          description: z.string(),
          file: z.string(),
        })
        .optional(),
      affiliateDisclosure: z.boolean().default(false),
    }),
});

const authors = defineCollection({
  type: 'data',
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      slug: z.string(),
      role: z.string(),
      bio: z.string(),
      shortBio: z.string().max(100),
      avatar: image(),
      socials: z
        .object({
          twitter: z.string().url().optional(),
          linkedin: z.string().url().optional(),
          instagram: z.string().url().optional(),
          website: z.string().url().optional(),
        })
        .optional(),
    }),
});

const tools = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string().max(160),
    longDescription: z.string(),
    icon: z.string(),
    category: z.enum(['trading', 'finance', 'economics']),
    keywords: z.array(z.string()),
    relatedPosts: z.array(z.string()).default([]),
  }),
});

export const collections = { posts, authors, tools };
