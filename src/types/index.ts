export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  website?: string;
}

export interface SEOProps {
  title: string;
  description: string;
  image?: string;
  canonicalUrl?: string;
  type?: 'website' | 'article';
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export type Category = 'trading' | 'economics' | 'finance' | 'business' | 'banking-insurance' | 'education' | 'tools-and-reviews' | 'quiz';
