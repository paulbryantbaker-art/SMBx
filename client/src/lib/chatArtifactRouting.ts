export interface ChatArtifactRoutingResult {
  opened: boolean;
  title: string;
  chatMessage: string;
}

const ARTIFACT_PHRASES = [
  /full\s+analysis\s+canvas/i,
  /analysis\s+canvas/i,
  /canvas\s+artifact/i,
  /tableau\s+view/i,
  /interactive\s+canvas/i,
];

const ANALYSIS_TERMS = [
  /valuation/i,
  /recast/i,
  /\bsde\b/i,
  /\bebitda\b/i,
  /\bdscr\b/i,
  /buyer\s+(fit|demand)/i,
  /risk/i,
  /tax/i,
  /legal/i,
  /market/i,
  /multiple/i,
  /deal\s+score/i,
  /recommendation/i,
  /scenario/i,
];

function countMatches(content: string, pattern: RegExp): number {
  return content.match(pattern)?.length ?? 0;
}

function countAnalysisTerms(content: string): number {
  return ANALYSIS_TERMS.reduce((sum, pattern) => sum + (pattern.test(content) ? 1 : 0), 0);
}

export function shouldRouteChatArtifact(content: string): boolean {
  const text = content.trim();
  if (!text) return false;

  const hasMarkdownTable = /^\s*\|.+\|\s*$/m.test(text) && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/m.test(text);
  const headingCount = countMatches(text, /^#{2,4}\s+/gm);
  const termCount = countAnalysisTerms(text);
  const numericSignalCount = countMatches(text, /\$[\d,.]+(?:\s?(?:K|M|B|MM|million|billion))?|\b\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?x\b/gi);
  const hasArtifactPhrase = ARTIFACT_PHRASES.some(pattern => pattern.test(text));

  if (isTransientArtifactScaffold(text) && !hasMarkdownTable && headingCount < 2) return false;
  if (hasArtifactPhrase && text.length > 420 && (hasMarkdownTable || headingCount >= 2 || numericSignalCount >= 4)) return true;

  if (hasMarkdownTable && termCount >= 1 && text.length > 500) return true;
  if (headingCount >= 3 && termCount >= 2 && numericSignalCount >= 3 && text.length > 900) return true;
  if (text.length > 1300 && termCount >= 3 && numericSignalCount >= 5) return true;

  return false;
}

function isTransientArtifactScaffold(content: string): boolean {
  return /here(?:'s| is)\s+what\s+i'?m\s+loading\s+into\s+the\s+model/i.test(content)
    || /loading\s+(this|it|the\s+analysis)\s+into\s+the\s+(model|canvas)/i.test(content)
    || /let\s+me\s+(run|load|build)\s+the\s+(model|analysis|canvas)/i.test(content);
}

export function chatArtifactStreamingMessage(content: string): string {
  const title = inferArtifactTitle(content);
  return `Opening "${title}" on the canvas so this stays visual and editable.`;
}

export function routeChatArtifactToCanvas(content: string, source: string): ChatArtifactRoutingResult {
  const trimmed = content.trim();
  if (!shouldRouteChatArtifact(trimmed)) {
    return { opened: false, title: "", chatMessage: content };
  }

  const title = inferArtifactTitle(trimmed);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("smbx:canvas_action", {
      detail: {
        canvas_action: "show_content",
        title,
        content: trimmed,
        markdown: trimmed,
        source,
        artifactKind: "chat_markdown_analysis",
        generatedAt: new Date().toISOString(),
      },
    }));
  }

  return {
    opened: true,
    title,
    chatMessage: `I opened "${title}" on the canvas so we can work it visually. Tell me what assumption, section, or chart you want changed.`,
  };
}

export function dispatchCanvasActionResult(result: unknown): boolean {
  if (!result || typeof window === "undefined") return false;
  try {
    const parsed = typeof result === "string" ? JSON.parse(result) : result;
    if (!parsed || typeof parsed !== "object") return false;
    const detail = parsed as { canvas_action?: unknown };
    if (typeof detail.canvas_action !== "string") return false;
    window.dispatchEvent(new CustomEvent("smbx:canvas_action", { detail: parsed }));
    return true;
  } catch {
    return false;
  }
}

function inferArtifactTitle(content: string): string {
  const heading = content.match(/^#{1,3}\s+(.+?)\s*$/m)?.[1];
  const boldLine = content.match(/^\s*\*\*(.+?)\*\*\s*$/m)?.[1];
  const phraseLine = content
    .split(/\r?\n/)
    .find(line => /analysis|valuation|risk|buyer|market/i.test(line) && line.trim().length > 8);

  const candidate = heading || boldLine || phraseLine || "Yulia analysis artifact";
  const cleaned = candidate
    .replace(/[*_`#]/g, "")
    .replace(/\bfull\s+analysis\s+canvas\b/ig, "")
    .replace(/\banalysis\s+canvas\b/ig, "")
    .replace(/\s+/g, " ")
    .replace(/[\u2013\u2014\u00b7]\s*$/g, "")
    .replace(/\s*[-:|]\s*$/g, "")
    .trim();

  return truncateTitle(cleaned || "Yulia analysis artifact");
}

function truncateTitle(title: string): string {
  if (title.length <= 84) return title;
  return `${title.slice(0, 81).trim()}...`;
}
