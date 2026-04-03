/**
 * Content Conversion — markdown ↔ TipTap JSON ↔ sections
 *
 * Converts between the three content formats used by deliverables:
 *   1. Markdown string (content.markdown)
 *   2. TipTap/ProseMirror JSON (tiptap_content column)
 *   3. Sections array (content.sections)
 */
import { generateJSON, generateHTML } from '@tiptap/html';
import type { JSONContent, Extensions } from '@tiptap/core';
import { marked } from 'marked';
import TurndownService from 'turndown';

// ─── Markdown → TipTap JSON ─────────────────────────────────────────

export function markdownToTiptap(markdown: string, extensions: Extensions): JSONContent {
  // marked parses GFM tables, lists, headings, bold, italic, links, etc.
  const html = marked.parse(markdown, { async: false, gfm: true }) as string;
  return generateJSON(html, extensions);
}

// ─── TipTap JSON → Markdown ─────────────────────────────────────────

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

// Turndown: handle tables
turndown.addRule('tableCell', {
  filter: ['th', 'td'],
  replacement: (content) => ` ${content.trim()} |`,
});
turndown.addRule('tableRow', {
  filter: 'tr',
  replacement: (content) => `|${content}\n`,
});
turndown.addRule('table', {
  filter: 'table',
  replacement: (_content, node) => {
    const el = node as HTMLTableElement;
    const rows = Array.from(el.rows);
    if (rows.length === 0) return '';

    const lines: string[] = [];
    // Header row
    const headerCells = Array.from(rows[0].cells);
    lines.push('| ' + headerCells.map(c => c.textContent?.trim() || '').join(' | ') + ' |');
    lines.push('| ' + headerCells.map(() => '---').join(' | ') + ' |');
    // Data rows
    for (let i = 1; i < rows.length; i++) {
      const cells = Array.from(rows[i].cells);
      lines.push('| ' + cells.map(c => c.textContent?.trim() || '').join(' | ') + ' |');
    }
    return '\n' + lines.join('\n') + '\n\n';
  },
});

export function tiptapToMarkdown(json: JSONContent, extensions: Extensions): string {
  const html = generateHTML(json, extensions);
  return turndown.turndown(html);
}

// ─── Sections → TipTap JSON ─────────────────────────────────────────

interface Section {
  title: string;
  content?: string | string[];
  items?: string[];
  table?: Record<string, any>;
}

export function sectionsToTiptap(
  sections: Section[],
  extensions: Extensions,
  opts?: { title?: string; summary?: string; disclaimer?: string },
): JSONContent {
  const nodes: JSONContent[] = [];

  // Document title
  if (opts?.title) {
    nodes.push({
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: opts.title }],
    });
  }

  // Summary block
  if (opts?.summary) {
    nodes.push({
      type: 'blockquote',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: opts.summary }] }],
    });
  }

  for (const section of sections) {
    // Section heading
    nodes.push({
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: section.title }],
    });

    // Section content
    if (typeof section.content === 'string') {
      // Could be plain text or markdown — try parsing
      if (section.content.includes('**') || section.content.includes('|') || section.content.includes('#')) {
        // Has markdown-like formatting — convert via HTML
        const html = marked.parse(section.content, { async: false, gfm: true }) as string;
        const parsed = generateJSON(html, extensions);
        if (parsed.content) {
          nodes.push(...parsed.content);
        }
      } else {
        nodes.push({
          type: 'paragraph',
          content: [{ type: 'text', text: section.content }],
        });
      }
    } else if (Array.isArray(section.content)) {
      // Array of strings → paragraphs
      for (const line of section.content) {
        nodes.push({
          type: 'paragraph',
          content: [{ type: 'text', text: line }],
        });
      }
    } else if (section.items) {
      // Bullet list
      nodes.push({
        type: 'bulletList',
        content: section.items.map(item => ({
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: item }] }],
        })),
      });
    } else if (section.table) {
      // Convert table object to markdown table, then parse
      const tableObj = section.table as Record<string, any>;
      if (tableObj.headers && tableObj.rows) {
        const md = tableToMarkdown(tableObj.headers, tableObj.rows);
        const html = marked.parse(md, { async: false, gfm: true }) as string;
        const parsed = generateJSON(html, extensions);
        if (parsed.content) {
          nodes.push(...parsed.content);
        }
      }
    }
  }

  // Disclaimer
  if (opts?.disclaimer) {
    nodes.push({
      type: 'horizontalRule',
    });
    nodes.push({
      type: 'paragraph',
      content: [{ type: 'text', marks: [{ type: 'italic' }], text: opts.disclaimer }],
    });
  }

  return { type: 'doc', content: nodes };
}

// ─── Key-Value → TipTap JSON ────────────────────────────────────────

export function keyValueToTiptap(
  content: Record<string, any>,
  title: string,
): JSONContent {
  const nodes: JSONContent[] = [];

  nodes.push({
    type: 'heading',
    attrs: { level: 1 },
    content: [{ type: 'text', text: title }],
  });

  for (const [key, value] of Object.entries(content)) {
    if (key === 'type' || key === 'generated_at') continue;

    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    nodes.push({
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: label }],
    });

    if (typeof value === 'string') {
      nodes.push({
        type: 'paragraph',
        content: [{ type: 'text', text: value }],
      });
    } else if (typeof value === 'number') {
      nodes.push({
        type: 'paragraph',
        content: [{ type: 'text', marks: [{ type: 'bold' }], text: value.toLocaleString() }],
      });
    } else if (Array.isArray(value)) {
      nodes.push({
        type: 'bulletList',
        content: value.map(item => ({
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: String(item) }] }],
        })),
      });
    } else if (typeof value === 'object' && value !== null) {
      // Render as key-value pairs in a paragraph block
      const lines = Object.entries(value).map(([k, v]) => `${k}: ${v}`).join('\n');
      nodes.push({
        type: 'paragraph',
        content: [{ type: 'text', text: lines }],
      });
    }
  }

  return { type: 'doc', content: nodes };
}

// ─── Helpers ─────────────────────────────────────────────────────────

function tableToMarkdown(headers: string[], rows: (string | number)[][]): string {
  const lines: string[] = [];
  lines.push('| ' + headers.join(' | ') + ' |');
  lines.push('| ' + headers.map(() => '---').join(' | ') + ' |');
  for (const row of rows) {
    lines.push('| ' + row.map(c => String(c)).join(' | ') + ' |');
  }
  return lines.join('\n');
}
