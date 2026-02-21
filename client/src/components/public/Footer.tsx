import { Link } from 'wouter';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/sell', label: 'Sell' },
      { href: '/buy', label: 'Buy' },
      { href: '/raise', label: 'Raise' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '#', label: 'Privacy' },
      { href: '#', label: 'Terms' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#1A1A18] text-[#A3A3A3] px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-lg font-semibold text-white no-underline"
              style={{ fontFamily: 'ui-serif, Georgia, serif' }}
            >
              smbx.ai
            </Link>
            <p className="text-base mt-2 leading-relaxed m-0">
              Your M&A advisor, on demand.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map(col => (
            <div key={col.title}>
              <p className="text-sm uppercase tracking-wider text-[#6B6B65] mb-3 m-0">
                {col.title}
              </p>
              <ul className="list-none p-0 m-0 space-y-2">
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-base text-[#A3A3A3] hover:text-white no-underline transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#333] pt-6">
          <p className="text-sm text-[#6B6B65] m-0">
            &copy; {new Date().getFullYear()} smbx.ai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
