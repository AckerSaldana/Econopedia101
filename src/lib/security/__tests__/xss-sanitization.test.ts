import { describe, it, expect } from 'vitest';
import DOMPurify from 'dompurify';

const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['strong', 'em', 'code', 'a'],
  ALLOWED_ATTR: ['href', 'style'],
};

function renderInlineMarkdown(text: string): string {
  const html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(
      /`(.+?)`/g,
      '<code style="font-size:0.875em;padding:2px 6px;background:var(--color-surface);border:1px solid var(--color-border)">$1</code>',
    )
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      '<a href="$2" style="color:var(--color-accent);text-decoration:underline">$1</a>',
    );
  return DOMPurify.sanitize(html, PURIFY_CONFIG);
}

describe('XSS Sanitization — renderInlineMarkdown', () => {
  it('preserves safe markdown: bold', () => {
    const result = renderInlineMarkdown('This is **bold** text');
    expect(result).toContain('<strong>bold</strong>');
  });

  it('preserves safe markdown: italic', () => {
    const result = renderInlineMarkdown('This is *italic* text');
    expect(result).toContain('<em>italic</em>');
  });

  it('preserves safe markdown: inline code', () => {
    const result = renderInlineMarkdown('Use `console.log`');
    expect(result).toContain('<code');
    expect(result).toContain('console.log');
  });

  it('preserves safe markdown: links', () => {
    const result = renderInlineMarkdown('[click](https://example.com)');
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('click');
  });

  it('strips <script> tags', () => {
    const result = renderInlineMarkdown('Hello <script>alert("xss")</script> world');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
  });

  it('strips <img onerror> XSS', () => {
    const result = renderInlineMarkdown('<img src=x onerror=alert(1)>');
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('<img');
  });

  it('strips javascript: protocol in links', () => {
    const result = renderInlineMarkdown('[click](javascript:alert(1))');
    expect(result).not.toContain('javascript:');
  });

  it('strips <iframe> tags', () => {
    const result = renderInlineMarkdown('<iframe src="https://evil.com"></iframe>');
    expect(result).not.toContain('<iframe');
  });

  it('strips event handlers on allowed tags', () => {
    const result = renderInlineMarkdown('<strong onmouseover="alert(1)">text</strong>');
    expect(result).not.toContain('onmouseover');
    expect(result).toContain('<strong>text</strong>');
  });

  it('strips <svg onload> XSS', () => {
    const result = renderInlineMarkdown('<svg onload=alert(1)>');
    expect(result).not.toContain('<svg');
    expect(result).not.toContain('onload');
  });

  it('strips nested script injection via markdown link', () => {
    const result = renderInlineMarkdown('["><script>alert(1)</script>](https://example.com)');
    expect(result).not.toContain('<script');
  });

  it('strips data: protocol in links', () => {
    const result = renderInlineMarkdown('[click](data:text/html,<script>alert(1)</script>)');
    expect(result).not.toContain('data:text/html');
  });

  it('handles empty input', () => {
    const result = renderInlineMarkdown('');
    expect(result).toBe('');
  });

  it('handles plain text without markup', () => {
    const result = renderInlineMarkdown('Just plain text');
    expect(result).toBe('Just plain text');
  });
});

describe('XSS Sanitization — Search excerpt (mark-only)', () => {
  const SEARCH_CONFIG = { ALLOWED_TAGS: ['mark'] };

  it('preserves <mark> tags from Pagefind', () => {
    const html = 'This is a <mark>search result</mark> excerpt';
    const result = DOMPurify.sanitize(html, SEARCH_CONFIG);
    expect(result).toContain('<mark>search result</mark>');
  });

  it('strips <script> from search results', () => {
    const html = 'Result <script>alert("xss")</script> text';
    const result = DOMPurify.sanitize(html, SEARCH_CONFIG);
    expect(result).not.toContain('<script');
  });

  it('strips all tags except <mark>', () => {
    const html = '<b>bold</b> <mark>highlighted</mark> <a href="x">link</a>';
    const result = DOMPurify.sanitize(html, SEARCH_CONFIG);
    expect(result).toContain('<mark>highlighted</mark>');
    expect(result).not.toContain('<b>');
    expect(result).not.toContain('<a');
  });
});
