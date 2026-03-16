export interface ParagraphBlock {
  id: string;
  type: 'paragraph';
  content: string;
}

export interface HeadingBlock {
  id: string;
  type: 'heading';
  level: 2 | 3 | 4;
  text: string;
}

export interface BlockquoteBlock {
  id: string;
  type: 'blockquote';
  content: string;
}

export interface BulletListBlock {
  id: string;
  type: 'bullet-list';
  items: string[];
}

export interface OrderedListBlock {
  id: string;
  type: 'ordered-list';
  items: string[];
}

export interface CodeBlock {
  id: string;
  type: 'code';
  language: string;
  code: string;
}

export interface ImageBlock {
  id: string;
  type: 'image';
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  lqip?: string;
}

export interface DividerBlock {
  id: string;
  type: 'divider';
}

export interface TableBlock {
  id: string;
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface CalloutBlock {
  id: string;
  type: 'callout';
  variant: 'info' | 'warning' | 'tip';
  content: string;
}

export interface QuizBlock {
  id: string;
  type: 'quiz';
  quizId: string;
}

export interface ChartBlock {
  id: string;
  type: 'chart';
  chartConfig: {
    data: Record<string, unknown>[];
    xKey: string;
    yKey: string;
    yKey2?: string;
    type: 'area' | 'bar' | 'line';
    height?: number;
    yLabel?: string;
    y2Label?: string;
  };
}

export interface FormulaBlock {
  id: string;
  type: 'formula';
  latex: string;
}

export type Block =
  | ParagraphBlock
  | HeadingBlock
  | BlockquoteBlock
  | BulletListBlock
  | OrderedListBlock
  | CodeBlock
  | ImageBlock
  | DividerBlock
  | TableBlock
  | CalloutBlock
  | QuizBlock
  | ChartBlock
  | FormulaBlock;

export type BlockType = Block['type'];
