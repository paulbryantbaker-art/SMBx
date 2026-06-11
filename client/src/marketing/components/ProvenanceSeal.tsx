import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * ProvenanceSeal — the brand's signature object: a slightly rotated audit
 * stamp that SIGNS the exhibit it sits under. The hash is real: a SHA-256
 * digest of the exhibit's inputs, computed with SubtleCrypto in the visitor's
 * own tab ("computed in your browser just now" — true by construction, per
 * THE LINE wording gate: we never claim "matches app" until that pipeline
 * exists).
 *
 * When inputs change, the digest recomputes (debounced) and the short hash
 * re-resolves character by character — cycling hex glyphs locking left to
 * right (~700ms) — then prints the ✓, the only green on the surface.
 * Reduced motion: the resolved hash renders immediately, no cycling.
 */

const HEX = '0123456789abcdef';

async function sha256Hex(payload: string): Promise<string> {
  const data = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Short display form: first 6 + last 4 nibbles, ellipsis joined. */
function shortHash(full: string): string {
  return `${full.slice(0, 6)}…${full.slice(-4)}`;
}

export function ProvenanceSeal({
  inputs,
  modelId,
  version = 'V19',
  note,
  dark = false,
}: {
  /** The exhibit's actual input object — what gets digested. */
  inputs: unknown;
  /** e.g. "MODEL.valuation.v1" */
  modelId: string;
  version?: string;
  /** Optional caption under the stamp, e.g. "computed in your browser just now". */
  note?: string;
  /** Dark-surface variant (hero / dark bands). */
  dark?: boolean;
}) {
  const reduce = !!useReducedMotion();
  const payload = JSON.stringify(inputs);
  const [display, setDisplay] = useState('');
  const [resolved, setResolved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Debounce live-input churn (e.g. a dragging knob) before re-digesting.
    if (debounceRef.current) clearTimeout(debounceRef.current);
    let cancelled = false;

    debounceRef.current = setTimeout(async () => {
      let full: string;
      try {
        full = await sha256Hex(payload);
      } catch {
        // Non-secure context (no SubtleCrypto): show nothing rather than fake.
        if (!cancelled) { setDisplay(''); setResolved(false); }
        return;
      }
      if (cancelled) return;
      const target = shortHash(full);

      if (reduce) {
        setDisplay(target);
        setResolved(true);
        return;
      }

      // Character-resolve: cycle random hex glyphs, locking left → right.
      setResolved(false);
      if (timerRef.current) clearInterval(timerRef.current);
      let lock = 0;
      const ticksPerLock = 2; // ~40ms/tick × 2 × 11 chars ≈ 700ms more
      let tick = 0;
      timerRef.current = setInterval(() => {
        tick += 1;
        if (tick % ticksPerLock === 0) lock += 1;
        if (lock >= target.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          setDisplay(target);
          setResolved(true);
          return;
        }
        const head = target.slice(0, lock);
        const tail = target
          .slice(lock)
          .split('')
          .map((c) => (c === '…' ? '…' : HEX[Math.floor(Math.random() * 16)]))
          .join('');
        setDisplay(head + tail);
      }, 36);
    }, 300);

    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [payload, reduce]);

  return (
    <span className={`seal${dark ? ' seal-dark' : ''}`}>
      <span className="seal-stamp">
        <span className="seal-mark" aria-hidden="true" />
        <span className="seal-meta mono">COMPUTED · {modelId} · {version}</span>
        <span className="seal-hash mono" aria-label={`SHA-256 ${display}`}>
          sha256 {display || '…'}
          {resolved && <i className="seal-check" aria-hidden="true">✓</i>}
        </span>
      </span>
      {note && <span className="seal-note mono">{note}</span>}
    </span>
  );
}
