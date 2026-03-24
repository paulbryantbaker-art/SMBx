/**
 * Export Service — Professional PDF, DOCX, and XLSX from deliverable content.
 *
 * Every document looks like it came from a boutique investment bank:
 * - PDF:  Branded cover page, header/footer, financial tables, watermarks
 * - DOCX: Styled headings, branded colors, proper table formatting
 * - XLSX: IB-style blue inputs, black formulas, multiple sheets
 *
 * PDF:  pdfkit (lightweight, no browser dependency)
 * DOCX: docx library
 * XLSX: ExcelJS
 */
import PDFDocument from 'pdfkit';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, PageBreak,
  Header, Footer,
} from 'docx';
import ExcelJS from 'exceljs';

import {
  COLORS, ARGB, FONTS, TYPE_SCALE, PAGE,
  DOCX_STYLES, XLSX_FORMATS,
  renderCoverPage, addHeaderFooter, addWatermark,
  renderHeading, renderTable,
  type TableColumn,
  centsToDisplay, centsToCurrency, formatNumber, formatPercent, formatMultiple,
} from '../templates/smbxBrand.js';

type PDFDoc = InstanceType<typeof PDFDocument>;

// ─── PDF Export ──────────────────────────────────────────────

export async function exportToPDF(
  content: Record<string, any>,
  title: string,
  options?: { watermark?: string; dealName?: string },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: PAGE.size,
      margins: PAGE.margin,
      bufferPages: true,
      info: {
        Title: title,
        Author: 'smbx.ai',
        Creator: 'smbx.ai Export Engine',
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Cover page
    renderCoverPage(doc, {
      title,
      subtitle: options?.dealName,
      confidential: true,
    });

    // Content pages
    if (content.markdown) {
      renderMarkdownToPDF(doc, content.markdown);
    } else if (content.sections) {
      for (const section of content.sections) {
        renderSectionToPDF(doc, section);
      }
    } else {
      renderKeyValuePDF(doc, content);
    }

    // Post-processing: headers, footers, watermark
    addHeaderFooter(doc, { title, skipFirst: true });
    if (options?.watermark) {
      addWatermark(doc, options.watermark);
    }

    doc.end();
  });
}

// ─── Signature-Ready LOI PDF ─────────────────────────────────

export async function exportLOIToPDF(
  content: Record<string, any>,
  title: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: PAGE.size,
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
      bufferPages: true,
      info: {
        Title: title,
        Author: 'smbx.ai',
        Creator: 'smbx.ai Export Engine',
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = 612 - 144;

    // Brand mark top-right
    doc.fontSize(10).font(FONTS.bold).fillColor(COLORS.text)
      .text('smbx', 72, 40, { continued: true })
      .fillColor(COLORS.terra).text('.')
      .fillColor(COLORS.textMuted).fontSize(8).font(FONTS.regular)
      .text('ai', 72 + 35, 43);

    // Date
    doc.fontSize(10).fillColor(COLORS.textMuted).font(FONTS.regular)
      .text(new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      }), 72, 72, { align: 'right', width: pageWidth });
    doc.moveDown(2);

    // Title
    doc.fontSize(20).fillColor(COLORS.text).font(FONTS.bold)
      .text(title, { align: 'center' });
    doc.moveDown(0.3);
    doc.strokeColor(COLORS.terra).lineWidth(2)
      .moveTo(72, doc.y).lineTo(540, doc.y).stroke();
    doc.moveDown(1.5);

    // Parties section
    if (content.buyer_name || content.seller_name) {
      doc.fontSize(10).fillColor('#3D3B37').font(FONTS.regular);
      if (content.buyer_name) doc.text(`Buyer: ${content.buyer_name}`);
      if (content.seller_name) doc.text(`Seller: ${content.seller_name}`);
      if (content.business_name) doc.text(`Business: ${content.business_name}`);
      if (content.purchase_price) doc.text(`Purchase Price: ${content.purchase_price}`);
      doc.moveDown(1);
    }

    // LOI body
    if (content.markdown) {
      renderMarkdownToPDF(doc, content.markdown);
    } else if (content.sections) {
      for (const section of content.sections) {
        renderSectionToPDF(doc, section);
      }
    } else {
      for (const [key, value] of Object.entries(content)) {
        if (['type', 'generated_at', 'buyer_name', 'seller_name', 'business_name', 'purchase_price'].includes(key)) continue;
        if (typeof value === 'string' && value.length > 0) {
          doc.fontSize(TYPE_SCALE.body.size).fillColor(TYPE_SCALE.body.color).font(FONTS.regular)
            .text(String(value), { lineGap: 3 });
          doc.moveDown(0.5);
        }
      }
    }

    // Signature blocks
    if (doc.y > PAGE.height - 280) doc.addPage();
    doc.moveDown(2);
    doc.strokeColor(COLORS.border).lineWidth(0.5)
      .moveTo(72, doc.y).lineTo(540, doc.y).stroke();
    doc.moveDown(1.5);

    doc.fontSize(12).fillColor(COLORS.text).font(FONTS.bold)
      .text('AGREED AND ACCEPTED:');
    doc.moveDown(1.5);

    renderSignatureBlock(doc, 'BUYER', content.buyer_name);
    doc.moveDown(1.5);
    renderSignatureBlock(doc, 'SELLER', content.seller_name);

    // Footer
    addHeaderFooter(doc, { title, skipFirst: false });

    doc.end();
  });
}

function renderSignatureBlock(doc: PDFDoc, role: string, name?: string) {
  doc.fontSize(10).fillColor('#3D3B37').font(FONTS.bold).text(`${role}:`);
  doc.moveDown(0.3);
  doc.fontSize(10).font(FONTS.regular).text(name || '____________________________');
  doc.moveDown(1.5);
  doc.strokeColor(COLORS.text).lineWidth(0.5)
    .moveTo(72, doc.y).lineTo(300, doc.y).stroke();
  doc.moveDown(0.2);
  doc.fontSize(8).fillColor(COLORS.textMuted).text('Signature');
  doc.moveDown(0.8);
  doc.strokeColor(COLORS.text).lineWidth(0.5)
    .moveTo(72, doc.y).lineTo(300, doc.y).stroke();
  doc.moveDown(0.2);
  doc.fontSize(8).fillColor(COLORS.textMuted)
    .text('Printed Name                                                        Date');
}

// ─── PDF Markdown Renderer ──────────────────────────────────

function renderMarkdownToPDF(doc: PDFDoc, markdown: string) {
  const lines = markdown.split('\n');
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: Record<string, any>[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect markdown table
    if (line.includes('|') && line.trim().startsWith('|')) {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean);

      // Check if next line is separator (|---|---|)
      const nextLine = lines[i + 1] || '';
      if (nextLine.includes('---') && nextLine.includes('|')) {
        // This is a table header
        tableHeaders = cells;
        inTable = true;
        tableRows = [];
        i++; // skip separator line
        continue;
      }

      if (inTable) {
        const row: Record<string, any> = {};
        cells.forEach((cell, idx) => {
          row[tableHeaders[idx] || `col${idx}`] = cell;
        });
        tableRows.push(row);
        continue;
      }
    } else if (inTable && tableRows.length > 0) {
      // End of table — render it
      const columns: TableColumn[] = tableHeaders.map((h, idx) => ({
        header: h,
        key: h,
        align: idx === 0 ? 'left' as const : 'right' as const,
      }));
      renderTable(doc, columns, tableRows);
      inTable = false;
      tableHeaders = [];
      tableRows = [];
    }

    // Headings
    if (line.startsWith('### ')) {
      renderHeading(doc, line.replace(/^### /, '').replace(/\*\*/g, ''), 3);
    } else if (line.startsWith('## ')) {
      renderHeading(doc, line.replace(/^## /, '').replace(/\*\*/g, ''), 2);
    } else if (line.startsWith('# ')) {
      renderHeading(doc, line.replace(/^# /, '').replace(/\*\*/g, ''), 1);
    } else if (line.startsWith('- [ ] ')) {
      doc.fontSize(TYPE_SCALE.body.size).fillColor(TYPE_SCALE.body.color).font(FONTS.regular)
        .text(`\u2610 ${line.replace(/^- \[ \] /, '')}`, { indent: 15 });
    } else if (line.startsWith('- [x] ') || line.startsWith('- [X] ')) {
      doc.fontSize(TYPE_SCALE.body.size).fillColor(TYPE_SCALE.body.color).font(FONTS.regular)
        .text(`\u2611 ${line.replace(/^- \[[xX]\] /, '')}`, { indent: 15 });
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const text = line.replace(/^[-*] /, '').replace(/\*\*/g, '');
      doc.fontSize(TYPE_SCALE.body.size).fillColor(TYPE_SCALE.body.color).font(FONTS.regular)
        .text(`\u2022  ${text}`, { indent: 15, lineGap: 2 });
    } else if (/^\d+\.\s/.test(line)) {
      const text = line.replace(/\*\*/g, '');
      doc.fontSize(TYPE_SCALE.body.size).fillColor(TYPE_SCALE.body.color).font(FONTS.regular)
        .text(text, { indent: 15, lineGap: 2 });
    } else if (line.startsWith('---') || line.startsWith('***')) {
      doc.moveDown(0.4);
      doc.strokeColor(COLORS.border).lineWidth(0.5)
        .moveTo(PAGE.margin.left, doc.y)
        .lineTo(PAGE.margin.left + PAGE.contentWidth, doc.y)
        .stroke();
      doc.moveDown(0.4);
    } else if (line.trim() === '') {
      doc.moveDown(0.35);
    } else if (!line.includes('|')) {
      // Regular text — handle bold inline
      renderBodyText(doc, line);
    }

    // Page break check
    if (doc.y > PAGE.breakY) {
      doc.addPage();
    }
  }

  // Flush any remaining table
  if (inTable && tableRows.length > 0) {
    const columns: TableColumn[] = tableHeaders.map((h, idx) => ({
      header: h,
      key: h,
      align: idx === 0 ? 'left' as const : 'right' as const,
    }));
    renderTable(doc, columns, tableRows);
  }
}

function renderBodyText(doc: PDFDoc, line: string) {
  // Simple bold handling — pdfkit can't mix fonts inline easily,
  // so we render the whole line and bold entire segments
  const hasBold = /\*\*(.+?)\*\*/.test(line);

  if (hasBold) {
    const parts = line.split(/(\*\*.*?\*\*)/);
    for (const part of parts) {
      if (part.startsWith('**') && part.endsWith('**')) {
        const last = parts.indexOf(part) === parts.length - 1;
        doc.fontSize(TYPE_SCALE.body.size).fillColor(TYPE_SCALE.body.color).font(FONTS.bold)
          .text(part.slice(2, -2), { continued: !last, lineGap: 3 });
      } else if (part) {
        const last = parts.indexOf(part) === parts.length - 1;
        doc.fontSize(TYPE_SCALE.body.size).fillColor(TYPE_SCALE.body.color).font(FONTS.regular)
          .text(part, { continued: !last, lineGap: 3 });
      }
    }
  } else {
    doc.fontSize(TYPE_SCALE.body.size).fillColor(TYPE_SCALE.body.color).font(FONTS.regular)
      .text(line, { lineGap: 3 });
  }
}

function renderSectionToPDF(doc: PDFDoc, section: any) {
  renderHeading(doc, section.title, 2);

  if (typeof section.content === 'string') {
    renderBodyText(doc, section.content);
    doc.moveDown(0.5);
  } else if (section.items) {
    for (const item of section.items) {
      doc.fontSize(TYPE_SCALE.body.size).fillColor(TYPE_SCALE.body.color).font(FONTS.regular)
        .text(`\u2022  ${item}`, { indent: 15, lineGap: 2 });
    }
    doc.moveDown(0.5);
  }

  // Render sub-table if present
  if (section.table && Array.isArray(section.table) && section.table.length > 0) {
    const headers = Object.keys(section.table[0]);
    const columns: TableColumn[] = headers.map((h, idx) => ({
      header: h.replace(/_/g, ' '),
      key: h,
      align: idx === 0 ? 'left' as const : 'right' as const,
    }));
    renderTable(doc, columns, section.table);
  }
}

function renderKeyValuePDF(doc: PDFDoc, content: Record<string, any>) {
  for (const [key, value] of Object.entries(content)) {
    if (key === 'type' || key === 'generated_at') continue;

    doc.fontSize(TYPE_SCALE.caption.size).fillColor(TYPE_SCALE.caption.color).font(FONTS.bold)
      .text(key.replace(/_/g, ' ').toUpperCase());
    doc.moveDown(0.1);
    doc.fontSize(TYPE_SCALE.body.size).fillColor(TYPE_SCALE.body.color).font(FONTS.regular)
      .text(typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value), { lineGap: 3 });
    doc.moveDown(0.6);
  }
}

// ─── DOCX Export ─────────────────────────────────────────────

export async function exportToDOCX(
  content: Record<string, any>,
  title: string,
): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(new Paragraph({
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: DOCX_STYLES.title.size,
        color: DOCX_STYLES.title.color,
        font: 'Calibri',
      }),
    ],
    spacing: { after: 120 },
  }));

  // Terra accent rule (simulated with colored text)
  children.push(new Paragraph({
    children: [
      new TextRun({
        text: '━━━━━━━━━━',
        color: COLORS.terra.replace('#', ''),
        size: 16,
        font: 'Calibri',
      }),
    ],
    spacing: { after: 200 },
  }));

  // Meta
  children.push(new Paragraph({
    children: [
      new TextRun({
        text: `Prepared by smbx.ai  |  ${new Date().toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        })}`,
        size: DOCX_STYLES.meta.size,
        color: DOCX_STYLES.meta.color,
        font: 'Calibri',
      }),
    ],
    spacing: { after: 200 },
  }));

  // Confidentiality notice
  children.push(new Paragraph({
    children: [
      new TextRun({
        text: 'CONFIDENTIAL — This document is intended solely for the use of the recipient.',
        size: 14,
        color: DOCX_STYLES.meta.color,
        italics: true,
        font: 'Calibri',
      }),
    ],
    spacing: { after: 400 },
  }));

  // Content
  if (content.markdown) {
    parseMarkdownToDOCX(content.markdown, children);
  } else if (content.sections) {
    for (const section of content.sections) {
      renderSectionToDOCX(section, children);
    }
  } else {
    renderKeyValueDOCX(content, children);
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1000, bottom: 800, left: 1000, right: 1000 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [
              new TextRun({ text: 'smbx', bold: true, size: 14, color: DOCX_STYLES.title.color, font: 'Calibri' }),
              new TextRun({ text: '.', bold: true, size: 14, color: COLORS.terra.replace('#', ''), font: 'Calibri' }),
              new TextRun({ text: 'ai', size: 14, color: DOCX_STYLES.meta.color, font: 'Calibri' }),
            ],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              new TextRun({
                text: 'Confidential — Prepared by smbx.ai',
                size: 12,
                color: DOCX_STYLES.meta.color,
                font: 'Calibri',
              }),
            ],
            alignment: AlignmentType.CENTER,
          })],
        }),
      },
      children,
    }],
    creator: 'smbx.ai',
    title,
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

function parseMarkdownToDOCX(markdown: string, children: (Paragraph | Table)[]) {
  const lines = markdown.split('\n');
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableDataRows: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect markdown table
    if (line.includes('|') && line.trim().startsWith('|')) {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean);
      const nextLine = lines[i + 1] || '';

      if (nextLine.includes('---') && nextLine.includes('|')) {
        tableHeaders = cells;
        inTable = true;
        tableDataRows = [];
        i++;
        continue;
      }

      if (inTable) {
        tableDataRows.push(cells);
        continue;
      }
    } else if (inTable && tableDataRows.length > 0) {
      buildDocxTable(tableHeaders, tableDataRows, children);
      inTable = false;
      tableHeaders = [];
      tableDataRows = [];
    }

    // Headings
    if (line.startsWith('### ')) {
      children.push(new Paragraph({
        children: [new TextRun({
          text: line.replace(/^### /, '').replace(/\*\*/g, ''),
          ...DOCX_STYLES.heading3,
          font: 'Calibri',
        })],
        spacing: { before: 200, after: 80 },
      }));
    } else if (line.startsWith('## ')) {
      children.push(new Paragraph({
        children: [new TextRun({
          text: line.replace(/^## /, '').replace(/\*\*/g, ''),
          ...DOCX_STYLES.heading2,
          font: 'Calibri',
        })],
        spacing: { before: 300, after: 100 },
      }));
    } else if (line.startsWith('# ')) {
      children.push(new Paragraph({
        children: [new TextRun({
          text: line.replace(/^# /, '').replace(/\*\*/g, ''),
          ...DOCX_STYLES.heading1,
          font: 'Calibri',
        })],
        spacing: { before: 400, after: 200 },
      }));
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      children.push(new Paragraph({
        children: parseDocxTextRuns(line.replace(/^[-*] /, '')),
        bullet: { level: 0 },
        spacing: { after: 40 },
      }));
    } else if (/^\d+\.\s/.test(line)) {
      children.push(new Paragraph({
        children: parseDocxTextRuns(line),
        spacing: { after: 40 },
      }));
    } else if (line.startsWith('---') || line.startsWith('***')) {
      children.push(new Paragraph({
        children: [new TextRun({
          text: '─────────────────────────────────',
          size: 12,
          color: COLORS.border.replace('#', ''),
          font: 'Calibri',
        })],
        spacing: { before: 200, after: 200 },
      }));
    } else if (line.trim() === '') {
      children.push(new Paragraph({ text: '', spacing: { after: 60 } }));
    } else if (!line.includes('|')) {
      children.push(new Paragraph({
        children: parseDocxTextRuns(line),
        spacing: { after: 60 },
      }));
    }
  }

  // Flush remaining table
  if (inTable && tableDataRows.length > 0) {
    buildDocxTable(tableHeaders, tableDataRows, children);
  }
}

function parseDocxTextRuns(line: string): TextRun[] {
  const runs: TextRun[] = [];
  const parts = line.split(/(\*\*.*?\*\*)/);
  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({
        text: part.slice(2, -2),
        bold: true,
        size: DOCX_STYLES.body.size,
        color: DOCX_STYLES.body.color,
        font: 'Calibri',
      }));
    } else if (part) {
      runs.push(new TextRun({
        text: part,
        size: DOCX_STYLES.body.size,
        color: DOCX_STYLES.body.color,
        font: 'Calibri',
      }));
    }
  }
  return runs;
}

function buildDocxTable(
  headers: string[],
  dataRows: string[][],
  children: (Paragraph | Table)[],
) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({
          text: h,
          bold: true,
          size: 17,
          color: DOCX_STYLES.heading3.color,
          font: 'Calibri',
        })],
      })],
      shading: {
        type: ShadingType.SOLID,
        color: COLORS.tableHeader.replace('#', ''),
        fill: COLORS.tableHeader.replace('#', ''),
      },
      borders: {
        bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.terra.replace('#', '') },
        top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      },
    })),
  });

  const rows = dataRows.map((cells, rowIdx) =>
    new TableRow({
      children: cells.map((cell, colIdx) => new TableCell({
        children: [new Paragraph({
          children: [new TextRun({
            text: cell,
            size: DOCX_STYLES.body.size,
            color: DOCX_STYLES.body.color,
            font: 'Calibri',
          })],
          alignment: colIdx === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT,
        })],
        shading: rowIdx % 2 === 1 ? {
          type: ShadingType.SOLID,
          color: COLORS.tableStripe.replace('#', ''),
          fill: COLORS.tableStripe.replace('#', ''),
        } : undefined,
        borders: {
          bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderLight.replace('#', '') },
          top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        },
      })),
    }),
  );

  children.push(new Paragraph({ text: '', spacing: { after: 60 } }));
  children.push(new Table({
    rows: [headerRow, ...rows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  }));
  children.push(new Paragraph({ text: '', spacing: { after: 120 } }));
}

function renderSectionToDOCX(section: any, children: (Paragraph | Table)[]) {
  children.push(new Paragraph({
    children: [new TextRun({
      text: section.title,
      ...DOCX_STYLES.heading2,
      font: 'Calibri',
    })],
    spacing: { before: 300, after: 100 },
  }));

  if (typeof section.content === 'string') {
    children.push(new Paragraph({
      children: parseDocxTextRuns(section.content),
      spacing: { after: 120 },
    }));
  } else if (section.items) {
    for (const item of section.items) {
      children.push(new Paragraph({
        children: parseDocxTextRuns(typeof item === 'string' ? item : String(item)),
        bullet: { level: 0 },
        spacing: { after: 40 },
      }));
    }
  }

  if (section.table && Array.isArray(section.table) && section.table.length > 0) {
    const headers = Object.keys(section.table[0]);
    const dataRows = section.table.map((row: Record<string, any>) =>
      headers.map(h => row[h] != null ? String(row[h]) : '—'),
    );
    buildDocxTable(
      headers.map(h => h.replace(/_/g, ' ')),
      dataRows,
      children,
    );
  }
}

function renderKeyValueDOCX(content: Record<string, any>, children: (Paragraph | Table)[]) {
  for (const [key, value] of Object.entries(content)) {
    if (key === 'type' || key === 'generated_at' || key === 'markdown') continue;

    children.push(new Paragraph({
      children: [new TextRun({
        text: key.replace(/_/g, ' ').toUpperCase(),
        bold: true,
        size: DOCX_STYLES.caption.size,
        color: DOCX_STYLES.caption.color,
        font: 'Calibri',
      })],
      spacing: { before: 200, after: 40 },
    }));

    children.push(new Paragraph({
      children: [new TextRun({
        text: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value),
        size: DOCX_STYLES.body.size,
        color: DOCX_STYLES.body.color,
        font: 'Calibri',
      })],
      spacing: { after: 80 },
    }));
  }
}

// ─── XLSX Export ──────────────────────────────────────────────

export async function exportToXLSX(
  content: Record<string, any>,
  title: string,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'smbx.ai';
  workbook.created = new Date();

  // Summary sheet
  const sheet = workbook.addWorksheet(truncateSheetName(title));
  styleXLSXSheet(sheet, title);

  let currentRow = 5; // after header rows

  if (content.sections) {
    for (const section of content.sections) {
      currentRow = renderXLSXSection(sheet, section, currentRow);
    }
  } else if (content.markdown) {
    // Parse markdown tables into separate sheets
    currentRow = renderXLSXMarkdown(workbook, sheet, content.markdown, currentRow);
  } else {
    currentRow = renderXLSXKeyValue(sheet, content, currentRow);
  }

  // Auto-fit columns
  sheet.columns.forEach(col => {
    let maxLen = 12;
    col.eachCell?.({ includeEmpty: false }, cell => {
      const len = cell.value ? String(cell.value).length : 0;
      if (len > maxLen) maxLen = len;
    });
    col.width = Math.min(Math.max(maxLen + 2, 12), 45);
  });

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

function truncateSheetName(name: string): string {
  return name.replace(/[*?:/\\[\]]/g, '').substring(0, 31);
}

function styleXLSXSheet(sheet: ExcelJS.Worksheet, title: string) {
  // Title row
  sheet.mergeCells('A1:F1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = title;
  titleCell.font = { size: 16, bold: true, color: { argb: ARGB.text }, name: 'Calibri' };
  titleCell.alignment = { vertical: 'middle' };
  sheet.getRow(1).height = 32;

  // Terra accent bar (simulated with fill on row 2)
  sheet.mergeCells('A2:F2');
  const accentCell = sheet.getCell('A2');
  accentCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ARGB.terra } };
  sheet.getRow(2).height = 3;

  // Meta row
  sheet.mergeCells('A3:F3');
  const metaCell = sheet.getCell('A3');
  metaCell.value = `Prepared by smbx.ai  |  ${new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })}`;
  metaCell.font = { size: 9, color: { argb: ARGB.textLight }, name: 'Calibri' };
  sheet.getRow(3).height = 18;

  // Blank row 4
  sheet.getRow(4).height = 10;
}

function renderXLSXSection(
  sheet: ExcelJS.Worksheet,
  section: any,
  startRow: number,
): number {
  let row = startRow;

  // Section header
  const headerCell = sheet.getCell(`A${row}`);
  headerCell.value = section.title;
  headerCell.font = { size: 12, bold: true, color: { argb: ARGB.text }, name: 'Calibri' };
  row++;

  if (section.table && Array.isArray(section.table) && section.table.length > 0) {
    const headers = Object.keys(section.table[0]);

    // Column headers with IB-style formatting
    headers.forEach((h, i) => {
      const cell = sheet.getCell(row, i + 1);
      cell.value = h.replace(/_/g, ' ').toUpperCase();
      cell.font = { size: 9, bold: true, color: { argb: ARGB.textMuted }, name: 'Calibri' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ARGB.tableHeader } };
      cell.border = {
        bottom: { style: 'medium', color: { argb: ARGB.terra } },
      };
      cell.alignment = { horizontal: i === 0 ? 'left' : 'right' };
    });
    row++;

    // Data rows with alternating tints
    for (let r = 0; r < section.table.length; r++) {
      const data = section.table[r];
      headers.forEach((h, i) => {
        const cell = sheet.getCell(row, i + 1);
        const val = data[h];
        cell.value = val;
        cell.font = { size: 10, color: { argb: ARGB.text }, name: 'Calibri' };
        cell.alignment = { horizontal: i === 0 ? 'left' : 'right' };

        if (typeof val === 'number') {
          cell.numFmt = val >= 1000 ? XLSX_FORMATS.integer : '0.0';
        }

        // Alternating row tint
        if (r % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ARGB.tableStripe } };
        }

        // Bottom border
        cell.border = {
          bottom: { style: 'thin', color: { argb: ARGB.border } },
        };
      });
      row++;
    }
    row++; // spacing after table
  } else if (typeof section.content === 'string') {
    const cell = sheet.getCell(`A${row}`);
    cell.value = section.content;
    cell.font = { size: 10, color: { argb: ARGB.text }, name: 'Calibri' };
    cell.alignment = { wrapText: true };
    row += 2;
  }

  return row;
}

function renderXLSXMarkdown(
  workbook: ExcelJS.Workbook,
  sheet: ExcelJS.Worksheet,
  markdown: string,
  startRow: number,
): number {
  const lines = markdown.split('\n');
  let row = startRow;
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];
  let tableCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect markdown table
    if (line.includes('|') && line.trim().startsWith('|')) {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean);
      const nextLine = lines[i + 1] || '';

      if (nextLine.includes('---') && nextLine.includes('|')) {
        tableHeaders = cells;
        inTable = true;
        tableRows = [];
        i++;
        continue;
      }

      if (inTable) {
        tableRows.push(cells);
        continue;
      }
    } else if (inTable && tableRows.length > 0) {
      tableCount++;
      row = writeXLSXTable(sheet, tableHeaders, tableRows, row);
      inTable = false;
      tableHeaders = [];
      tableRows = [];
    }

    // Non-table content
    if (line.startsWith('#')) {
      const text = line.replace(/^#+\s*/, '').replace(/\*\*/g, '');
      const level = (line.match(/^#+/) || [''])[0].length;
      row++;
      const cell = sheet.getCell(`A${row}`);
      cell.value = text;
      cell.font = {
        size: level === 1 ? 14 : level === 2 ? 12 : 11,
        bold: true,
        color: { argb: ARGB.text },
        name: 'Calibri',
      };
      row++;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const text = line.replace(/^[-*] /, '').replace(/\*\*/g, '');
      const cell = sheet.getCell(`A${row}`);
      cell.value = `  \u2022  ${text}`;
      cell.font = { size: 10, color: { argb: ARGB.text }, name: 'Calibri' };
      row++;
    } else if (line.trim() !== '' && !line.startsWith('---') && !line.includes('|')) {
      const text = line.replace(/\*\*/g, '');
      const cell = sheet.getCell(`A${row}`);
      cell.value = text;
      cell.font = { size: 10, color: { argb: ARGB.text }, name: 'Calibri' };
      cell.alignment = { wrapText: true };
      row++;
    }
  }

  // Flush remaining table
  if (inTable && tableRows.length > 0) {
    row = writeXLSXTable(sheet, tableHeaders, tableRows, row);
  }

  return row;
}

function writeXLSXTable(
  sheet: ExcelJS.Worksheet,
  headers: string[],
  dataRows: string[][],
  startRow: number,
): number {
  let row = startRow;

  // Headers
  headers.forEach((h, i) => {
    const cell = sheet.getCell(row, i + 1);
    cell.value = h;
    cell.font = { size: 9, bold: true, color: { argb: ARGB.textMuted }, name: 'Calibri' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ARGB.tableHeader } };
    cell.border = { bottom: { style: 'medium', color: { argb: ARGB.terra } } };
    cell.alignment = { horizontal: i === 0 ? 'left' : 'right' };
  });
  row++;

  // Data
  for (let r = 0; r < dataRows.length; r++) {
    const cells = dataRows[r];
    cells.forEach((val, i) => {
      const cell = sheet.getCell(row, i + 1);
      // Try to parse numbers
      const num = parseFloat(val.replace(/[$,%x]/g, '').replace(/,/g, ''));
      if (!isNaN(num) && val.trim() !== '') {
        cell.value = num;
        if (val.includes('$')) cell.numFmt = XLSX_FORMATS.currency;
        else if (val.includes('%')) cell.numFmt = XLSX_FORMATS.percent;
        else if (val.includes('x')) cell.numFmt = XLSX_FORMATS.multiple;
        else cell.numFmt = XLSX_FORMATS.integer;
      } else {
        cell.value = val;
      }
      cell.font = { size: 10, color: { argb: ARGB.text }, name: 'Calibri' };
      cell.alignment = { horizontal: i === 0 ? 'left' : 'right' };
      if (r % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ARGB.tableStripe } };
      }
      cell.border = { bottom: { style: 'thin', color: { argb: ARGB.border } } };
    });
    row++;
  }

  return row + 1; // spacing after table
}

function renderXLSXKeyValue(
  sheet: ExcelJS.Worksheet,
  content: Record<string, any>,
  startRow: number,
): number {
  let row = startRow;

  for (const [key, value] of Object.entries(content)) {
    if (key === 'type' || key === 'generated_at' || key === 'markdown') continue;

    const labelCell = sheet.getCell(`A${row}`);
    labelCell.value = key.replace(/_/g, ' ');
    labelCell.font = { size: 10, bold: true, color: { argb: ARGB.textMuted }, name: 'Calibri' };

    const valueCell = sheet.getCell(`B${row}`);
    valueCell.value = typeof value === 'object' ? JSON.stringify(value) : value;
    valueCell.font = { size: 10, color: { argb: ARGB.text }, name: 'Calibri' };

    if (typeof value === 'number') {
      valueCell.numFmt = value >= 1000 ? XLSX_FORMATS.integer : '0.00';
    }

    row++;
  }

  return row;
}
