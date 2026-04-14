/**
 * HelpSheet — Vaul sheet with a brief "How Yulia works" overview and an
 * M&A glossary. Triggered from AccountSheet, SignInSheet, and the chat
 * empty state's "Need help?" link.
 */

import { Drawer } from 'vaul';
import { useEffect, useRef, useState } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
}

interface GlossaryEntry {
  term: string;
  full?: string;
  definition: string;
}

const GLOSSARY: GlossaryEntry[] = [
  { term: 'EBITDA', full: 'Earnings Before Interest, Taxes, Depreciation, Amortization', definition: 'A profitability measure that strips out financing and accounting decisions to compare businesses on operating performance.' },
  { term: 'SDE', full: 'Seller\u2019s Discretionary Earnings', definition: 'EBITDA plus the owner\u2019s salary and personal expenses run through the business — used for owner-operated SMBs.' },
  { term: 'DD', full: 'Due Diligence', definition: 'The buyer\u2019s deep investigation into a target before closing — financials, legal, operations, customers.' },
  { term: 'LOI', full: 'Letter of Intent', definition: 'A non-binding (mostly) offer to buy outlining price, structure, and exclusivity. Triggers DD.' },
  { term: 'CIM', full: 'Confidential Information Memorandum', definition: 'The seller\u2019s 30–80 page pitch document sent to qualified buyers under NDA.' },
  { term: 'QoE', full: 'Quality of Earnings', definition: 'Third-party deep audit of the target\u2019s reported earnings — adjusts for one-offs, finds skeletons.' },
  { term: 'IRR', full: 'Internal Rate of Return', definition: 'The annualized return rate that makes the deal\u2019s cash flows net to zero. PE\u2019s headline metric.' },
  { term: 'MOIC', full: 'Multiple on Invested Capital', definition: 'Total proceeds divided by total invested. A 2x MOIC means you doubled your money — duration-blind.' },
  { term: 'DSCR', full: 'Debt Service Coverage Ratio', definition: 'Operating cash flow divided by debt payments. Lenders want >1.25x for SMB deals.' },
  { term: 'SBA', full: 'Small Business Administration', definition: 'US-government-backed loans (7a, 504) for SMB acquisitions up to ~$5M.' },
  { term: 'PMI', full: 'Post-Merger Integration', definition: 'The 100-day-plus work of actually combining the acquired business into the new owner\u2019s operations.' },
  { term: 'Earnout', definition: 'Part of the purchase price contingent on the business hitting future targets — bridges valuation gaps.' },
  { term: 'Working Capital Peg', definition: 'The level of working capital expected to be left in the business at close. Adjustments swing real money.' },
];

export function HelpSheet({ open, onOpenChange, dark }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!open) {
      setScrolled(false);
      setFilter('');
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [open]);

  const bg = dark ? '#151617' : '#fefefe';
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const rowBg = dark ? '#1f2123' : '#ffffff';
  const pinkC = dark ? '#E8709A' : '#D44A78';

  const filtered = GLOSSARY.filter(g =>
    !filter ||
    g.term.toLowerCase().includes(filter.toLowerCase()) ||
    g.full?.toLowerCase().includes(filter.toLowerCase()) ||
    g.definition.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 90 }} />
        <Drawer.Content
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            height: '88vh', maxHeight: '88dvh',
            background: bg,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            outline: 'none',
          }}
        >
          {/* Drag handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
            <div style={{ width: 40, height: 5, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.18)' : 'rgba(15,16,18,0.16)' }} />
          </div>

          {/* Header */}
          <div
            style={{
              padding: '6px 18px 14px',
              borderBottom: scrolled ? `1px solid ${borderC}` : '1px solid transparent',
              transition: 'border-color 200ms',
            }}
          >
            <Drawer.Title asChild>
              <h2 style={{
                margin: 0,
                fontFamily: 'Sora, system-ui',
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: headingC,
              }}>
                Help &amp; glossary
              </h2>
            </Drawer.Title>
          </div>

          {/* Scrollable body */}
          <div
            ref={scrollRef}
            onScroll={(e) => setScrolled((e.currentTarget as HTMLDivElement).scrollTop > 8)}
            style={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '16px 18px calc(20px + env(safe-area-inset-bottom))',
            }}
          >
            {/* "How Yulia works" */}
            <section style={{ marginBottom: 24 }}>
              <h3 style={{
                margin: '0 0 8px',
                fontFamily: 'Sora, system-ui',
                fontSize: 15,
                fontWeight: 700,
                color: headingC,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                How Yulia works
              </h3>
              <p style={{
                margin: 0,
                fontFamily: 'Inter, system-ui',
                fontSize: 14,
                lineHeight: 1.55,
                color: bodyC,
              }}>
                Yulia is your M&amp;A deal intelligence — one chat that carries your whole deal across every stage from sourcing through closing. Tell her about a business, drop in a P&amp;L, ask anything. She'll create a deal card for it and remember everything between sessions. Each card on your home represents a deal she's tracking for you. Tap a card to scope the chat to that deal; tap the pill at the bottom for a general conversation.
              </p>
            </section>

            {/* Glossary */}
            <section>
              <h3 style={{
                margin: '0 0 10px',
                fontFamily: 'Sora, system-ui',
                fontSize: 15,
                fontWeight: 700,
                color: headingC,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                M&amp;A glossary
              </h3>
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search terms…"
                type="search"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: `1px solid ${borderC}`,
                  background: rowBg,
                  color: headingC,
                  fontFamily: 'Inter, system-ui',
                  fontSize: 14,
                  outline: 'none',
                  marginBottom: 10,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.map((g) => (
                  <div
                    key={g.term}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: rowBg,
                      border: `1px solid ${borderC}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontFamily: 'Sora, system-ui',
                        fontSize: 13,
                        fontWeight: 800,
                        color: pinkC,
                        letterSpacing: '0.02em',
                      }}>
                        {g.term}
                      </span>
                      {g.full && (
                        <span style={{
                          fontFamily: 'Inter, system-ui',
                          fontSize: 11,
                          fontWeight: 500,
                          color: mutedC,
                        }}>
                          {g.full}
                        </span>
                      )}
                    </div>
                    <p style={{
                      margin: 0,
                      fontFamily: 'Inter, system-ui',
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: bodyC,
                    }}>
                      {g.definition}
                    </p>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p style={{
                    fontSize: 13,
                    color: mutedC,
                    fontStyle: 'italic',
                    padding: '12px 0',
                    textAlign: 'center',
                  }}>
                    No matches.
                  </p>
                )}
              </div>
            </section>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default HelpSheet;
