export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    trading: '#7C3AED',
    economics: '#2563EB',
    finance: '#19155C',
    business: '#EA580C',
    'banking-insurance': '#0891B2',
    education: '#D946EF',
  };
  return colors[category] || '#19155C';
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    trading: 'Trading',
    economics: 'Economics',
    finance: 'Finance',
    business: 'Business',
    'banking-insurance': 'Banking & Insurance',
    education: 'Education',
    'tools-and-reviews': 'Tools & Reviews',
    quiz: 'Quiz',
  };
  return labels[category] || category;
}
