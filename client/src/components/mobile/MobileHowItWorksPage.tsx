/**
 * MobileHowItWorksPage.tsx — mobile-native vertical layout for HowItWorks.
 * Hook → kept conversation demo → 22 gates → 6 engines → BaselineCalculator
 * → ChatGPTvsYulia → Sign-off chain → bottom CTA.
 *
 * Note: per the user's feedback the desktop hero + black message card
 * pattern is "good" — kept here as the lead element.
 */

import { motion } from 'framer-motion';
import {
  MobileJourneySheet,
  MobileHero,
  MobileSection,
} from './MobileJourneySheet';
import { BaselineCalculator } from '../content/LandingCalculators';
import {
  MobileChatGPTvsYulia,
  MobileSignOffChain,
} from './mobileJourneyShared';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  onTalkToYulia: (prefill?: string) => void;
}

const GATES = [
  { icon: 'sell',          journey: 'Sell',      gates: ['S0', 'S1', 'S2', 'S3', 'S4', 'S5'], lock: 'No valuation until financials are normalized.' },
  { icon: 'shopping_cart', journey: 'Buy',       gates: ['B0', 'B1', 'B2', 'B3', 'B4', 'B5'], lock: 'No LOI until the cap stack clears DSCR at current rates.' },
  { icon: 'savings',       journey: 'Raise',     gates: ['R0', 'R1', 'R2', 'R3', 'R4', 'R5'], lock: 'No outreach until the structure clears against your dilution constraints.' },
  { icon: 'merge',         journey: 'Integrate', gates: ['I0', 'I1', 'I2', 'I3'],             lock: 'No 180-day plan until DD findings are real and the deal has actually closed.' },
];

const ENGINES = [
  { n: '01', icon: 'description',     title: 'Financial Extraction', desc: 'Pulls exact numbers from your tax returns and P&Ls. Never rounds. Never estimates.' },
  { n: '02', icon: 'travel_explore',  title: 'Market Intelligence',  desc: 'Live data on what is selling at what multiples. Census + SBA + NAICS benchmarks. Not training data.' },
  { n: '03', icon: 'policy',          title: 'Legal Auditor',         desc: 'Reviews your documents and only cites what is actually there. Returns "NOT FOUND" if it cannot verify.' },
  { n: '04', icon: 'calculate',       title: 'Deal Modeling',         desc: 'SBA, DSCR, IRR, MOIC, sensitivity, capital stack — deterministic math, not AI guesses.' },
  { n: '05', icon: 'account_tree',    title: 'Cap Table & Waterfall', desc: 'Models ownership, dilution, and liquidation waterfall across multiple rounds and exit scenarios.' },
  { n: '06', icon: 'draw',            title: 'Document Generator',    desc: 'CIMs, LOIs, term sheets, IC memos, board packages — drafted from your verified numbers.' },
];

export function MobileHowItWorksPage({ open, onOpenChange, dark, onTalkToYulia }: Props) {
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
      eyebrow="How it works"
      topBarTitle="How Yulia runs your deal"
      ctaLabel="Talk to Yulia"
      ctaSubLabel="Describe your deal — see the intelligence run"
      onCTA={() =>
        onTalkToYulia("Walk me through how you actually run a deal end-to-end.")
      }
    >
      <MobileHero
        dark={dark}
        hook={
          <>
            How Yulia <em className="not-italic" style={{ color: pinkC }}>runs</em> your deal.
          </>
        }
        sub={
          <>
            Six engines. 22 enforced gates. One conversation from first sentence to 180 days post-close. Watch the methodology work in real time on a real upper middle market deal.
          </>
        }
      />

      {/* Conversation demo — kept (the user said hero + black card is good) */}
      <MobileSection dark={dark} eyebrow="Watch Yulia work">
        <div
          className="rounded-3xl p-5"
          style={{
            background: '#0f1012',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="space-y-3">
            <div className="flex justify-end">
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tr-none text-white text-[13px] leading-relaxed max-w-[88%]">
                I run a specialty insurance brokerage in Connecticut. ~$52M revenue, $14M EBITDA, 95% retention. Considering a partial liquidity event with PE.
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <div className="w-7 h-7 rounded-full bg-[#D44A78] flex items-center justify-center text-white text-[10px] font-bold shrink-0">Y</div>
              <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none text-white text-[13px] leading-relaxed">
                Specialty insurance brokerage at $14M EBITDA — pulling comps now.
                <span className="block mt-2 text-[#dadadc]/55 text-[10px] italic">
                  NAICS 524210 · upper middle market · pulling 2024-2025 comps + recent transactions...
                </span>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <div className="w-7 shrink-0" />
              <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none text-white text-[13px] leading-relaxed">
                Specialty insurance at $10-25M EBITDA trades <strong className="text-[#ffb2bf]">11-14×</strong>. Top quartile (95%+ retention) at 13-15×. Your 95% puts you above median.
                <span className="block mt-2 font-semibold">
                  Conservative Baseline: <span className="text-[#ffb2bf]">$175M</span>. Top of range: <span className="text-[#ffb2bf]">$203M</span>.
                </span>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tr-none text-white text-[13px] leading-relaxed max-w-[88%]">
                What does a partial liquidity event with PE look like at this size?
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <div className="w-7 h-7 rounded-full bg-[#D44A78] flex items-center justify-center text-white text-[10px] font-bold shrink-0">Y</div>
              <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none text-white text-[13px] leading-relaxed">
                PE buys 60-70% for cash + rollover. Take <span className="text-[#ffb2bf] font-bold">$110-140M</span> day one + 30-40% rollover for the second bite. Total proceeds: <span className="text-[#ffb2bf] font-bold">$190-290M.</span>
                <span className="block mt-2 font-semibold">Want me to model 3 scenarios?</span>
              </div>
            </div>
          </div>
          <p className="text-[#dadadc]/40 text-[10px] text-center mt-4">
            90 seconds. No signup. Yulia is already pulling comps and modeling.
          </p>
        </div>
      </MobileSection>

      {/* 22 Gates */}
      <MobileSection
        dark={dark}
        eyebrow="The methodology"
        title="22 gates. Yulia won't let you skip steps."
        sub="Each journey has specific gates with completion triggers Yulia verifies from your conversation and your data."
      >
        <div className="space-y-5">
          {GATES.map((row, i) => (
            <motion.div
              key={row.journey}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: [0.32, 0.72, 0, 1] }}
              className="rounded-2xl p-4"
              style={{ background: cardBg, border: `1px solid ${ruleC}` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="material-symbols-outlined text-2xl"
                  style={{ color: pinkC }}
                >
                  {row.icon}
                </span>
                <h3
                  className="font-headline font-black text-lg tracking-tight"
                  style={{ color: headingC }}
                >
                  {row.journey}
                </h3>
                <span className="text-[10px] font-mono ml-auto" style={{ color: mutedC }}>
                  {row.gates.length} gates
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {row.gates.map((g) => (
                  <span
                    key={g}
                    className="text-[10px] font-mono px-2 py-1 rounded-full"
                    style={{
                      background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(15,16,18,0.05)',
                      color: bodyC,
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>
              <p className="text-[12px] italic" style={{ color: mutedC }}>
                <span style={{ color: pinkC }}>Gate that matters: </span>{row.lock}
              </p>
            </motion.div>
          ))}
        </div>
      </MobileSection>

      {/* 6 Engines */}
      <MobileSection
        dark={dark}
        eyebrow="Under the hood"
        title="Six engines. One conversation."
        sub="Each engine is purpose-built for one job. Yulia chooses which to invoke. You only see the answers."
      >
        <div className="space-y-4">
          {ENGINES.map((e, i) => (
            <motion.div
              key={e.n}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.32, 0.72, 0, 1] }}
              className="flex gap-4"
            >
              <div
                className="font-headline font-black tabular-nums shrink-0"
                style={{ fontSize: '1.75rem', color: pinkC, lineHeight: 0.95 }}
              >
                {e.n}
              </div>
              <div className="flex-1">
                <h3
                  className="font-headline font-black tracking-tight mb-1.5 flex items-center gap-2"
                  style={{ fontSize: '1rem', color: headingC, lineHeight: 1.15 }}
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ color: pinkC }}>
                    {e.icon}
                  </span>
                  {e.title}
                </h3>
                <p className="text-[13px] leading-[1.55]" style={{ color: bodyC }}>
                  {e.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </MobileSection>

      {/* Try it yourself */}
      <MobileSection
        dark={dark}
        eyebrow="Try it"
        title="The same engine. Run it now."
        sub="Pick an industry and a revenue. Watch the multiple range pull from the 2024-2025 mid-market consensus."
      >
        <BaselineCalculator dark={dark} />
      </MobileSection>

      {/* ChatGPT vs Yulia */}
      <MobileSection
        dark={dark}
        eyebrow="The actual difference"
        title="ChatGPT answers. Yulia closes."
        sub="ChatGPT is a stateless thinking partner — no memory, no participants, no audit trail. Yulia is a deal operator with workflow baked in."
      >
        <MobileChatGPTvsYulia dark={dark} />
      </MobileSection>

      {/* Sign-off chain */}
      <MobileSection dark={dark} eyebrow="Sign-off chain" title="What ChatGPT cannot do.">
        <MobileSignOffChain
          dark={dark}
          intro={
            <>
              The methodology and the engines are the brain. The sign-off chain is what makes Yulia <strong>run</strong> the deal — instead of just describing it.
            </>
          }
          steps={[
            { label: 'Draft',   text: 'Yulia drafts the LOI, CIM, term sheet, IC memo from your verified numbers. Every number cited to the source.' },
            { label: 'Route',   text: 'Routes to your attorney + CPA with focus areas: specific sections to review, specific questions to answer.' },
            { label: 'Wait',    text: 'Holds in queue until both sign off and attest. Document state machine: draft → review → approved → agreed.' },
            { label: 'Execute', text: 'Transmits to the counterparty from your account. share_document with the right access level, watermark, expiration.' },
            { label: 'Log',     text: 'Every action audited forever. deal_activity_log + SHA-256 hash on legal docs at execution.' },
          ]}
          bottomNote={
            <>
              This is what the marketing means when it says "Yulia runs your deal." It is not a metaphor. ChatGPT cannot do step 2 onward. We can.
            </>
          }
        />
      </MobileSection>
    </MobileJourneySheet>
  );
}
