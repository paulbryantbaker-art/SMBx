export interface ChatArtifactRoutingResult {
  opened: boolean;
  /** Stable canvas tab id the chat message can later reuse to re-open the
   *  artifact (nav.openCanvas). Empty string when nothing was opened. */
  id: string;
  title: string;
  chatMessage: string;
}

/** What the chat message stores so it can offer an "Open on canvas" control. */
export interface CanvasArtifactRef {
  id: string;
  title: string;
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
    return { opened: false, id: "", title: "", chatMessage: content };
  }

  const title = inferArtifactTitle(trimmed);
  // Stable id shared with the shell listener (it registers/navigates under this
  // exact id) AND returned to the caller so the chat message can re-open it.
  const id = `artifact-content-${Date.now()}`;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("smbx:canvas_action", {
      detail: {
        canvas_action: "show_content",
        artifactId: id,
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
    id,
    title,
    chatMessage: `I opened "${title}" on the canvas so we can work it visually. Tell me what assumption, section, or chart you want changed.`,
  };
}

/** Forward a server tool's canvas_action to the shell listener and, when the
 *  action lands on a navigable canvas panel, hand back the {id,title} so the
 *  chat message can offer an "Open on canvas" control afterwards. Returns null
 *  for actions with no navigation target (e.g. update_model) — the event still
 *  fires either way. */
export function dispatchCanvasActionResult(result: unknown): CanvasArtifactRef | null {
  if (!result || typeof window === "undefined") return null;
  try {
    const parsed = typeof result === "string" ? JSON.parse(result) : result;
    if (!parsed || typeof parsed !== "object") return null;
    const detail = parsed as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (typeof detail.canvas_action !== "string") return null;
    const target = canvasNavTargetFor(detail);
    // Share the computed id with the shell listener so the registered artifact
    // and the chat message's "Open on canvas" control point at the SAME tab.
    if (target && !detail.artifactId) detail.artifactId = target.id;
    window.dispatchEvent(new CustomEvent("smbx:canvas_action", { detail: parsed }));
    return target;
  } catch {
    return null;
  }
}

/** The canvas tab a server canvas_action will land on, if navigable. Mirrors the
 *  id logic in AtlasApp / AtlasMobileApp so the chat message can later re-open
 *  the exact same tab via nav.openCanvas(id). */
function canvasNavTargetFor(detail: Record<string, any>): CanvasArtifactRef | null { // eslint-disable-line @typescript-eslint/no-explicit-any
  switch (detail.canvas_action) {
    case "show_content": {
      const id =
        typeof detail.artifactId === "string" && detail.artifactId
          ? detail.artifactId
          : `artifact-content-${Date.now()}`;
      return {
        id,
        title: typeof detail.title === "string" && detail.title ? detail.title : "Yulia artifact",
      };
    }
    case "open_tab": {
      const tab = detail.tab;
      if (!tab || tab.kind !== "analysis") return null;
      const id =
        typeof detail.artifactId === "string" && detail.artifactId
          ? detail.artifactId
          : `artifact-${tab.analysisRunId ?? detail.analysisRunId ?? Date.now()}`;
      return { id, title: tab.title || detail.title || "Analysis" };
    }
    case "create_model_tab": {
      // Interactive model: the store keys by detail.tabId, which is also the
      // canvas navigation id (the shell navigates to ensured.tabId === tabId).
      if (typeof detail.tabId === "string" && detail.tabId) {
        return {
          id: detail.tabId,
          title: typeof detail.title === "string" && detail.title ? detail.title : "Interactive model",
        };
      }
      return null;
    }
    default:
      return null; // update_model, read_tab_state, etc. — nothing to navigate to.
  }
}

function inferArtifactTitle(content: string): string {
  const heading = content.match(/^#{1,3}\s+(.+?)\s*$/m)?.[1];
  const boldLine = content.match(/^\s*\*\*(.+?)\*\*\s*$/m)?.[1];
  const phraseLine = content
    .split(/\r?\n/)
    .find(line => /analysis|valuation|risk|buyer|market/i.test(line) && line.trim().length > 8);

  const candidate = heading || boldLine || phraseLine || "Yulia analysis artifact";
  const trailingTitlePunctuation = new RegExp("\\s*[\\-:|]\\s*$", "g");
  const cleaned = candidate
    .replace(/[*_`#]/g, "")
    .replace(/\bfull\s+analysis\s+canvas\b/ig, "")
    .replace(/\banalysis\s+canvas\b/ig, "")
    .replace(/\s+/g, " ")
    .replace(/[\u2013\u2014\u00b7]\s*$/g, "")
    .replace(trailingTitlePunctuation, "")
    .trim();

  return truncateTitle(cleaned || "Yulia analysis artifact");
}

function truncateTitle(title: string): string {
  if (title.length <= 84) return title;
  return `${title.slice(0, 81).trim()}...`;
}
