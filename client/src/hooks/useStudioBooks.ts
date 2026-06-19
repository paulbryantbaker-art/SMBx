/**
 * Studio pitch-book data layer — the client over the `/api/studio/*` engine
 * (server/routes/studio.ts → server/services/pitchBookStudio.ts).
 *
 * This is the provenance-rich deck builder: a pitch book is a versioned,
 * model-backed deck. Creating one scaffolds slides from the format outline;
 * "refresh from models" runs the bound V19 models and links their outputs +
 * citations onto each slide, with honest per-slide warning states. Readiness
 * gates external delivery; export carries an audit packet.
 *
 * Types mirror the server (pitchBookStudio.ts + v19ReadinessService.ts +
 * v19EntitlementService.ts). Every mutation can be tollgated (plan / credits /
 * approval) — those come back as a `tollgate`, never thrown, so the UI can show
 * an honest upgrade path instead of a crash.
 *
 * Auth + dev-bypass guard mirror useV6WorkspaceData: under DEV_AUTH_BYPASS there
 * is no real JWT, so we don't fetch (the routes are RBAC/JWT-gated) — the UI
 * shows the honest empty state.
 */
import { useCallback, useEffect, useState } from "react";
import { DEV_AUTH_BYPASS, authHeaders, type User } from "./useAuth";

/* ─── types (mirror the server) ───────────────────────────── */

export type PitchBookFormat =
  | "buyer-pitch-book"
  | "seller-pitch-book"
  | "ic-deck"
  | "qoe-preview-book"
  | "cim-summary-deck"
  | "board-update"
  | "lender-book";

export type SlideWarning = "clean" | "needs_sources" | "stale_models";

export interface StudioSlideProvenance {
  factsUsed: string[];
  modelOutputsUsed: string[];
  citationsUsed: string[];
  uncheckedClaims: string[];
}

export interface StudioSlide {
  id: string;
  title: string;
  subtitle?: string;
  body: string;
  bullets: string[];
  speakerNotes: string;
  provenance: StudioSlideProvenance;
  warningState: SlideWarning;
}

export interface StudioSource {
  id?: number;
  sourceType: string;
  sourceId?: string | null;
  label: string;
  citationTag?: string | null;
  sourceUrl?: string | null;
  status: "linked" | "missing" | "stale";
  metadata?: Record<string, unknown>;
}

export interface PitchBookRecord {
  id: number;
  dealId: number | null;
  title: string;
  format: PitchBookFormat;
  status: string;
  brief: string | null;
  versionId: number | null;
  version: number;
  outline: string[];
  slides: StudioSlide[];
  assumptions: Array<Record<string, unknown>>;
  modelOutputs: Array<Record<string, unknown>>;
  provenance: Record<string, unknown>;
  audit: Record<string, unknown>;
  sources: StudioSource[];
  updatedAt: string;
  createdAt: string;
}

export type ReadinessSeverity = "blocker" | "warning" | "info";

export interface ReadinessIssue {
  code: string;
  severity: ReadinessSeverity;
  label: string;
  detail: string;
  resourceUri?: string;
}

export interface StudioReadiness {
  bookId: number;
  title: string;
  format: string;
  slideGaps: number;
  sourceGaps: number;
  modelGaps: number;
  uncheckedClaims: number;
  issues: ReadinessIssue[];
  readyForInternalDraft: boolean;
  readyForExternalDelivery: boolean;
  dealReadiness?: Record<string, unknown> | null;
  citationValidation?: Record<string, unknown>;
}

export interface StudioFormatInfo {
  id: PitchBookFormat;
  label: string;
  outline: string[];
  models: string[];
}

/** A plan/credits/approval gate the engine can return (402/403/428). Shown to
 *  the user as an honest upgrade path — never thrown. */
export interface StudioTollgate {
  code: string;
  state?: string;
  title?: string;
  message: string;
  requiredPlan?: string | null;
  currentPlan?: string | null;
  resolution?: string | null;
}

/** A book mutation either succeeds (book + readiness) or is tollgated. */
export type BookOutcome =
  | { ok: true; book: PitchBookRecord; readiness: StudioReadiness }
  | { ok: false; tollgate?: StudioTollgate; error?: string };

/* ─── low-level fetch (JSON, with tollgate detection) ─────── */

interface JsonResult<T> {
  status: number;
  ok: boolean;
  data: T | null;
  tollgate?: StudioTollgate;
  error?: string;
}

async function studioJson<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<JsonResult<T>> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(init?.headers || {}) },
  });
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (res.ok) {
    return { status: res.status, ok: true, data: body as T };
  }
  const b = (body ?? {}) as { error?: string; tollgate?: StudioTollgate };
  // 402 credits / 403 scope / 428 approval all carry a tollgate envelope.
  const tollgate =
    b.tollgate ?? (res.status === 402 || res.status === 403 || res.status === 428
      ? { code: "plan_required", message: b.error || "This action isn't available on your current plan." }
      : undefined);
  return { status: res.status, ok: false, data: null, tollgate, error: b.error || `HTTP ${res.status}` };
}

function outcomeFrom(r: JsonResult<{ book: PitchBookRecord; readiness: StudioReadiness }>): BookOutcome {
  if (r.ok && r.data) return { ok: true, book: r.data.book, readiness: r.data.readiness };
  return { ok: false, tollgate: r.tollgate, error: r.error };
}

/* ─── the 7 formats (GET /api/studio/formats) ─────────────── */

export function useStudioFormats() {
  const [formats, setFormats] = useState<StudioFormatInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    studioJson<{ formats: StudioFormatInfo[] }>("/api/studio/formats", { method: "GET" })
      .then((r) => {
        if (!alive) return;
        setFormats(r.data?.formats ?? []);
        setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return { formats, loading };
}

/* ─── the book list (GET /api/studio/pitch-books) + create ── */

export function useStudioBooks(user: User | null) {
  const canFetch = !!user && !DEV_AUTH_BYPASS;
  const [books, setBooks] = useState<PitchBookRecord[]>([]);
  const [loading, setLoading] = useState(canFetch);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!canFetch) {
      setBooks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const r = await studioJson<{ books: PitchBookRecord[] }>("/api/studio/pitch-books", { method: "GET" });
    if (r.ok) setBooks(r.data?.books ?? []);
    else setError(r.error ?? "Failed to load pitch books");
    setLoading(false);
  }, [canFetch]);

  useEffect(() => {
    void load();
  }, [load, user?.id]);

  const createBook = useCallback(
    async (input: { dealId: number | null; format: PitchBookFormat; title?: string; brief?: string }): Promise<BookOutcome> => {
      const r = await studioJson<{ book: PitchBookRecord; readiness: StudioReadiness }>(
        "/api/studio/pitch-books",
        { method: "POST", body: JSON.stringify(input) },
      );
      const outcome = outcomeFrom(r);
      if (outcome.ok) setBooks((prev) => [outcome.book, ...prev.filter((b) => b.id !== outcome.book.id)]);
      return outcome;
    },
    [],
  );

  return { books, loading, error, canFetch, refresh: load, createBook };
}

/* ─── a single book (GET/refresh/revise/add-section) ──────── */

export function useStudioBook(user: User | null, bookId: number | null) {
  const canFetch = !!user && !DEV_AUTH_BYPASS && bookId != null;
  const [book, setBook] = useState<PitchBookRecord | null>(null);
  const [readiness, setReadiness] = useState<StudioReadiness | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!canFetch) {
      setBook(null);
      setReadiness(null);
      return;
    }
    setLoading(true);
    setError(null);
    const r = await studioJson<{ book: PitchBookRecord; readiness: StudioReadiness }>(
      `/api/studio/pitch-books/${bookId}`,
      { method: "GET" },
    );
    if (r.ok && r.data) {
      setBook(r.data.book);
      setReadiness(r.data.readiness);
    } else {
      setError(r.error ?? "Failed to load pitch book");
    }
    setLoading(false);
  }, [canFetch, bookId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Mutations all return {book, readiness} or a tollgate; on success we update
  // local state so the workspace re-renders immediately.
  const runMutation = useCallback(
    async (path: string, init: RequestInit): Promise<BookOutcome> => {
      setBusy(true);
      const r = await studioJson<{ book: PitchBookRecord; readiness: StudioReadiness }>(path, init);
      const outcome = outcomeFrom(r);
      if (outcome.ok) {
        setBook(outcome.book);
        setReadiness(outcome.readiness);
      }
      setBusy(false);
      return outcome;
    },
    [],
  );

  const refreshFromModels = useCallback(
    () => runMutation(`/api/studio/pitch-books/${bookId}/refresh`, { method: "POST", body: "{}" }),
    [runMutation, bookId],
  );

  const revise = useCallback(
    (instruction: string) =>
      runMutation(`/api/studio/pitch-books/${bookId}/revise`, {
        method: "POST",
        body: JSON.stringify({ instruction }),
      }),
    [runMutation, bookId],
  );

  const addSection = useCallback(
    (section: { title: string; body?: string; bullets?: string[] }) =>
      runMutation(`/api/studio/pitch-books/${bookId}/sections`, {
        method: "POST",
        body: JSON.stringify(section),
      }),
    [runMutation, bookId],
  );

  return { book, readiness, loading, error, busy, reload: load, refreshFromModels, revise, addSection };
}

/* ─── export (GET /api/studio/pitch-books/:id/export/:format) ─ */

export interface ExportResult {
  blob: Blob;
  filename: string;
  outputHash: string | null;
  ready: boolean;
}

/** Download a pitch book as PPTX or PDF. `strict` makes the server refuse
 *  (409) when the book isn't ready for external delivery — the UI uses the
 *  readiness gate to decide. Throws on error (incl. a 409 readiness block). */
export async function exportPitchBook(
  bookId: number,
  format: "pptx" | "pdf",
  strict = false,
): Promise<ExportResult> {
  const qs = strict ? "?strict=1" : "";
  const res = await fetch(`/api/studio/pitch-books/${bookId}/export/${format}${qs}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      message = j.error || message;
    } catch {}
    throw new Error(message);
  }
  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^"]+)"?/i);
  return {
    blob,
    filename: match?.[1] || `smbx-pitch-book.${format}`,
    outputHash: res.headers.get("x-smbx-output-hash"),
    ready: res.headers.get("x-smbx-v19-ready") === "true",
  };
}

/* ─── small display helpers ───────────────────────────────── */

export const FORMAT_BLURB: Record<PitchBookFormat, string> = {
  "buyer-pitch-book": "Pitch a target to a buyer or committee.",
  "seller-pitch-book": "Take a business to the buyer universe.",
  "ic-deck": "Investment-committee decision deck.",
  "qoe-preview-book": "Quality-of-earnings preview for diligence.",
  "cim-summary-deck": "Condensed CIM for first looks.",
  "board-update": "Portfolio + deals-in-motion update.",
  "lender-book": "Credit package for a lender.",
};
