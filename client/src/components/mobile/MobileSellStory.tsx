/**
 * MobileSellStory — mobile-native rendering of the /sell journey.
 *
 * Uses MobileJourneyStory (Fibonacci-rhythm layout primitive) with
 * Sarah V.'s story + Baseline calculator + proof KPIs. Same content
 * density as SellBelow (desktop editorial), laid out vertically for
 * thumb-scroll reading on a 6" screen.
 *
 * Rendered from AppShell on mobile for the /sell route. Desktop
 * continues to render SellBelow.
 */

import { bridgeToYulia } from '../content/chatBridge';
import usePageMeta from '../../hooks/usePageMeta';
import { BaselineCalculator } from '../content/LandingCalculators';
import { MobileJourneyStory } from './MobileJourneyStory';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

interface Props {
  dark: boolean;
}

export default function MobileSellStory({ dark }: Props) {
  usePageMeta({
    title: 'Win the sell-side mandate · smbx.ai',
    description:
      'Walk into your sell-side pitch with the Baseline already in hand. Show the seller their real number at the first meeting. Win mandates the other brokers lose. Free for verified deal professionals.',
    canonical: 'https://smbx.ai/sell',
    ogImage: 'https://smbx.ai/og-sell.png',
    breadcrumbs: [
      { name: 'Home', url: 'https://smbx.ai/' },
      { name: 'Sell a business', url: 'https://smbx.ai/sell' },
    ],
    faqs: [
      {
        question: 'How does Yulia help me win sell-side pitches?',
        answer:
          'You show the prospect a real Baseline at the first meeting — comp data, add-back schedule, defensible multiple range — instead of "we will come back in two weeks." Engagement conversion lifts from ~35% to ~62% in the practices we work with. Prospects sign because the work is already credible.',
      },
      {
        question: 'What is Blind Equity™?',
        answer:
          'The gap between reported EBITDA and real EBITDA — the legitimate add-backs the CPA optimized away for tax savings. Above-market rent to an owner real-estate LLC, family compensation above market, one-time legal fees, personal vehicles, discontinued product losses. On a $15M+ EBITDA business, Blind Equity is usually $1-3M, which translates to $10-25M of valuation at typical industry multiples.',
      },
      {
        question: 'How much can a business actually sell for?',
        answer:
          'Five drivers: industry comp multiples, real EBITDA (not the tax-return number), customer concentration, growth trajectory, and owner dependency. Yulia runs all five against 2024-2025 mid-market consensus ranges, NAICS benchmarks, and actual deals closing in the sector — and gives you a defensible Baseline range, usually higher than the CPA rule of thumb.',
      },
    ],
  });

  const accent = dark ? PINK_DARK : PINK;
  const headingColor = dark ? '#f9f9fc' : '#0f1012';

  return (
    <MobileJourneyStory
      dark={dark}
      journey="sell"
      eyebrow="Sell"
      headline={
        <>
          Walk in with the <em className="not-italic" style={{ color: accent }}>number.</em><br />
          Win the mandate.
        </>
      }
      sub={
        <>
          Sarah's seller thought <strong style={{ color: headingColor }}>$90M</strong>. Sarah walked in with a defensible{' '}
          <strong style={{ color: accent }}>$155M</strong> Baseline in 90 seconds. She won the mandate over two other brokers
          who said "we'll come back to you in two weeks."
        </>
      }
      callout={
        <>
          <strong style={{ color: accent }}>$155M Baseline · 90 seconds.</strong>{' '}
          Closed at <strong style={{ color: headingColor }}>$154.8M</strong> · fee{' '}
          <strong style={{ color: headingColor }}>$2.7M</strong>.
        </>
      }

      primaryInteractiveLabel="Run a Baseline · live"
      primaryInteractive={<BaselineCalculator dark={dark} />}

      story={{
        name: 'Sarah V.',
        role: 'Partner · boutique M&A advisory, Midwest',
        body: (
          <>
            Mark was selling the specialty-distribution business he founded in 1998. Two brokers said they'd come back with a
            number in two weeks. Sarah ran the Baseline in the meeting — pulled the industry comp multiples, normalized the
            EBITDA, found <strong style={{ color: headingColor }}>$1.8M of Blind Equity</strong> hiding in the tax return.
            The number: <strong style={{ color: accent }}>$155M</strong> against Mark's $90M rule-of-thumb guess. Mark signed
            the engagement that day.
          </>
        ),
        outcome: 'Closed $154.8M · $2.7M fee',
      }}

      kpis={[
        { value: '$155M', label: 'defensible Baseline (vs $90M guess)' },
        { value: '90s', label: 'to build the number in the pitch' },
        { value: '62%', label: 'engagement conversion, up from 35%' },
      ]}

      takeaway={<>The broker who walks in with the number wins the mandate. Every time.</>}

      ctaLabel="Run a Baseline"
      ctaSub="Free for verified brokers & deal pros · No card required"
      onCTA={() =>
        bridgeToYulia(
          "Run a Baseline for my next sell-side prospect. The business is in [industry] with about $XM EBITDA. Walk me through the Multiple Map and the add-back schedule."
        )
      }
    />
  );
}
