/**
 * PPTX Export Service — Professional pitch deck generation.
 *
 * Uses pptxgenjs to create investor pitch decks from deliverable content.
 * Designed for the Raise journey's pitchDeckGenerator output.
 */
import PptxGenJS from 'pptxgenjs';

const BRAND = {
  accent: 'BA3C60',
  accentRgb: '186, 60, 96',
  text: '1A1A18',
  textMuted: '6E6A63',
  textLight: 'A9A49C',
  bg: 'FFFFFF',
  bgAlt: 'FAF8F4',
  border: 'DDD9D1',
};

const FONT = {
  heading: 'Helvetica',
  body: 'Helvetica',
};

interface SlideContent {
  title?: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
  notes?: string;
  layout?: 'title' | 'section' | 'content' | 'two-column' | 'table';
}

function addBrandBar(slide: PptxGenJS.Slide) {
  // Thin accent bar at bottom
  slide.addShape('rect', {
    x: 0, y: 7.15, w: 13.33, h: 0.1,
    fill: { color: BRAND.accent },
  });
  // Footer text
  slide.addText('smbx.ai  |  Confidential', {
    x: 0.5, y: 7.3, w: 12.33, h: 0.2,
    fontSize: 7, color: BRAND.textLight, fontFace: FONT.body,
    align: 'right',
  });
}

function addTitleSlide(pptx: PptxGenJS, content: Record<string, any>) {
  const slide = pptx.addSlide();
  slide.background = { color: BRAND.bgAlt };

  // Brand mark
  slide.addText([
    { text: 'smbx', options: { fontSize: 14, bold: true, color: BRAND.text, fontFace: FONT.heading } },
    { text: '.', options: { fontSize: 14, bold: true, color: BRAND.accent, fontFace: FONT.heading } },
    { text: 'ai', options: { fontSize: 14, color: BRAND.textMuted, fontFace: FONT.body } },
  ], { x: 0.5, y: 0.3, w: 3, h: 0.4 });

  // Accent line
  slide.addShape('rect', {
    x: 0.5, y: 3.2, w: 2, h: 0.04,
    fill: { color: BRAND.accent },
  });

  // Company name
  slide.addText(content.company_name || content.business_name || 'Company Name', {
    x: 0.5, y: 3.5, w: 12, h: 1,
    fontSize: 36, bold: true, color: BRAND.text, fontFace: FONT.heading,
  });

  // Raise amount / subtitle
  const subtitle = content.raise_amount
    ? `$${(content.raise_amount / 100).toLocaleString()} Capital Raise`
    : content.subtitle || 'Investor Presentation';
  slide.addText(subtitle, {
    x: 0.5, y: 4.5, w: 12, h: 0.6,
    fontSize: 18, color: BRAND.textMuted, fontFace: FONT.body,
  });

  // Date
  slide.addText(new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long',
  }), {
    x: 0.5, y: 5.3, w: 12, h: 0.4,
    fontSize: 11, color: BRAND.textLight, fontFace: FONT.body,
  });

  // Confidentiality
  slide.addText('CONFIDENTIAL — For authorized recipients only', {
    x: 0.5, y: 6.8, w: 12, h: 0.3,
    fontSize: 8, color: BRAND.textLight, fontFace: FONT.body,
  });

  addBrandBar(slide);

  if (content.notes) slide.addNotes(content.notes);
}

function addSectionSlide(pptx: PptxGenJS, title: string, notes?: string) {
  const slide = pptx.addSlide();
  slide.background = { color: BRAND.bg };

  slide.addShape('rect', {
    x: 0.5, y: 3.3, w: 1.5, h: 0.04,
    fill: { color: BRAND.accent },
  });

  slide.addText(title, {
    x: 0.5, y: 3.6, w: 12, h: 0.8,
    fontSize: 28, bold: true, color: BRAND.text, fontFace: FONT.heading,
  });

  addBrandBar(slide);
  if (notes) slide.addNotes(notes);
}

function addContentSlide(pptx: PptxGenJS, sc: SlideContent) {
  const slide = pptx.addSlide();
  slide.background = { color: BRAND.bg };

  // Slide title
  if (sc.title) {
    slide.addText(sc.title, {
      x: 0.5, y: 0.3, w: 12, h: 0.6,
      fontSize: 20, bold: true, color: BRAND.text, fontFace: FONT.heading,
    });
    // Title underline
    slide.addShape('rect', {
      x: 0.5, y: 0.9, w: 12, h: 0.015,
      fill: { color: BRAND.border },
    });
  }

  let yPos = sc.title ? 1.2 : 0.5;

  // Body text
  if (sc.body) {
    slide.addText(sc.body, {
      x: 0.5, y: yPos, w: 12, h: 2.5,
      fontSize: 13, color: BRAND.text, fontFace: FONT.body,
      lineSpacingMultiple: 1.4,
      valign: 'top',
    });
    yPos += 2.8;
  }

  // Bullet points
  if (sc.bullets && sc.bullets.length > 0) {
    const bulletText = sc.bullets.map(b => ({
      text: b,
      options: {
        fontSize: 12, color: BRAND.text, fontFace: FONT.body,
        bullet: { type: 'bullet' as const },
        lineSpacingMultiple: 1.5,
        paraSpaceAfter: 6,
      },
    }));
    slide.addText(bulletText, {
      x: 0.7, y: yPos, w: 11.5, h: 4,
      valign: 'top',
    });
  }

  // Table
  if (sc.table) {
    const { headers, rows } = sc.table;
    const tableData: PptxGenJS.TableRow[] = [];

    // Header row
    tableData.push(headers.map(h => ({
      text: h,
      options: {
        bold: true, fontSize: 9, color: BRAND.textMuted, fontFace: FONT.body,
        fill: { color: BRAND.bgAlt },
        border: [
          { type: 'none' as const },
          { type: 'none' as const },
          { type: 'solid' as const, color: BRAND.accent, pt: 1.5 },
          { type: 'none' as const },
        ] as PptxGenJS.BorderOptions[],
        align: 'left' as const,
        valign: 'bottom' as const,
        margin: [4, 6, 4, 6] as [number, number, number, number],
      },
    })));

    // Data rows
    rows.forEach((row, idx) => {
      tableData.push(row.map((cell, colIdx) => ({
        text: cell,
        options: {
          fontSize: 10, color: BRAND.text, fontFace: FONT.body,
          fill: idx % 2 === 1 ? { color: BRAND.bgAlt } : undefined,
          border: [
            { type: 'none' as const },
            { type: 'none' as const },
            { type: 'solid' as const, color: BRAND.border, pt: 0.5 },
            { type: 'none' as const },
          ] as PptxGenJS.BorderOptions[],
          align: colIdx === 0 ? 'left' as const : 'right' as const,
          margin: [3, 6, 3, 6] as [number, number, number, number],
        },
      })));
    });

    slide.addTable(tableData, {
      x: 0.5, y: yPos, w: 12,
      colW: headers.map(() => 12 / headers.length),
      autoPage: true,
    });
  }

  addBrandBar(slide);
  if (sc.notes) slide.addNotes(sc.notes);
}

/**
 * Generate a PPTX pitch deck from deliverable content.
 */
export async function exportToPPTX(
  content: Record<string, any>,
  title: string,
): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.author = 'smbx.ai';
  pptx.company = 'smbx.ai';
  pptx.title = title;
  pptx.subject = 'Investor Presentation';
  pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
  pptx.defineLayout({ name: 'WIDE', width: 13.33, height: 7.5 });

  // Slide 1: Title
  addTitleSlide(pptx, content);

  // Build slides from structured content
  const sections = content.sections || content.slides || [];

  if (sections.length > 0) {
    for (const section of sections) {
      const sectionTitle = section.title || section.name || '';
      const sectionBody = section.content || section.body || section.text || '';
      const sectionBullets: string[] = section.bullets || section.items || section.key_points || [];
      const sectionNotes = section.notes || section.speaker_notes || '';

      // Build table if present
      let table: { headers: string[]; rows: string[][] } | undefined;
      if (section.table && Array.isArray(section.table) && section.table.length > 0) {
        const headers = Object.keys(section.table[0]);
        const rows = section.table.map((r: Record<string, any>) =>
          headers.map(h => r[h] != null ? String(r[h]) : '—')
        );
        table = { headers: headers.map(h => h.replace(/_/g, ' ')), rows };
      }

      // Determine if this is a section divider or content slide
      if (!sectionBody && sectionBullets.length === 0 && !table) {
        addSectionSlide(pptx, sectionTitle, sectionNotes);
      } else {
        addContentSlide(pptx, {
          title: sectionTitle,
          body: typeof sectionBody === 'string' ? sectionBody : undefined,
          bullets: sectionBullets,
          table,
          notes: sectionNotes,
        });
      }
    }
  } else if (content.markdown) {
    // Parse markdown into slides (split on ## headings)
    const mdSections = content.markdown.split(/^## /m).filter(Boolean);
    for (const section of mdSections) {
      const lines = section.split('\n');
      const sectionTitle = lines[0]?.replace(/\*\*/g, '').trim() || '';
      const bullets: string[] = [];
      let body = '';

      for (const line of lines.slice(1)) {
        if (line.startsWith('- ') || line.startsWith('* ')) {
          bullets.push(line.replace(/^[-*] /, '').replace(/\*\*/g, ''));
        } else if (line.trim()) {
          body += line.replace(/\*\*/g, '') + ' ';
        }
      }

      addContentSlide(pptx, {
        title: sectionTitle,
        body: body.trim() || undefined,
        bullets: bullets.length > 0 ? bullets : undefined,
      });
    }
  }

  // Thank you slide
  const thankSlide = pptx.addSlide();
  thankSlide.background = { color: BRAND.bgAlt };

  thankSlide.addText([
    { text: 'smbx', options: { fontSize: 14, bold: true, color: BRAND.text, fontFace: FONT.heading } },
    { text: '.', options: { fontSize: 14, bold: true, color: BRAND.accent, fontFace: FONT.heading } },
    { text: 'ai', options: { fontSize: 14, color: BRAND.textMuted, fontFace: FONT.body } },
  ], { x: 0.5, y: 0.3, w: 3, h: 0.4 });

  thankSlide.addText('Thank You', {
    x: 0.5, y: 2.8, w: 12, h: 1,
    fontSize: 36, bold: true, color: BRAND.text, fontFace: FONT.heading,
    align: 'center',
  });

  thankSlide.addText(content.contact_email || 'Prepared with smbx.ai', {
    x: 0.5, y: 4.0, w: 12, h: 0.5,
    fontSize: 14, color: BRAND.textMuted, fontFace: FONT.body,
    align: 'center',
  });

  addBrandBar(thankSlide);

  const arrayBuffer = await pptx.write({ outputType: 'arraybuffer' }) as ArrayBuffer;
  return Buffer.from(arrayBuffer);
}
