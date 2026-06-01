import { useCallback, useEffect, useRef, useState } from "react";
import { authHeaders } from "./useAuth";

/* Mobile data-room share-links hook — the mobile-parity twin of the desktop
   `loadShareLinks` / `createShareLink` / `revokeShareLink` flow in
   client/src/components/chat/DataRoom.tsx. Reads, creates, and revokes the
   REAL CIM share links for a deal so the mobile data room can hand a buyer a
   blind / teaser / full link instead of a dead Share button.

   Endpoint contract (server/routes/shareLinks.ts):
     LIST   GET    /api/deals/:dealId/share-links   → MobileShareLink[]
     CREATE POST   /api/deals/:dealId/share-links   body {
              livingCimId, accessLevel, requiresNda, maxViews, expiresInDays }
     REVOKE DELETE /api/share-links/:linkId

   The backend hard-requires `livingCimId` (the link points at the deal's
   living CIM). When the deal has no living CIM, the caller leaves it null and
   the create call is never made — the UI shows a graceful "generate a CIM
   first" state instead. The shareable URL is client-side: `${origin}/shared/:token`.

   No fetch happens when `dealId` is null (anon / no-deal context). */

export interface MobileShareLink {
  id: number;
  token: string;
  access_level: "blind" | "teaser" | "full";
  requires_nda: boolean;
  view_count: number;
  max_views: number | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

/** Options for creating a share link. `livingCimId` is required by the backend;
 *  the other fields default server-side (accessLevel→'blind', requiresNda→false,
 *  maxViews→unlimited, no expiry). */
export interface CreateShareLinkOptions {
  livingCimId: number;
  accessLevel: "blind" | "teaser" | "full";
  requiresNda?: boolean;
  /** NULL / undefined = unlimited views. */
  maxViews?: number | null;
  /** Number of days until the link expires. Undefined = never expires. */
  expiresInDays?: number | null;
}

export interface MobileShareLinksState {
  loading: boolean;
  error: string | null;
  /** All links for the deal (active + revoked), newest first, as returned by
   *  the backend. Consumers filter on `revoked_at` to show active vs revoked. */
  links: MobileShareLink[];
  /** Re-fetch the link list. Resolves once state is updated. */
  refresh: () => Promise<void>;
  /** Create a new share link. Refreshes the list on success. Throws (with the
   *  backend message) on failure so the caller can surface it inline. */
  createLink: (opts: CreateShareLinkOptions) => Promise<MobileShareLink>;
  /** Revoke (soft-delete) a link. Refreshes the list on success. Throws on
   *  failure. */
  revokeLink: (linkId: number) => Promise<void>;
}

/** Parse a fetch Response, throwing the backend `error` string when present so
 *  the UI can surface a real message instead of a bare HTTP code. */
async function readJsonOrThrow(res: Response): Promise<any> {
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload?.error || `HTTP ${res.status}`);
  return payload;
}

export function useMobileShareLinks(dealId: number | null): MobileShareLinksState {
  const [links, setLinks] = useState<MobileShareLink[]>([]);
  const [loading, setLoading] = useState<boolean>(dealId != null);
  const [error, setError] = useState<string | null>(null);
  // Tracks the latest in-flight load so a stale fetch can't clobber a newer one.
  const loadSeq = useRef(0);

  const load = useCallback(async (): Promise<void> => {
    if (dealId == null) {
      loadSeq.current += 1;
      setLinks([]);
      setLoading(false);
      setError(null);
      return;
    }
    const seq = ++loadSeq.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/deals/${dealId}/share-links`, { headers: authHeaders() });
      const payload = (await readJsonOrThrow(res)) as MobileShareLink[];
      if (seq !== loadSeq.current) return; // superseded
      setLinks(Array.isArray(payload) ? payload : []);
      setLoading(false);
    } catch (err: any) {
      if (seq !== loadSeq.current) return;
      setLinks([]);
      setLoading(false);
      setError(err?.message || "Failed to load share links");
    }
  }, [dealId]);

  useEffect(() => {
    void load();
    return () => { loadSeq.current += 1; }; // cancel any in-flight load on unmount/dep change
  }, [load]);

  const refresh = useCallback(() => load(), [load]);

  const createLink = useCallback(
    async (opts: CreateShareLinkOptions): Promise<MobileShareLink> => {
      if (dealId == null) throw new Error("No deal context");
      const res = await fetch(`/api/deals/${dealId}/share-links`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          livingCimId: opts.livingCimId,
          accessLevel: opts.accessLevel,
          requiresNda: opts.requiresNda ?? false,
          maxViews: opts.maxViews ?? null,
          expiresInDays: opts.expiresInDays ?? null,
        }),
      });
      const payload = (await readJsonOrThrow(res)) as MobileShareLink;
      await load();
      return payload;
    },
    [dealId, load],
  );

  const revokeLink = useCallback(
    async (linkId: number): Promise<void> => {
      const res = await fetch(`/api/share-links/${linkId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      await readJsonOrThrow(res);
      await load();
    },
    [load],
  );

  return { loading, error, links, refresh, createLink, revokeLink };
}
