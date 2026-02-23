import { Link } from 'wouter';
import Logo from './Logo';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/sell', label: 'Sell' },
      { href: '/buy', label: 'Buy' },
      { href: '/raise', label: 'Raise Capital' },
      { href: '/integrate', label: 'Integrate' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/enterprise', label: 'Enterprise' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/legal/privacy', label: 'Privacy' },
      { href: '/legal/terms', label: 'Terms' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#F0EDE6] pt-16 pb-8 px-10 max-md:px-5 max-md:pt-10 max-md:pb-6">
      <div className="max-w-site mx-auto">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 max-md:grid-cols-1 max-md:gap-8">
          {/* Brand */}
          <div>
            <Logo linked={false} />
            <p className="text-sm text-[#7A766E] leading-relaxed mt-3 max-w-[280px]">
              AI-powered M&amp;A advisory. From valuation to close.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map(col => (
            <div key={col.title}>
              <h4 className="text-xs uppercase tracking-widest text-[#7A766E] font-semibold mb-4">
                {col.title}
              </h4>
              <ul className="list-none p-0 m-0 space-y-2">
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-[#4A4843] hover:text-[#DA7756] no-underline transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#E0DCD4] mt-8 pt-6">
          <p className="text-[13px] text-[#7A766E] m-0">
            &copy; {new Date().getFullYear()} smbx.ai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
