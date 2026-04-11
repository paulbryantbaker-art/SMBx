/**
 * MobilePricingPage.tsx — mobile-native vertical layout for the Pricing page.
 * Hook → ChatGPTvsYulia → DealCostMap → 5-tier ladder (Pro hero + others)
 * → Pro · Free callout → Legal FAQ accordion → bottom CTA.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MobileJourneySheet,
  MobileHero,
  MobileSection,
} from './MobileJourneySheet';
import { DealCostMap } from '../content/DealCostMap';
import { MobileChatGPTvsYulia } from './mobileJourneyShared';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  onTalkToYulia: (prefill?: string) => void;
}

const TIERS = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    sub: 'Forever',
    protagonist: 'Everyone starts here',
    features: [
      'Unlimited Yulia conversation',
      'One full deliverable, yours to keep',
      'Real Baseline range, 7-factor readiness',
      'Email required after first deliverable',
    ],
    accent: false,
  },
  {
    key: 'starter',
    name: 'Starter',
    price: '$49',
    sub: '/mo · single deal',
    protagonist: 'For your first close',
    features: [
      'Real SDE & EBITDA normalization',
      'Add-back schedule',
      'Deal scoring',
      'SBA eligibility & DSCR',
      'Sector market intelligence',
    ],
    accent: false,
  },
  {
    key: 'professional',
    name: 'Professional',
    price: '$199',
    sub: '/mo · 90-day free trial',
    protagonist: 'Anna J. runs Pro',
    features: [
      'CIM from your verified financials — 25-40 pages',
      'The Rundown™ — 7-dim deal scoring in 8 seconds',
      'Stack Builder for live capital structure',
      'Buyers, lenders, advisors identified & ranked',
      'Document state machine — draft → executed',
      'Yulia routes to your attorney with focus areas',
      'Every action audited (chain of custody)',
      'Full deal room — CPA, attorney, broker, lender',
      '180-day post-close integration plan',
      'After-tax modeling on asset vs stock sale',
    ],
    accent: true,
  },
  {
    key: 'practice',
    name: 'Practice',
    price: '$1,499',
    sub: '/mo · for the team',
    protagonist: 'Reese & Hammond runs this',
    features: [
      'Everything in Professional × 5 seats',
      'Multi-deal portfolio view',
      'White-label outputs (your brand)',
      'Up to 10 active deals',
      'Shared DD library',
    ],
    accent: false,
  },
  {
    key: 'firm',
    name: 'Firm',
    price: '$4,999',
    sub: '/mo · mid-market firms',
    protagonist: 'Sub-$1B PE & multi-MD shops',
    features: [
      'Unlimited users + unlimited deals',
      'API for pipeline integration',
      'Dedicated CSM + onboarding',
      'SOC 2 / SLA / contract terms',
      'Quarterly business reviews',
    ],
    accent: false,
  },
  {
    key: 'institutional',
    name: 'Institutional',
    price: '$9,999',
    sub: '/mo · self-serve, no sales call',
    protagonist: '$1B+ funds & bulge bracket',
    features: [
      'Unlimited users + unlimited deals',
      'SSO / SAML',
      'Full API + webhooks',
      'Priority engineering support',
      'White-glove onboarding',
    ],
    accent: false,
  },
];

const FAQS = [
  {
    q: 'Is Yulia a substitute for my IB or M&A advisor?',
    a: 'No. Yulia is the analytical engine and the workflow operating system. Your IB is the relationship engine, your fiduciary, and your seat at the closing table. Yulia routes your CIM to your attorney with focus areas; your attorney signs off; the document state advances; the buyer\'s lawyer can ask where any number came from and the answer is in the audit log. Bring both.',
  },
  {
    q: "I'm an attorney, CPA, or other deal pro. What do I pay?",
    a: 'Nothing. Verified deal professionals — attorneys, CPAs, real estate brokers, wealth managers, appraisers, insurance brokers, estate planners — get full Professional features for free, forever. Your clients pay their own subscription if they engage the platform directly. Yulia recognizes you in conversation and switches to peer-to-peer mode automatically.',
  },
  {
    q: 'Can Yulia give me legal advice on my term sheet?',
    a: 'No. Yulia can read a term sheet and explain what each clause typically does in market deals. She can flag terms that look unusual versus comparable transactions. She can model the after-tax impact of an asset sale versus a stock sale. What she cannot do is tell you whether to sign — that\'s your attorney\'s job. She does the homework. Your attorney does the calls.',
  },
  {
    q: 'Does Yulia take a success fee on my deal?',
    a: 'No. Yulia is a flat-rate software subscription, period. She does not earn a percentage of any transaction, does not effect any securities trades, and is not a registered broker-dealer with FINRA. The line between software tools and broker-dealer is bright. We sit firmly on the software side.',
  },
  {
    q: 'Where does Yulia stop and a human take over?',
    a: 'The line is "thinking and drafting" versus "deciding and signing." Yulia thinks for you — analyzes, models, drafts, projects. You decide and sign — usually with your attorney, CPA, or M&A advisor in the room. If a recommendation requires fiduciary judgment, a notarized signature, a courtroom appearance, or a regulated filing, that\'s where your human team takes over.',
  },
];

export function MobilePricingPage({ open, onOpenChange, dark, onTalkToYulia }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC    = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC   = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const ruleC    = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.08)';
  const cardBg   = dark ? '#1f2123' : '#ffffff';
  const pinkC    = dark ? PINK_DARK : PINK;

  return (
    <MobileJourneySheet
      open={open}
      onOpenChange={onOpenChange}
      dark={dark}
      eyebrow="Pricing"
      topBarTitle="Investment bank power"
      ctaLabel="Start free"
      ctaSubLabel="Run your first deliverable, no card on file"
      onCTA={() =>
        onTalkToYulia("How much does Yulia cost for my situation?")
      }
    >
      <MobileHero
        dark={dark}
        hook={
          <>
            Yulia gives everyone investment bank <em className="not-italic" style={{ color: pinkC }}>power.</em>
          </>
        }
        sub={
          <>
            Knowledge, models, drafting, guidance — and the workflow that closes the deal. <strong style={{ color: headingC }}>Everyone starts free.</strong>{' '}
            You only pay when you've decided Yulia is doing the work of an analyst pod for the price of a Slack subscription.
          </>
        }
      />

      {/* Connector */}
      <div className="px-6 mb-8">
        <p className="text-[12px] leading-relaxed" style={{ color: mutedC }}>
          <span className="font-bold" style={{ color: pinkC }}>Mark D.</span> ran Free until he was ready, then upgraded.{' '}
          <span className="font-bold" style={{ color: pinkC }}>Anna J.</span> runs Professional.{' '}
          <span className="font-bold" style={{ color: pinkC }}>Reese & Hammond</span> runs Practice for the partners.{' '}
          <span className="font-bold" style={{ color: pinkC }}>Ed K.'s</span> deal team runs Firm. The bulge bracket runs Institutional.
          And every attorney, CPA, broker, and wealth manager on the platform runs <strong style={{ color: pinkC }}>free, forever.</strong>
        </p>
      </div>

      {/* The actual difference — ChatGPT vs Yulia */}
      <MobileSection
        dark={dark}
        eyebrow="The actual difference"
        title="ChatGPT answers. Yulia closes."
      >
        <MobileChatGPTvsYulia dark={dark} />
      </MobileSection>

      {/* DealCostMap */}
      <MobileSection
        dark={dark}
        eyebrow="The math · interactive"
        title="Three ways to pay for the same work."
        sub="Drag the deal size. The IB fee, the in-house analyst team cost, and the Yulia subscription all update live. The spread is the headline."
      >
        <DealCostMap dark={dark} />
      </MobileSection>

      {/* Tier ladder */}
      <MobileSection
        dark={dark}
        eyebrow="Pick your tier"
        title="One hero plan. Five on-ramps."
        sub="Most owners, individual buyers, and indie sponsors land on Professional. The other tiers are entry doors and team upgrades."
      >
        <div className="space-y-3">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.key}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45, delay: i * 0.04, ease: [0.32, 0.72, 0, 1] }}
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: tier.accent ? (dark ? '#1f1416' : '#fef0f4') : cardBg,
                border: tier.accent ? `2px solid ${pinkC}` : `1px solid ${ruleC}`,
              }}
            >
              {tier.accent && (
                <div
                  aria-hidden
                  className="absolute -top-20 -right-20 w-48 h-48 rounded-full pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${pinkC}33, transparent 60%)`,
                  }}
                />
              )}
              <div className="relative z-10">
                <div className="flex items-baseline justify-between mb-1">
                  <h3
                    className="font-headline font-black tracking-tight"
                    style={{ fontSize: '1.5rem', color: headingC }}
                  >
                    {tier.name}
                  </h3>
                  {tier.accent && (
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                      style={{ background: pinkC, color: 'white' }}
                    >
                      Most chosen
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span
                    className="font-headline font-black tabular-nums tracking-tight"
                    style={{
                      fontSize: '2rem',
                      color: tier.accent ? pinkC : headingC,
                      lineHeight: 1,
                    }}
                  >
                    {tier.price}
                  </span>
                  <span className="text-[12px]" style={{ color: mutedC }}>
                    {tier.sub}
                  </span>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-4" style={{ color: pinkC }}>
                  {tier.protagonist}
                </p>
                <ul className="space-y-1.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[12px] leading-snug">
                      <span
                        className="material-symbols-outlined text-[14px] shrink-0 mt-0.5"
                        style={{ color: pinkC }}
                      >
                        check
                      </span>
                      <span style={{ color: bodyC }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </MobileSection>

      {/* Pro · Free callout */}
      <MobileSection dark={dark} eyebrow="Pro · Free · forever">
        <div
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{
            background: '#0f1012',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            aria-hidden
            className="absolute -top-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${pinkC}22, transparent 60%)` }}
          />
          <div className="relative z-10">
            <h3
              className="font-headline font-black tracking-[-0.02em] mb-4"
              style={{ fontSize: '1.625rem', color: '#f9f9fc', lineHeight: 1.05 }}
            >
              Are you a deal pro?<br />
              <em className="not-italic" style={{ color: pinkC }}>Yulia is free for you.</em>
            </h3>
            <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'rgba(218,218,220,0.85)' }}>
              Attorneys, CPAs, real estate brokers, wealth managers, appraisers, R&amp;W insurance brokers, estate planners — full Professional features, free forever. White-label outputs that carry your firm's brand. Multi-client deal view.
            </p>
            <p className="text-[11px] mb-5" style={{ color: 'rgba(218,218,220,0.55)' }}>
              The catch: when your client engages the platform directly, they get a 14-day trial then need their own subscription. We make it free for you. We don't make it free for them through you.
            </p>
            <button
              onClick={() =>
                onTalkToYulia("I'm a deal professional. I'd like to use Yulia for my client work.")
              }
              className="w-full py-3 rounded-full text-[13px] font-bold text-white"
              style={{
                background: pinkC,
                border: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Tell Yulia what you do
            </button>
            <p className="text-[10px] text-center mt-2" style={{ color: 'rgba(218,218,220,0.4)' }}>
              No application form. Yulia recognizes you in conversation.
            </p>
          </div>
        </div>
      </MobileSection>

      {/* Legal FAQ — accordion */}
      <MobileSection
        dark={dark}
        eyebrow="The line"
        title="What Yulia can't do — and why."
        sub="The bright legal lines that keep us on the software side. Yulia educates, models, drafts, routes, and orchestrates. She doesn't sign, certify, or close."
      >
        <div className="space-y-2">
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: cardBg,
                  border: `1px solid ${ruleC}`,
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-4 text-left"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  aria-expanded={isOpen}
                >
                  <span
                    className="font-bold text-[14px] flex-1 pr-3"
                    style={{ color: headingC, lineHeight: 1.3 }}
                  >
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                    className="material-symbols-outlined text-[20px] shrink-0"
                    style={{ color: pinkC }}
                  >
                    add
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p className="px-4 pb-4 text-[13px] leading-relaxed" style={{ color: bodyC }}>
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </MobileSection>
    </MobileJourneySheet>
  );
}
