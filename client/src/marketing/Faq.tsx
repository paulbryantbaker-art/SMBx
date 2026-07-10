/** The one FAQ accordion of the marketing surface (styles: .mk-faq* in
 *  marketing.css). Sell and Pricing both render it — keep them on this
 *  component so a11y/animation fixes land once. */
import { useState } from 'react';

export interface FaqItem {
  q: string;
  a: string;
}

export function Faq({ items, defaultOpen = null }: { items: FaqItem[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="mk-faq">
      {items.map((item, i) => (
        <div className={`mk-faq-item${open === i ? ' open' : ''}`} key={item.q}>
          <button
            type="button"
            className="mk-faq-q"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            {item.q}
            <span className="pm">{open === i ? '–' : '+'}</span>
          </button>
          <div className="mk-faq-a"><p>{item.a}</p></div>
        </div>
      ))}
    </div>
  );
}
