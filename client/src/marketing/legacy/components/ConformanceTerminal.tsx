import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

/**
 * ConformanceTerminal — the conformance-suite run as a terminal exhibit.
 * Extracted from StandardInteractive so Home's dark band can mount it without
 * pulling the whole Standard page into its chunk.
 *
 * `replayable` adds a "run again ↻" affordance once the run completes —
 * nothing on this site is once-and-dead (Working Paper motion rule).
 * The line cadence is scripted today; Phase 3 swaps the script for a real
 * web-worker run of the MIT reference models.
 */

export type TLine =
  | { kind: 'cmd'; text: string }
  | { kind: 'pass'; n: string; label: string }
  | { kind: 'total'; text: string };

export const TERMINAL: TLine[] = [
  { kind: 'cmd', text: '$ npm run test:definitive-conformance' },
  { kind: 'pass', n: '202', label: 'model-runtime' },
  { kind: 'pass', n: '60', label: 'deal-mechanics route' },
  { kind: 'pass', n: '104', label: 'prompt / meta' },
  { kind: 'pass', n: '30', label: 'route-trigger' },
  { kind: 'pass', n: '33', label: 'model-stack' },
  { kind: 'pass', n: '43', label: 'Deal OS artifact' },
  { kind: 'total', text: '→ 472 passed · 0 failed' },
];

function TerminalLine({ line }: { line: TLine }) {
  if (line.kind === 'cmd') {
    return <div className="std-term-line std-term-cmd">{line.text}</div>;
  }
  if (line.kind === 'total') {
    return <div className="std-term-line std-term-total">{line.text}</div>;
  }
  return (
    <div className="std-term-line std-term-pass">
      <span className="std-term-check" aria-hidden="true">✓</span>
      <span className="std-term-n num">{line.n}</span>
      <span className="std-term-lbl">{line.label}</span>
    </div>
  );
}

export function ConformanceTerminal({ replayable = false }: { replayable?: boolean }) {
  const reduce = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [shown, setShown] = useState(reduce ? TERMINAL.length : 0);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (reduce) {
      setShown(TERMINAL.length);
      return;
    }
    if (!inView) return;
    setShown((s) => Math.max(s, 1)); // command appears first
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i < TERMINAL.length; i++) {
      timers.push(setTimeout(() => setShown((s) => Math.max(s, i + 1)), 260 + i * 240));
    }
    return () => timers.forEach(clearTimeout);
  }, [inView, reduce, runId]);

  const replay = () => {
    setShown(0);
    setRunId((r) => r + 1);
  };

  const done = shown >= TERMINAL.length;

  return (
    <div className="mock std-term-mock" ref={ref}>
      <div className="mock-bar">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-title">conformance</span>
        <span className="mock-tag mono">
          <span className="vdot" />
          472 / 472
        </span>
      </div>
      <div className="std-term-body mono" aria-label="Conformance suite output">
        {TERMINAL.slice(0, shown).map((line, i) => (
          <TerminalLine key={`${runId}-${i}`} line={line} />
        ))}
        {!reduce && !done && <span className="std-term-caret" aria-hidden="true" />}
        {replayable && !reduce && done && (
          <button type="button" className="std-term-replay mono" onClick={replay}>
            run again ↻
          </button>
        )}
      </div>
    </div>
  );
}
