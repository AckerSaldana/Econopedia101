import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import type { Block } from '../../types/blocks';
import Quiz from '../quiz/Quiz';
import ChartDisplay from '../calculators/ChartDisplay';
import InArticleAd from './InArticleAd';

const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['strong', 'em', 'code', 'a'],
  ALLOWED_ATTR: ['href', 'style'],
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function renderInlineMarkdown(text: string): string {
  const html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="font-size:0.875em;padding:2px 6px;background:var(--color-surface);border:1px solid var(--color-border)">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:var(--color-accent);text-decoration:underline">$1</a>');
  return DOMPurify.sanitize(html, PURIFY_CONFIG);
}

function ParagraphRenderer({ content }: { content: string }) {
  return (
    <p
      style={{
        lineHeight: 1.75,
        color: 'var(--color-text-primary)',
        marginTop: '1.25rem',
        marginBottom: '1.25rem',
      }}
      dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(content) }}
    />
  );
}

function HeadingRenderer({ level, text }: { level: 2 | 3 | 4; text: string }) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const id = slugify(text);
  const sizes = { 2: '1.75rem', 3: '1.375rem', 4: '1.125rem' };
  const margins = { 2: '2.5rem', 3: '2rem', 4: '1.75rem' };
  return (
    <Tag
      id={id}
      style={{
        fontSize: sizes[level],
        fontWeight: 600,
        letterSpacing: '-0.01em',
        color: 'var(--color-text-primary)',
        marginTop: margins[level],
        marginBottom: '0.75rem',
        lineHeight: 1.3,
      }}
    >
      {text}
    </Tag>
  );
}

function BlockquoteRenderer({ content }: { content: string }) {
  return (
    <blockquote
      style={{
        borderLeft: '3px solid var(--color-accent)',
        paddingLeft: '1.25rem',
        marginLeft: 0,
        marginRight: 0,
        marginTop: '1.5rem',
        marginBottom: '1.5rem',
        fontStyle: 'italic',
        color: 'var(--color-text-secondary)',
        lineHeight: 1.7,
      }}
    >
      <p style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(content) }} />
    </blockquote>
  );
}

function BulletListRenderer({ items }: { items: string[] }) {
  return (
    <ul
      style={{
        marginTop: '1.25rem',
        marginBottom: '1.25rem',
        paddingLeft: '1.5rem',
        listStyleType: 'disc',
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            lineHeight: 1.75,
            color: 'var(--color-text-primary)',
            marginBottom: '0.5rem',
          }}
          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(item) }}
        />
      ))}
    </ul>
  );
}

function OrderedListRenderer({ items }: { items: string[] }) {
  return (
    <ol
      style={{
        marginTop: '1.25rem',
        marginBottom: '1.25rem',
        paddingLeft: '1.5rem',
        listStyleType: 'decimal',
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            lineHeight: 1.75,
            color: 'var(--color-text-primary)',
            marginBottom: '0.5rem',
          }}
          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(item) }}
        />
      ))}
    </ol>
  );
}

function CodeRenderer({ language, code }: { language: string; code: string }) {
  return (
    <pre
      style={{
        backgroundColor: 'var(--color-surface)',
        borderLeft: '3px solid var(--color-border)',
        padding: '1rem 1.25rem',
        marginTop: '1.5rem',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        fontSize: '0.875rem',
        lineHeight: 1.6,
      }}
    >
      <code className={language ? `language-${language}` : undefined}>{code}</code>
    </pre>
  );
}

function ImageRenderer({ url, alt, caption }: { url: string; alt: string; caption?: string }) {
  return (
    <figure style={{ marginTop: '2rem', marginBottom: '2rem', marginLeft: 0, marginRight: 0 }}>
      <img
        src={url}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
      {caption && (
        <figcaption
          style={{
            marginTop: '0.75rem',
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function DividerRenderer() {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: '1px solid var(--color-border)',
        marginTop: '2.5rem',
        marginBottom: '2.5rem',
        width: '60%',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    />
  );
}

function TableRenderer({ headers, rows }: { headers: string[]; rows: string[][] }) {
  const cellStyle: React.CSSProperties = {
    padding: '10px 14px',
    borderBottom: '1px solid var(--color-border)',
    fontSize: '0.9rem',
    textAlign: 'left',
    color: 'var(--color-text-primary)',
  };
  return (
    <div style={{ overflowX: 'auto', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  ...cellStyle,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-text-muted)',
                  backgroundColor: 'var(--color-surface)',
                  borderBottom: '2px solid var(--color-border)',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={cellStyle}
                  dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(cell) }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CalloutRenderer({ variant, content }: { variant: 'info' | 'warning' | 'tip'; content: string }) {
  const colors = {
    info: { bg: 'var(--color-accent-light)', border: 'var(--color-accent)', label: 'Info' },
    warning: { bg: '#FEF3C7', border: '#F59E0B', label: 'Warning' },
    tip: { bg: '#D1FAE5', border: '#10B981', label: 'Tip' },
  };
  const c = colors[variant];
  return (
    <div
      style={{
        backgroundColor: c.bg,
        borderLeft: `3px solid ${c.border}`,
        padding: '1rem 1.25rem',
        marginTop: '1.5rem',
        marginBottom: '1.5rem',
        lineHeight: 1.6,
      }}
    >
      <p
        style={{
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '0.375rem',
          marginTop: 0,
          color: c.border,
        }}
      >
        {c.label}
      </p>
      <p
        style={{ margin: 0, color: 'var(--color-text-primary)' }}
        dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(content) }}
      />
    </div>
  );
}

function FormulaRenderer({ latex }: { latex: string }) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    function tryRender() {
      const katex = (window as any).katex;
      if (katex) {
        setHtml(katex.renderToString(latex, { throwOnError: false, displayMode: true }));
        return true;
      }
      return false;
    }

    if (tryRender()) return;

    // KaTeX not loaded yet — poll until it's ready
    const interval = setInterval(() => {
      if (tryRender()) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, [latex]);

  const containerStyle: React.CSSProperties = {
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
    padding: '1.25rem',
    backgroundColor: 'var(--color-surface)',
  };

  if (html) {
    return <div style={containerStyle} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <div style={{ ...containerStyle, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
      {latex}
    </div>
  );
}

function renderBlock(block: Block) {
  switch (block.type) {
    case 'paragraph':
      return <ParagraphRenderer content={block.content} />;
    case 'heading':
      return <HeadingRenderer level={block.level} text={block.text} />;
    case 'blockquote':
      return <BlockquoteRenderer content={block.content} />;
    case 'bullet-list':
      return <BulletListRenderer items={block.items} />;
    case 'ordered-list':
      return <OrderedListRenderer items={block.items} />;
    case 'code':
      return <CodeRenderer language={block.language} code={block.code} />;
    case 'image':
      return <ImageRenderer url={block.url} alt={block.alt} caption={block.caption} />;
    case 'divider':
      return <DividerRenderer />;
    case 'table':
      return <TableRenderer headers={block.headers} rows={block.rows} />;
    case 'callout':
      return <CalloutRenderer variant={block.variant} content={block.content} />;
    case 'quiz':
      return <Quiz quizId={block.quizId} />;
    case 'chart':
      return <ChartDisplay {...block.chartConfig} />;
    case 'formula':
      return <FormulaRenderer latex={block.latex} />;
    default:
      return null;
  }
}

const AD_INTERVAL = 5; // Insert an ad every N content blocks
const MAX_IN_ARTICLE_ADS = 3; // Cap total in-article ads

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  let adCount = 0;

  return (
    <div>
      {blocks.map((block, i) => {
        const showAd =
          adCount < MAX_IN_ARTICLE_ADS &&
          i > 0 &&
          (i + 1) % AD_INTERVAL === 0;

        if (showAd) adCount++;

        return (
          <div key={block.id}>
            {renderBlock(block)}
            {showAd && <InArticleAd index={adCount} />}
          </div>
        );
      })}
    </div>
  );
}
