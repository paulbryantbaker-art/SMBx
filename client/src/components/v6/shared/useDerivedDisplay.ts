import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

/**
 * useDerivedDisplay — the DERIVE motion rule for the workspace:
 * numbers never hard-swap; they settle from their previous value over
 * --dur-settle, then flash a one-shot muted-green tick (`justSettled`).
 *
 * Works on PREFORMATTED strings ("$46.2M", "24.3%", "2.8×", "1,310,000"):
 * it extracts the single numeric token, animates it, and recomposes the
 * string with the target's own decimals/commas — so existing call sites
 * keep passing formatted values and need no format plumbing.
 *
 * Honesty/safety rails:
 *  - first render shows the value as-is (nothing animates from zero)
 *  - strings with zero or multiple numeric tokens pass through untouched
 *  - prefers-reduced-motion → instant swap, brief tick still flags freshness
 */

const NUM_RE = /-?\d[\d,]*(?:\.\d+)?/g;

function parseToken(formatted: string): { prefix: string; num: number; suffix: string; decimals: number; commas: boolean } | null {
  const matches = formatted.match(NUM_RE);
  if (!matches || matches.length !== 1) return null;
  const token = matches[0];
  const idx = formatted.indexOf(token);
  const num = parseFloat(token.replace(/,/g, ""));
  if (!Number.isFinite(num)) return null;
  const dot = token.indexOf(".");
  return {
    prefix: formatted.slice(0, idx),
    num,
    suffix: formatted.slice(idx + token.length),
    decimals: dot === -1 ? 0 : token.length - dot - 1,
    commas: token.includes(","),
  };
}

function compose(prefix: string, n: number, suffix: string, decimals: number, commas: boolean): string {
  const fixed = n.toFixed(decimals);
  if (!commas) return prefix + fixed + suffix;
  const [int, frac] = fixed.split(".");
  const sign = int.startsWith("-") ? "-" : "";
  const grouped = sign + Math.abs(parseInt(int, 10)).toLocaleString("en-US");
  return prefix + (frac ? `${grouped}.${frac}` : grouped) + suffix;
}

export function useDerivedDisplay(formatted: string): { text: string; justSettled: boolean } {
  const reduce = !!useReducedMotion();
  const [text, setText] = useState(formatted);
  const [justSettled, setJustSettled] = useState(false);
  const prev = useRef<{ formatted: string; num: number | null }>({ formatted, num: parseToken(formatted)?.num ?? null });
  const tickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (formatted === prev.current.formatted) return;
    const target = parseToken(formatted);
    const from = prev.current.num;
    prev.current = { formatted, num: target?.num ?? null };

    const flagSettled = () => {
      setJustSettled(true);
      if (tickTimer.current) clearTimeout(tickTimer.current);
      tickTimer.current = setTimeout(() => setJustSettled(false), 950);
    };

    // Non-animatable (no/multiple tokens, no prior number, reduced motion):
    // honest instant swap, still flag freshness.
    if (!target || from == null || reduce) {
      setText(formatted);
      flagSettled();
      return;
    }

    const controls = animate(from, target.num, {
      duration: 0.34,
      ease: [0.22, 0.61, 0.36, 1],
      onUpdate: (v) => setText(compose(target.prefix, v, target.suffix, target.decimals, target.commas)),
      onComplete: () => {
        setText(formatted); // land exactly on the true formatted value
        flagSettled();
      },
    });
    return () => controls.stop();
  }, [formatted, reduce]);

  useEffect(() => () => { if (tickTimer.current) clearTimeout(tickTimer.current); }, []);

  return { text, justSettled };
}
