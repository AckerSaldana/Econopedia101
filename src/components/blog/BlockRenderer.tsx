import type { Block } from '../../types/blocks';
import Quiz from '../quiz/Quiz';
import ChartDisplay from '../calculators/ChartDisplay';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function renderInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-accent underline">$1</a>');
}

function InlineHTML({ html }: { html: string }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function ParagraphRenderer({ content }: { content: string }) {
  return <p dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(content) }} />;
}

function HeadingRenderer({ level, text }: { level: 2 | 3 | 4; text: string }) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const id = slugify(text);
  return <Tag id={id}>{text}</Tag>;
}

function BlockquoteRenderer({ content }: { content: string }) {
  return (
    <blockquote>
      <p dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(content) }} />
    </blockquote>
  );
}

function BulletListRenderer({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i} dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(item) }} />
      ))}
    </ul>
  );
}

function OrderedListRenderer({ items }: { items: string[] }) {
  return (
    <ol>
      {items.map((item, i) => (
        <li key={i} dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(item) }} />
      ))}
    </ol>
  );
}

function CodeRenderer({ language, code }: { language: string; code: string }) {
  return (
    <pre>
      <code className={language ? `language-${language}` : undefined}>{code}</code>
    </pre>
  );
}

function ImageRenderer({ url, alt, caption }: { url: string; alt: string; caption?: string }) {
  return (
    <figure>
      <img src={url} alt={alt} loading="lazy" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

function TableRenderer({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <table>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(cell) }} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
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
      }}
    >
      <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem', color: c.border }}>
        {c.label}
      </p>
      <p
        style={{ margin: 0 }}
        dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(content) }}
      />
    </div>
  );
}

function FormulaRenderer({ latex }: { latex: string }) {
  // KaTeX will be loaded client-side if available
  try {
    const katex = (window as any).katex;
    if (katex) {
      const html = katex.renderToString(latex, { throwOnError: false, displayMode: true });
      return <div className="my-4 text-center" dangerouslySetInnerHTML={{ __html: html }} />;
    }
  } catch {}
  return (
    <div className="my-4 text-center font-mono text-sm p-4" style={{ backgroundColor: 'var(--color-surface)' }}>
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
      return <hr />;
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

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose">
      {blocks.map((block) => (
        <div key={block.id}>{renderBlock(block)}</div>
      ))}
    </div>
  );
}
