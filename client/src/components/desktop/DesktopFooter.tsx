/**
 * DesktopFooter — site footer for desktop landing pages.
 *
 * Columns: product, company, legal, resources. One primary CTA — "Talk to
 * Yulia" — because every conversion path routes to chat (never "contact
 * sales"). Desktop-only; mobile has no footer (chat pill owns the bottom).
 */

interface Props {
  dark: boolean;
  onTalkToYulia: () => void;
  onNavigate: (path: string) => void;
}

const LINK_COLUMNS: Array<{ heading: string; links: Array<{ label: string; href: string; external?: boolean }> }> = [
  {
    heading: 'Product',
    links: [
      { label: 'Sell a business', href: '/sell' },
      { label: 'Buy a business', href: '/buy' },
      { label: 'Raise capital', href: '/raise' },
      { label: 'Post-acquisition', href: '/integrate' },
      { label: 'For advisors', href: '/advisors' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Enterprise', href: '/enterprise' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms of service', href: '/legal/terms', external: true },
      { label: 'Privacy policy', href: '/legal/privacy', external: true },
    ],
  },
];

export default function DesktopFooter({ dark, onTalkToYulia, onNavigate }: Props) {
  const heading = dark ? '#F0F0F3' : '#1A1C1E';
  const body = dark ? 'rgba(240,240,243,0.78)' : '#3C3D40';
  const muted = dark ? 'rgba(240,240,243,0.55)' : '#6B6C6F';
  const border = dark ? 'rgba(255,255,255,0.06)' : '#E5E1D9';
  const pink = dark ? '#E8709A' : '#D44A78';
  const cardBg = dark ? '#151617' : '#FFFFFF';

  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      style={{
        marginTop: 48,
        borderTop: `1px solid ${border}`,
        background: 'transparent',
        padding: '36px 36px 24px',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
        gap: 32,
      }}
      className="desktop-footer-grid"
      >
        {/* Brand + CTA */}
        <div>
          <div style={{
            fontFamily: "'Sora', system-ui, sans-serif",
            fontSize: 20, fontWeight: 800,
            letterSpacing: '-0.02em',
            color: heading,
            marginBottom: 10,
          }}>
            smbx.ai
          </div>
          <p style={{
            margin: 0,
            fontSize: 13.5, color: body, lineHeight: 1.55, maxWidth: 360,
          }}>
            AI deal intelligence for the full M&amp;A arc — from first valuation to closing documents, and 180 days after.
          </p>
          <button
            onClick={onTalkToYulia}
            type="button"
            style={{
              marginTop: 16,
              padding: '10px 18px',
              borderRadius: 999,
              border: 'none',
              background: pink,
              color: '#FFFFFF',
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(212,74,120,0.22)',
            }}
          >
            Talk to Yulia →
          </button>
        </div>

        {/* Link columns */}
        {LINK_COLUMNS.map(col => (
          <div key={col.heading}>
            <div style={{
              fontFamily: "'Sora', system-ui, sans-serif",
              fontSize: 10, fontWeight: 800,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: muted, marginBottom: 12,
            }}>
              {col.heading}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {col.links.map(l => (
                <li key={l.href}>
                  {l.external ? (
                    <a
                      href={l.href}
                      style={{
                        color: body, fontSize: 13, textDecoration: 'none',
                      }}
                      className="desktop-footer-link"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <button
                      onClick={() => onNavigate(l.href)}
                      type="button"
                      className="desktop-footer-link"
                      style={{
                        background: 'none', border: 'none', padding: 0,
                        color: body, fontSize: 13, cursor: 'pointer',
                        fontFamily: 'inherit', textAlign: 'left',
                      }}
                    >
                      {l.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom strip */}
      <div style={{
        maxWidth: 1280,
        margin: '36px auto 0',
        paddingTop: 20,
        borderTop: `1px solid ${border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ fontSize: 12, color: muted }}>
          © {year} smbx.ai. AI deal intelligence for the middle market.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: muted }}>
          <span>Not investment advice. See <a href="/legal/terms" style={{ color: body }}>Terms</a> for details.</span>
        </div>
      </div>

      <style>{`
        .desktop-footer-link { transition: color 120ms ease; }
        .desktop-footer-link:hover { color: ${pink} !important; }
        @media (max-width: 920px) {
          .desktop-footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .desktop-footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {/* unused var */}
      <span aria-hidden style={{ display: 'none' }}>{cardBg}</span>
    </footer>
  );
}
