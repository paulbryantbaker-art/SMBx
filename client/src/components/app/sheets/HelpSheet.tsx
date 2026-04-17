/**
 * HelpSheet — Glass Grok bottom sheet with a compact M&A glossary and an
 * "Ask Yulia" call to action. Opens from the TopBar bell icon and from
 * the first-run primer's "Learn more" link.
 *
 * Monochrome chrome: solid white card surface, hairline border, inset
 * specular highlight, no accent color. Term headers Sora 700; definitions
 * Inter 13 muted-secondary.
 */

import { Drawer } from 'vaul';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional: when fired, closes the sheet and opens Yulia full mode. */
  onAskYulia?: () => void;
}

interface GlossaryEntry {
  term: string;
  full?: string;
  definition: string;
}

const GLOSSARY: GlossaryEntry[] = [
  { term: 'Add-back', definition: "Expenses on the P&L that aren't truly part of running the business (owner salary beyond market, one-time legal fees, personal travel). Adding them back shows the true earnings buyers evaluate." },
  { term: 'CIM', full: 'Confidential Information Memorandum', definition: "The 10–15 page marketing document buyers read first. Financials, story, deal structure — the 'business of the business' one-pager done right." },
  { term: 'Customer concentration', definition: 'The share of revenue tied to the top handful of customers. High concentration (>20% from one customer) is a classic risk factor that depresses multiples.' },
  { term: 'DSCR', full: 'Debt Service Coverage Ratio', definition: 'Operating cash flow divided by debt payments. Lenders (especially SBA) want >1.25× for SMB acquisition financing.' },
  { term: 'EBITDA', full: 'Earnings Before Interest, Taxes, Depreciation, Amortization', definition: 'A profitability measure that strips financing and accounting decisions to compare operating performance across businesses.' },
  { term: 'LOI', full: 'Letter of Intent', definition: 'A (mostly) non-binding offer to buy outlining price, structure, and exclusivity. Triggers due diligence.' },
  { term: 'Multiple', definition: 'The ratio of sale price to SDE or EBITDA. A 4× multiple on $695K SDE = $2.78M price. Varies by industry, size, and recurring-revenue mix.' },
  { term: 'Owner dependence', definition: "How much of the business runs through the owner personally — customer relationships, key decisions, vendor knowledge. High dependence makes a business harder to transition and drops the multiple." },
  { term: 'Recast', definition: 'Adjusting historical financial statements to normalize earnings by removing owner perks, one-time items, and personal expenses.' },
  { term: 'Recurring revenue', definition: 'Revenue that repeats predictably — service contracts, subscriptions, maintenance. Typically earns a higher multiple than one-off project revenue.' },
  { term: 'SDE', full: "Seller's Discretionary Earnings", definition: "EBITDA plus the owner's salary and personal expenses run through the business. The profit metric for owner-operated SMBs." },
  { term: 'TSA', full: 'Transition Services Agreement', definition: 'A post-close contract where the seller keeps providing specific services (IT, accounting, intros) for a set period so the buyer can stand up independently.' },
];

export default function HelpSheet({ open, onOpenChange, onAskYulia }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!open) {
      setFilter('');
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return GLOSSARY;
    return GLOSSARY.filter(
      (g) =>
        g.term.toLowerCase().includes(q) ||
        (g.full || '').toLowerCase().includes(q) ||
        g.definition.toLowerCase().includes(q),
    );
  }, [filter]);

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 z-[100]"
          style={{ background: 'rgba(10,10,11,0.35)' }}
        />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-[101] outline-none"
          style={{
            background: 'var(--bg-card)',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            border: '0.5px solid var(--border)',
            borderBottom: 'none',
            maxHeight: '88vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-inset-highlight), 0 -12px 40px rgba(0,0,0,0.18)',
          }}
        >
          <Drawer.Title className="sr-only">Help and glossary</Drawer.Title>
          <Drawer.Description className="sr-only">
            Reference the M&A vocabulary Yulia uses, or ask Yulia a question directly.
          </Drawer.Description>

          {/* Drag handle */}
          <div
            aria-hidden
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: 'rgba(15,16,18,0.14)',
              margin: '8px auto 4px',
              flexShrink: 0,
            }}
          />

          {/* Header */}
          <div style={{ padding: '14px 20px 8px', flexShrink: 0 }}>
            <h2
              style={{
                fontFamily: "'Sora', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                margin: '0 0 6px',
              }}
            >
              Help & glossary
            </h2>
            <p
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Yulia helps you value, package, and close deals. Here's the vocabulary she uses.
            </p>
          </div>

          {/* Filter */}
          <div style={{ padding: '8px 14px 8px', flexShrink: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                background: 'var(--bg-subtle)',
                border: '0.5px solid var(--border)',
                borderRadius: 12,
                boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,1)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search terms"
                aria-label="Search glossary"
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
          </div>

          {/* Glossary list */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '8px 20px 16px',
            }}
          >
            {filtered.length === 0 ? (
              <p
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  padding: '24px 0',
                  margin: 0,
                }}
              >
                No terms match "{filter}".
              </p>
            ) : (
              filtered.map((g, i) => (
                <div
                  key={g.term}
                  style={{
                    padding: '12px 0',
                    borderBottom: i < filtered.length - 1 ? '0.5px solid var(--border)' : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 8,
                      marginBottom: 4,
                      flexWrap: 'wrap',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "'Sora', system-ui, sans-serif",
                        fontWeight: 700,
                        fontSize: 14,
                        letterSpacing: '-0.005em',
                        color: 'var(--text-primary)',
                        margin: 0,
                      }}
                    >
                      {g.term}
                    </h3>
                    {g.full && (
                      <span
                        style={{
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontSize: 11,
                          color: 'var(--text-muted)',
                          fontWeight: 500,
                        }}
                      >
                        {g.full}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 13,
                      lineHeight: 1.55,
                      color: 'var(--text-secondary)',
                      margin: 0,
                    }}
                  >
                    {g.definition}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Ask Yulia CTA */}
          <div
            style={{
              padding: '12px 20px 16px',
              borderTop: '0.5px solid var(--border)',
              background: 'var(--bg-card)',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onAskYulia?.();
              }}
              style={{
                width: '100%',
                padding: '13px 16px',
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-primary-btn)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Ask Yulia a question
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
