/**
 * SearchTab — find anything in the app.
 *
 * - Glass search input at top
 * - Recent queries below (stub for v1)
 * - Popular-for-your-deal chips
 * - Full-text search across docs, conversations, activity, deals (polish pass)
 */

import { useState } from 'react';

export default function SearchTab() {
  const [query, setQuery] = useState('');

  return (
    <div style={{ paddingBottom: 8 }}>
      <h1
        style={{
          fontFamily: "'Sora', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 28,
          letterSpacing: '-0.025em',
          color: 'var(--text-primary)',
          padding: '6px 20px 10px',
          margin: 0,
        }}
      >
        Search
      </h1>

      <div
        style={{
          margin: '0 14px 20px',
          padding: '10px 12px',
          background: 'var(--bg-card)',
          border: '0.5px solid var(--border)',
          borderRadius: 14,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,1)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search docs, deals, activity…"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 14,
            color: 'var(--text-primary)',
          }}
        />
      </div>

      <SectionLabel>Popular · your deal</SectionLabel>
      <div style={{ padding: '0 16px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <PopularChip>Recurring revenue</PopularChip>
        <PopularChip>Owner dependence</PopularChip>
        <PopularChip>Customer concentration</PopularChip>
        <PopularChip>SBA eligibility</PopularChip>
        <PopularChip>Comparable sales</PopularChip>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'Sora', system-ui, sans-serif",
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: '0.12em',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        padding: '0 20px',
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function PopularChip({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      style={{
        display: 'inline-flex',
        padding: '7px 12px',
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        border: '0.5px solid var(--border)',
        borderRadius: 999,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,1)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}
