/**
 * smbX Brand Template System
 *
 * Shared design tokens, layout constants, and formatting helpers
 * used across PDF, DOCX, and XLSX exports. Every document from
 * smbx.ai should look like it came from a boutique investment bank.
 */

// ─── Color Palette ──────────────────────────────────────────

export const COLORS = {
  /** Page background (for PDF cover, tints) */
  cream:       '#FAF8F4',
  /** Brand accent — rose gold */
  terra:       '#D44A78',
  /** Dark rose for hover / pressed states */
  terraDark:   '#B03860',
  /** Primary text — near black */
  text:        '#1A1A18',
  /** Secondary text */
  textMuted:   '#6E6A63',
  /** Tertiary / meta text */
  textLight:   '#A9A49C',
  /** Table header background */
  tableHeader: '#F3F0EA',
  /** Alternating row tint */
  tableStripe: '#FAFAF8',
  /** Borders and rules */
  border:      '#DDD9D1',
  /** Light border */
  borderLight: '#EBEBEB',
  /** Watermark */
  watermark:   '#E8E4DC',
  /** White */
  white:       '#FFFFFF',
} as const;

/** ARGB versions for ExcelJS (8-char hex with FF alpha prefix) */
export const ARGB = {
  text:        'FF1A1A18',
  textMuted:   'FF6E6A63',
  textLight:   'FFA9A49C',
  terra:       'FFB5636B',
  tableHeader: 'FFF3F0EA',
  tableStripe: 'FFFAFAF8',
  border:      'FFDDD9D1',
  white:       'FFFFFFFF',
  cream:       'FFFAF8F4',
} as const;

// ─── Typography ─────────────────────────────────────────────
// pdfkit only supports built-in fonts without font file registration.
// We use Helvetica (closest to Inter among built-ins).

export const FONTS = {
  regular:    'Helvetica',
  bold:       'Helvetica-Bold',
  oblique:    'Helvetica-Oblique',
  boldOblique:'Helvetica-BoldOblique',
} as const;

export const TYPE_SCALE = {
  /** Cover page title */
  coverTitle:  { size: 28, font: FONTS.bold,    color: COLORS.text,      leading: 34 },
  /** Cover page subtitle */
  coverSub:    { size: 14, font: FONTS.regular,  color: COLORS.textMuted, leading: 20 },
  /** Document H1 */
  h1:          { size: 22, font: FONTS.bold,    color: COLORS.text,      leading: 28 },
  /** Document H2 */
  h2:          { size: 16, font: FONTS.bold,    color: COLORS.text,      leading: 22 },
  /** Document H3 */
  h3:          { size: 13, font: FONTS.bold,    color: COLORS.text,      leading: 18 },
  /** Body text */
  body:        { size: 10.5, font: FONTS.regular, color: '#3D3B37',      leading: 16 },
  /** Small / caption */
  caption:     { size: 8.5, font: FONTS.regular,  color: COLORS.textMuted, leading: 12 },
  /** Table header label */
  tableHead:   { size: 8.5, font: FONTS.bold,    color: COLORS.textMuted, leading: 12 },
  /** Table cell */
  tableCell:   { size: 10, font: FONTS.regular,  color: COLORS.text,      leading: 14 },
  /** Page header / footer */
  pageInfo:    { size: 7.5, font: FONTS.regular,  color: COLORS.textLight, leading: 10 },
} as const;

// ─── Page Layout (LETTER: 612 x 792 pt) ────────────────────

export const PAGE = {
  size:   'LETTER' as const,
  width:  612,
  height: 792,
  margin: { top: 60, bottom: 55, left: 60, right: 60 },
  /** Usable content width */
  get contentWidth() { return this.width - this.margin.left - this.margin.right; },
  /** Y position to trigger page break */
  get breakY() { return this.height - this.margin.bottom - 40; },
} as const;

// ─── DOCX Style Definitions ────────────────────────────────

export const DOCX_STYLES = {
  /** Half-points (1/2 pt) — docx library uses this unit for font sizes */
  title:      { size: 48, bold: true, color: COLORS.text.replace('#', '') },
  heading1:   { size: 44, bold: true, color: COLORS.text.replace('#', '') },
  heading2:   { size: 32, bold: true, color: COLORS.text.replace('#', '') },
  heading3:   { size: 26, bold: true, color: COLORS.text.replace('#', '') },
  body:       { size: 21, bold: false, color: '3D3B37' },
  caption:    { size: 17, bold: false, color: COLORS.textMuted.replace('#', '') },
  meta:       { size: 16, bold: false, color: COLORS.textLight.replace('#', '') },
} as const;

// ─── XLSX Column Presets ────────────────────────────────────

export const XLSX_FORMATS = {
  /** Whole numbers with thousands separator */
  integer:  '#,##0',
  /** Currency (no decimals for large numbers) */
  currency: '$#,##0',
  /** Currency with cents */
  currencyFull: '$#,##0.00',
  /** Percentage */
  percent:  '0.0%',
  /** Multiplier (2.5x) */
  multiple: '0.0"x"',
  /** Date */
  date:     'MM/DD/YYYY',
} as const;

// ─── PDF Helper: Cover Page ─────────────────────────────────

import PDFDocument from 'pdfkit';

type PDFDoc = InstanceType<typeof PDFDocument>;

/**
 * Render a professional cover page with brand mark, title, and metadata.
 */
export function renderCoverPage(
  doc: PDFDoc,
  opts: {
    title: string;
    subtitle?: string;
    dealName?: string;
    date?: string;
    confidential?: boolean;
  },
) {
  const { margin } = PAGE;
  const cw = PAGE.contentWidth;
  const date = opts.date || new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // Cream background
  doc.rect(0, 0, PAGE.width, PAGE.height).fill(COLORS.cream);

  // Terra accent line at top
  doc.save();
  doc.rect(0, 0, PAGE.width, 4).fill(COLORS.terra);
  doc.restore();

  // Brand mark — top left
  const brandY = 60;
  doc.fontSize(20).font(FONTS.bold).fillColor(COLORS.text)
    .text('smbx', margin.left, brandY, { continued: true })
    .fillColor(COLORS.terra).text('.')
    .fillColor(COLORS.textMuted).fontSize(12).font(FONTS.regular)
    .text('ai', margin.left + 55, brandY + 6);

  // Main title block — vertically centered
  const titleY = 280;
  doc.fontSize(TYPE_SCALE.coverTitle.size)
    .font(TYPE_SCALE.coverTitle.font)
    .fillColor(TYPE_SCALE.coverTitle.color)
    .text(opts.title, margin.left, titleY, { width: cw, lineGap: 4 });

  // Terra rule under title
  const ruleY = doc.y + 12;
  doc.strokeColor(COLORS.terra).lineWidth(2.5)
    .moveTo(margin.left, ruleY).lineTo(margin.left + 80, ruleY).stroke();

  // Subtitle / deal name
  if (opts.subtitle || opts.dealName) {
    doc.fontSize(TYPE_SCALE.coverSub.size)
      .font(TYPE_SCALE.coverSub.font)
      .fillColor(TYPE_SCALE.coverSub.color)
      .text(opts.subtitle || opts.dealName || '', margin.left, ruleY + 20, { width: cw });
  }

  // Date
  doc.fontSize(TYPE_SCALE.caption.size)
    .font(TYPE_SCALE.caption.font)
    .fillColor(TYPE_SCALE.caption.color)
    .text(date, margin.left, ruleY + 50);

  // Confidentiality notice — bottom
  if (opts.confidential !== false) {
    doc.fontSize(7).font(FONTS.regular).fillColor(COLORS.textLight)
      .text(
        'CONFIDENTIAL — This document was prepared by smbx.ai and is intended solely for the use of the recipient. ' +
        'Distribution, reproduction, or use of this document without prior written consent is strictly prohibited.',
        margin.left,
        PAGE.height - 80,
        { width: cw, align: 'left', lineGap: 2 },
      );
  }

  doc.addPage();
}

// ─── PDF Helper: Page Header & Footer ───────────────────────

/**
 * Add header and footer to every page. Call AFTER all content is written,
 * before doc.end(). Iterates over buffered pages.
 */
export function addHeaderFooter(
  doc: PDFDoc,
  opts?: { title?: string; skipFirst?: boolean },
) {
  const pages = doc.bufferedPageRange();
  const { margin } = PAGE;
  const cw = PAGE.contentWidth;

  for (let i = pages.start; i < pages.start + pages.count; i++) {
    if (opts?.skipFirst && i === pages.start) continue;

    doc.switchToPage(i);

    // Header: thin terra rule + "smbx.ai" left, page number right
    const headerY = 28;
    doc.save();
    doc.strokeColor(COLORS.terra).lineWidth(0.5)
      .moveTo(margin.left, headerY + 12)
      .lineTo(margin.left + cw, headerY + 12)
      .stroke();

    doc.fontSize(TYPE_SCALE.pageInfo.size)
      .font(TYPE_SCALE.pageInfo.font)
      .fillColor(TYPE_SCALE.pageInfo.color)
      .text('smbx.ai', margin.left, headerY, { width: cw * 0.5 });

    doc.fontSize(TYPE_SCALE.pageInfo.size)
      .font(TYPE_SCALE.pageInfo.font)
      .fillColor(TYPE_SCALE.pageInfo.color)
      .text(`${i - pages.start + 1}`, margin.left, headerY, { width: cw, align: 'right' });
    doc.restore();

    // Footer: confidential left, page/total right
    const footerY = PAGE.height - 35;
    doc.save();
    doc.strokeColor(COLORS.borderLight).lineWidth(0.3)
      .moveTo(margin.left, footerY - 4)
      .lineTo(margin.left + cw, footerY - 4)
      .stroke();

    doc.fontSize(6.5).font(FONTS.regular).fillColor(COLORS.textLight)
      .text('Confidential — Prepared by smbx.ai', margin.left, footerY, { width: cw * 0.7 });

    if (opts?.title) {
      doc.fontSize(6.5).font(FONTS.oblique).fillColor(COLORS.textLight)
        .text(opts.title, margin.left, footerY, { width: cw, align: 'right' });
    }
    doc.restore();
  }
}

// ─── PDF Helper: Watermark ──────────────────────────────────

export function addWatermark(doc: PDFDoc, text: string) {
  const pages = doc.bufferedPageRange();
  for (let i = pages.start; i < pages.start + pages.count; i++) {
    doc.switchToPage(i);
    doc.save();
    doc.translate(PAGE.width / 2, PAGE.height / 2);
    doc.rotate(-45);
    doc.fontSize(44).fillColor(COLORS.watermark).fillOpacity(0.25)
      .text(text, -180, -15, { align: 'center', width: 360 });
    doc.restore();
  }
}

// ─── PDF Helper: Section Heading ────────────────────────────

export function renderHeading(
  doc: PDFDoc,
  text: string,
  level: 1 | 2 | 3 = 2,
) {
  const style = level === 1 ? TYPE_SCALE.h1 : level === 2 ? TYPE_SCALE.h2 : TYPE_SCALE.h3;

  if (doc.y > PAGE.breakY) doc.addPage();

  doc.moveDown(level === 1 ? 1.2 : level === 2 ? 0.8 : 0.5);
  doc.fontSize(style.size).font(style.font).fillColor(style.color).text(text);

  if (level === 1) {
    const ruleY = doc.y + 4;
    doc.strokeColor(COLORS.terra).lineWidth(1.5)
      .moveTo(PAGE.margin.left, ruleY)
      .lineTo(PAGE.margin.left + 60, ruleY)
      .stroke();
    doc.moveDown(0.6);
  } else {
    doc.moveDown(0.3);
  }
}

// ─── PDF Helper: Financial Table ────────────────────────────

export interface TableColumn {
  header: string;
  key: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
  format?: (val: any) => string;
}

/**
 * Render a professional financial table with right-aligned numbers,
 * alternating row tints, and terra-accented header.
 */
export function renderTable(
  doc: PDFDoc,
  columns: TableColumn[],
  rows: Record<string, any>[],
  opts?: { title?: string },
) {
  if (doc.y > PAGE.breakY - 60) doc.addPage();

  const { margin } = PAGE;
  const cw = PAGE.contentWidth;
  const rowHeight = 22;
  const headerHeight = 26;

  if (opts?.title) {
    renderHeading(doc, opts.title, 3);
  }

  // Calculate column widths
  const totalExplicit = columns.reduce((s, c) => s + (c.width || 0), 0);
  const autoCount = columns.filter(c => !c.width).length;
  const autoWidth = autoCount > 0 ? (cw - totalExplicit) / autoCount : 0;
  const widths = columns.map(c => c.width || autoWidth);

  let x = margin.left;
  const startY = doc.y;

  // Header row
  doc.rect(x, startY, cw, headerHeight).fill(COLORS.tableHeader);
  doc.strokeColor(COLORS.terra).lineWidth(1)
    .moveTo(x, startY + headerHeight)
    .lineTo(x + cw, startY + headerHeight)
    .stroke();

  let colX = x;
  for (let c = 0; c < columns.length; c++) {
    const col = columns[c];
    const align = col.align || (c === 0 ? 'left' : 'right');
    const textX = align === 'right' ? colX : colX + 6;
    const textW = align === 'right' ? widths[c] - 6 : widths[c] - 6;
    doc.fontSize(TYPE_SCALE.tableHead.size)
      .font(TYPE_SCALE.tableHead.font)
      .fillColor(TYPE_SCALE.tableHead.color)
      .text(col.header.toUpperCase(), textX, startY + 8, {
        width: textW,
        align,
        lineBreak: false,
      });
    colX += widths[c];
  }

  // Data rows
  let y = startY + headerHeight;
  for (let r = 0; r < rows.length; r++) {
    if (y > PAGE.breakY) {
      doc.addPage();
      y = PAGE.margin.top;
    }

    // Alternating stripe
    if (r % 2 === 1) {
      doc.rect(x, y, cw, rowHeight).fill(COLORS.tableStripe);
    }

    colX = x;
    for (let c = 0; c < columns.length; c++) {
      const col = columns[c];
      const raw = rows[r][col.key];
      const text = col.format ? col.format(raw) : (raw != null ? String(raw) : '—');
      const align = col.align || (c === 0 ? 'left' : 'right');
      const textX = align === 'right' ? colX : colX + 6;
      const textW = align === 'right' ? widths[c] - 6 : widths[c] - 6;

      doc.fontSize(TYPE_SCALE.tableCell.size)
        .font(TYPE_SCALE.tableCell.font)
        .fillColor(TYPE_SCALE.tableCell.color)
        .text(text, textX, y + 6, {
          width: textW,
          align,
          lineBreak: false,
        });
      colX += widths[c];
    }

    // Bottom border
    doc.strokeColor(COLORS.borderLight).lineWidth(0.3)
      .moveTo(x, y + rowHeight).lineTo(x + cw, y + rowHeight).stroke();

    y += rowHeight;
  }

  doc.y = y + 8;
}

// ─── Number Formatting ──────────────────────────────────────

/** Format cents to display dollars with commas: 150000 → "1,500" */
export function centsToDisplay(cents: number | null | undefined): string {
  if (cents == null) return '—';
  return (cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/** Format cents to currency: 150000 → "$1,500" */
export function centsToCurrency(cents: number | null | undefined): string {
  if (cents == null) return '—';
  return '$' + centsToDisplay(cents);
}

/** Format a raw number with commas: 1500000 → "1,500,000" */
export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/** Format as percentage: 0.1234 → "12.3%" */
export function formatPercent(n: number | null | undefined, decimals = 1): string {
  if (n == null) return '—';
  return (n * 100).toFixed(decimals) + '%';
}

/** Format as multiple: 3.5 → "3.5x" */
export function formatMultiple(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toFixed(1) + 'x';
}
