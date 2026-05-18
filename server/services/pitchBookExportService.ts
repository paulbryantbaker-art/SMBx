import PptxGenJS from 'pptxgenjs';
import type { PitchBookRecord, StudioSlide } from './pitchBookStudio.js';

const BRAND = {
  ink: '162033',
  muted: '60708A',
  blue: '2E5C8A',
  periwinkle: '8A9AE8',
  ice: 'EEF5FF',
  glass: 'F7FAFF',
  line: 'D5E0EF',
  green: '6FAE95',
  amber: 'C9A24E',
};

export async function exportPitchBookToPPTX(book: PitchBookRecord): Promise<Buffer> {
  const PptxCtor = typeof PptxGenJS === 'function'
    ? PptxGenJS
    : (PptxGenJS as unknown as { default: typeof PptxGenJS }).default;
  const pptx = new PptxCtor();
  pptx.author = 'smbx.ai';
  pptx.company = 'smbx.ai';
  pptx.subject = 'Source-grounded pitch book';
  pptx.title = book.title;
  pptx.layout = 'LAYOUT_WIDE';
  pptx.defineLayout({ name: 'WIDE', width: 13.33, height: 7.5 });

  addCover(pptx, book);
  for (const slide of book.slides) {
    addPitchSlide(pptx, slide, book);
  }
  addSourceAppendix(pptx, book);
  addAuditAppendix(pptx, book);

  const arrayBuffer = await pptx.write({ outputType: 'arraybuffer' }) as ArrayBuffer;
  return Buffer.from(arrayBuffer);
}

function addCover(pptx: PptxGenJS, book: PitchBookRecord) {
  const slide = pptx.addSlide();
  slide.background = { color: BRAND.ice };
  slide.addShape('rect', {
    x: 0.28, y: 0.26, w: 12.77, h: 6.98,
    rectRadius: 0.16,
    fill: { color: 'FFFFFF', transparency: 8 },
    line: { color: BRAND.line, transparency: 10, pt: 1 },
  });
  slide.addText('smbx.ai', {
    x: 0.62, y: 0.58, w: 2.4, h: 0.3,
    fontFace: 'Helvetica', fontSize: 14, bold: true, color: BRAND.blue,
  });
  slide.addText(formatLabel(book.format), {
    x: 9.5, y: 0.58, w: 2.9, h: 0.3,
    fontFace: 'Helvetica', fontSize: 9, bold: true, color: BRAND.muted,
    align: 'right',
  });
  slide.addText(book.title, {
    x: 0.72, y: 2.08, w: 9.8, h: 1.4,
    fontFace: 'Helvetica', fontSize: 32, bold: true, color: BRAND.ink,
    fit: 'shrink',
  });
  slide.addText('Source-grounded finance studio output', {
    x: 0.74, y: 3.65, w: 6.4, h: 0.34,
    fontFace: 'Helvetica', fontSize: 13, color: BRAND.muted,
  });
  slide.addShape('rect', { x: 0.74, y: 4.25, w: 2.2, h: 0.05, fill: { color: BRAND.periwinkle } });
  slide.addText([
    { text: `${book.slides.length}`, options: { bold: true, color: BRAND.ink } },
    { text: ' slides   ', options: { color: BRAND.muted } },
    { text: `${book.sources.length}`, options: { bold: true, color: BRAND.ink } },
    { text: ' linked sources   ', options: { color: BRAND.muted } },
    { text: `v${book.version}`, options: { bold: true, color: BRAND.ink } },
  ], {
    x: 0.74, y: 4.55, w: 7.2, h: 0.32,
    fontFace: 'Helvetica', fontSize: 11, color: BRAND.muted,
  });
  slide.addText('Prepared with Yulia. This book is model and source aware; unsupported claims are flagged in the audit appendix.', {
    x: 0.74, y: 6.46, w: 7.8, h: 0.34,
    fontFace: 'Helvetica', fontSize: 8.5, color: BRAND.muted,
  });
  addFooter(slide, book);
}

function addPitchSlide(pptx: PptxGenJS, item: StudioSlide, book: PitchBookRecord) {
  const slide = pptx.addSlide();
  slide.background = { color: 'FFFFFF' };
  const clean = item.warningState === 'clean';
  slide.addShape('rect', {
    x: 0.35, y: 0.32, w: 12.63, h: 6.85,
    rectRadius: 0.11,
    fill: { color: BRAND.glass },
    line: { color: BRAND.line, transparency: 8, pt: 1 },
  });
  slide.addShape('rect', {
    x: 0.35, y: 0.32, w: 0.13, h: 6.85,
    fill: { color: clean ? BRAND.periwinkle : BRAND.amber },
    line: { color: clean ? BRAND.periwinkle : BRAND.amber, transparency: 100 },
  });
  slide.addText(item.title, {
    x: 0.74, y: 0.72, w: 8.8, h: 0.54,
    fontFace: 'Helvetica', fontSize: 21, bold: true, color: BRAND.ink,
    fit: 'shrink',
  });
  if (item.subtitle) {
    slide.addText(item.subtitle, {
      x: 9.7, y: 0.76, w: 2.55, h: 0.25,
      fontFace: 'Helvetica', fontSize: 8, bold: true, color: BRAND.blue,
      align: 'right',
    });
  }
  slide.addText(item.body, {
    x: 0.78, y: 1.58, w: 6.8, h: 1.55,
    fontFace: 'Helvetica', fontSize: 14, color: BRAND.ink,
    breakLine: false,
    fit: 'shrink',
  });
  const bullets = item.bullets.slice(0, 5).map(point => ({
    text: point,
    options: {
      bullet: { type: 'bullet' as const },
      fontFace: 'Helvetica',
      fontSize: 11.5,
      color: BRAND.ink,
      breakLine: true,
    },
  }));
  if (bullets.length) {
    slide.addText(bullets, {
      x: 0.95, y: 3.35, w: 6.5, h: 2.1,
      fontFace: 'Helvetica', fontSize: 11.5, color: BRAND.ink,
      breakLine: false,
      fit: 'shrink',
    });
  }
  addProvenancePanel(slide, item);
  if (item.speakerNotes) slide.addNotes(item.speakerNotes);
  addFooter(slide, book);
}

function addProvenancePanel(slide: PptxGenJS.Slide, item: StudioSlide) {
  slide.addShape('rect', {
    x: 8.05, y: 1.45, w: 4.45, h: 4.95,
    rectRadius: 0.11,
    fill: { color: 'FFFFFF', transparency: 6 },
    line: { color: BRAND.line, transparency: 10, pt: 0.8 },
  });
  slide.addText(item.warningState === 'clean' ? 'Grounding' : 'Needs review', {
    x: 8.35, y: 1.75, w: 2.5, h: 0.28,
    fontFace: 'Helvetica', fontSize: 10, bold: true,
    color: item.warningState === 'clean' ? BRAND.green : BRAND.amber,
  });
  const lines = [
    `Facts: ${item.provenance.factsUsed.length || 0}`,
    `Models: ${item.provenance.modelOutputsUsed.join(', ') || 'not linked'}`,
    `Citations: ${item.provenance.citationsUsed.join(', ') || 'none'}`,
    `Unchecked: ${item.provenance.uncheckedClaims.length || 0}`,
  ];
  slide.addText(lines.join('\n'), {
    x: 8.35, y: 2.25, w: 3.85, h: 1.28,
    fontFace: 'Helvetica', fontSize: 8.6, color: BRAND.muted,
    breakLine: false,
    fit: 'shrink',
  });
  const facts = item.provenance.factsUsed.slice(0, 5).join('\n') || 'Add files, model outputs, or citations before external delivery.';
  slide.addText(facts, {
    x: 8.35, y: 3.8, w: 3.85, h: 1.45,
    fontFace: 'Helvetica', fontSize: 9.2, color: BRAND.ink,
    fit: 'shrink',
  });
}

function addSourceAppendix(pptx: PptxGenJS, book: PitchBookRecord) {
  const slide = pptx.addSlide();
  slide.background = { color: 'FFFFFF' };
  slide.addText('Source appendix', {
    x: 0.6, y: 0.55, w: 6, h: 0.45,
    fontFace: 'Helvetica', fontSize: 22, bold: true, color: BRAND.ink,
  });
  const rows = book.sources.slice(0, 12).map(source => [
    source.label,
    source.sourceType,
    source.citationTag || '-',
    source.status,
  ]);
  slide.addTable([
    ['Source', 'Type', 'Citation', 'Status'],
    ...rows,
  ], {
    x: 0.6, y: 1.35, w: 12.1, h: 4.9,
    border: { type: 'solid', color: BRAND.line, pt: 0.5 },
    fontFace: 'Helvetica',
    fontSize: 8.5,
    color: BRAND.ink,
    fill: { color: 'FFFFFF' },
    autoFit: false,
    colW: [5.1, 2.2, 3.2, 1.6],
  });
  addFooter(slide, book);
}

function addAuditAppendix(pptx: PptxGenJS, book: PitchBookRecord) {
  const slide = pptx.addSlide();
  slide.background = { color: BRAND.ice };
  const warnings = book.slides.filter(item => item.warningState !== 'clean');
  slide.addText('Audit appendix', {
    x: 0.65, y: 0.65, w: 6, h: 0.45,
    fontFace: 'Helvetica', fontSize: 22, bold: true, color: BRAND.ink,
  });
  slide.addText([
    { text: `${book.slides.length}`, options: { bold: true, color: BRAND.ink } },
    { text: ' slides\n', options: { color: BRAND.muted } },
    { text: `${book.sources.length}`, options: { bold: true, color: BRAND.ink } },
    { text: ' linked sources\n', options: { color: BRAND.muted } },
    { text: `${warnings.length}`, options: { bold: true, color: warnings.length ? BRAND.amber : BRAND.green } },
    { text: ' slides need source/model review', options: { color: BRAND.muted } },
  ], {
    x: 0.72, y: 1.55, w: 4.8, h: 1.3,
    fontFace: 'Helvetica', fontSize: 18,
    breakLine: false,
  });
  slide.addText('Audit note', {
    x: 6.25, y: 1.58, w: 2.4, h: 0.26,
    fontFace: 'Helvetica', fontSize: 10, bold: true, color: BRAND.blue,
  });
  slide.addText('This export records slide-level provenance, source counts, model slots, and version metadata. Treat warning slides as internal drafts until refreshed against V19 server models and source files.', {
    x: 6.25, y: 2.02, w: 5.7, h: 1.4,
    fontFace: 'Helvetica', fontSize: 11, color: BRAND.ink,
    fit: 'shrink',
  });
  slide.addText(`Book version: ${book.version}\nBook id: ${book.id}\nExported: ${new Date().toISOString()}`, {
    x: 6.25, y: 4.1, w: 5.7, h: 0.8,
    fontFace: 'Helvetica', fontSize: 9, color: BRAND.muted,
  });
  addFooter(slide, book);
}

function addFooter(slide: PptxGenJS.Slide, book: PitchBookRecord) {
  slide.addShape('line', {
    x: 0.55, y: 7.1, w: 12.2, h: 0,
    line: { color: BRAND.line, pt: 0.7, transparency: 10 },
  });
  slide.addText('smbx.ai / Yulia Pitch Book Studio', {
    x: 0.62, y: 7.18, w: 4.2, h: 0.18,
    fontFace: 'Helvetica', fontSize: 7.5, color: BRAND.muted,
  });
  slide.addText(`v${book.version} / source-grounded draft`, {
    x: 9.3, y: 7.18, w: 3.1, h: 0.18,
    fontFace: 'Helvetica', fontSize: 7.5, color: BRAND.muted,
    align: 'right',
  });
}

function formatLabel(value: string): string {
  return value.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}
