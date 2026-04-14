import { ScrollReveal } from './animations';
import { bridgeToYulia } from './chatBridge';
import usePageMeta from '../../hooks/usePageMeta';
import {
  HookHeader,
  SectionHeader,
  SignOffChain,
  PageCTA,
} from './storyBlocks';

export default function HowItWorksBelow({ dark }: { dark: boolean }) {
  usePageMeta({
    title: 'How Yulia runs a deal · smbx.ai',
    description:
      'Watch the operating system run on a real sentence. Six engines, 22 enforced gates, one audited workflow from first message to close. The fastest way to understand smbx is to see it in motion.',
    canonical: 'https://smbx.ai/how-it-works',
    ogImage: 'https://smbx.ai/og-how.png',
    breadcrumbs: [
      { name: 'Home', url: 'https://smbx.ai/' },
      { name: 'How it works', url: 'https://smbx.ai/how-it-works' },
    ],
    faqs: [
      {
        question: 'How is Yulia different from ChatGPT for M&A?',
        answer:
          'ChatGPT generates plausible text. Yulia is the deal operating system — she remembers your deal, routes documents to your attorney with focus areas, holds the LOI in queue until counsel signs off, transmits to the buyer pool from your account, and logs every action in the audit trail. The buyer\'s lawyer can ask where any number came from and the answer is in the database. ChatGPT can answer questions. Yulia closes deals.',
      },
      {
        question: 'What is the 22-gate methodology?',
        answer:
          'Each of the 4 journeys (Sell, Buy, Raise, Integrate) has specific gates with completion triggers Yulia verifies from your conversation and data. No valuation until financials are normalized. No LOI until DSCR clears. No deal materials until value readiness is scored. The gates prevent the mistakes that kill deals.',
      },
      {
        question: 'How does the document state machine work?',
        answer:
          'Every document Yulia drafts has a status — draft → review → approved → agreed → executed → archived. Legal documents transition is enforced: you cannot execute a document that has not been reviewed and approved by counsel. When a regulated reviewer (attorney, CPA) approves, they accept a formal attestation, captured verbatim in the audit log.',
      },
      {
        question: 'What does deal intelligence mean?',
        answer:
          'Financial analysis + market data + industry benchmarks + workflow management. Unlike deal listings or general AI, deal intelligence is purpose-built for evaluating, structuring, routing, signing, and closing transactions. The chain of custody is the differentiator.',
      },
      {
        question: 'What are the six engines that run under the hood?',
        answer:
          'Financial Extraction normalizes P&Ls and tax returns. Market Intelligence pulls live comp multiples and recent deal activity. Legal Auditor keeps counsel in the loop on every term change. Deal Modeling runs valuation, cap stacks, and DSCR in real time. Cap Table handles dilution, rollovers, and exit waterfalls. Document Generator drafts CIMs, LOIs, IC memos, and board packages from verified numbers. Each engine is deterministic and leaves an audit trail.',
      },
      {
        question: 'Is Yulia a substitute for my lawyer, CPA, or investment banker?',
        answer:
          'No. Yulia is the deal operating system that makes your advisors faster and your decisions defensible. Every term sheet still routes to counsel. Every tax position still routes to your CPA. Every major transaction still benefits from a banker\u2019s relationships. What Yulia replaces is the analyst pod — the modeling, drafting, memo-writing, and state-tracking that used to take weeks and $250-500K of professional fees.',
      },
    ],
  });

  // Colors / theme — preserve the strong hero+demo treatment
  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const bodyColor = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedColor = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const accent = dark ? '#E8709A' : '#D44A78';
  const innerBg = dark ? 'rgba(255,255,255,0.04)' : 'white';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';

  /* ───────── 22 gates as editorial table ───────── */
  const gateRows = [
    {
      icon: 'sell',
      journey: 'Sell',
      gates: ['S0 · Profile', 'S1 · Financials', 'S2 · Valuation', 'S3 · Prepare', 'S4 · Negotiate', 'S5 · Close'],
      lock: 'No valuation until financials are normalized. No deal materials until value readiness is scored.',
    },
    {
      icon: 'shopping_cart',
      journey: 'Buy',
      gates: ['B0 · Thesis', 'B1 · Source', 'B2 · Underwrite', 'B3 · Diligence', 'B4 · Negotiate', 'B5 · Close'],
      lock: 'No LOI until the cap stack clears DSCR at current rates.',
    },
    {
      icon: 'savings',
      journey: 'Raise',
      gates: ['R0 · Capital need', 'R1 · Structure', 'R2 · Materials', 'R3 · Outreach', 'R4 · Term sheet', 'R5 · Close'],
      lock: 'No outreach until the structure clears against your DSCR + dilution constraints.',
    },
    {
      icon: 'merge',
      journey: 'Integrate',
      gates: ['I0 · Day 0 plan', 'I1 · Stabilize', 'I2 · Strengthen', 'I3 · Accelerate'],
      lock: 'No 180-day plan until DD findings are real and the deal has actually closed.',
    },
  ];

  /* ───────── 6 engines — one strong claim each. Names + claims are the trust
     capital; specific implementation detail lives under the hood. ───────── */
  const engines = [
    {
      n: '01',
      title: 'Financial Extraction',
      desc: 'Pulls exact numbers from tax returns and P&Ls. Never rounds. Cites every source line.',
      icon: 'description',
    },
    {
      n: '02',
      title: 'Market Intelligence',
      desc: 'Live comp multiples and recent deal activity in your sector. Not training data — current market.',
      icon: 'travel_explore',
    },
    {
      n: '03',
      title: 'Legal Auditor',
      desc: 'Only cites what\u2019s actually in your documents. Returns "NOT FOUND" rather than guess.',
      icon: 'policy',
    },
    {
      n: '04',
      title: 'Deal Modeling',
      desc: 'DSCR, IRR, MOIC, cap-stack composition, sensitivity. Deterministic math, not AI guesses.',
      icon: 'calculate',
    },
    {
      n: '05',
      title: 'Cap Table & Waterfall',
      desc: 'Ownership, dilution, and liquidation waterfall across rounds and exit scenarios.',
      icon: 'account_tree',
    },
    {
      n: '06',
      title: 'Document Generator',
      desc: 'CIMs, LOIs, IC memos, board packages — drafted from verified numbers, routed through sign-off, logged forever.',
      icon: 'draw',
    },
  ];

  return (
    <div className="bg-transparent" style={{ color: headingColor }}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ Hook ═══ */}
        <HookHeader
          eyebrow="how it works"
          headline={
            <>
              Watch Yulia run<br />
              a <em className="not-italic" style={{ color: accent }}>real deal</em>.
            </>
          }
          sub={
            <>
              Six engines. 22 enforced gates. One audited workflow from first message to close.
              The fastest way to understand smbx is to watch it in motion — so that's what this page is.
              Type a sentence, pick a preset, or read on for the methodology underneath.
            </>
          }
          dark={dark}
          accent={accent}
        />

        {/* ═══ The conversation demo — kept structure, sexier deal ═══ */}
        <ScrollReveal>
          <section className="mb-28">
            <div
              className="rounded-3xl p-8 md:p-12"
              style={{
                background: '#0f1012',
                border: `1px solid rgba(255,255,255,0.06)`,
              }}
            >
              <div className="max-w-4xl mx-auto space-y-6">
                {/* User opens with a serious deal */}
                <div className="flex gap-3 items-start justify-end">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl rounded-tr-none text-white text-[15px] leading-relaxed max-w-[80%]">
                    I run a specialty insurance brokerage in Connecticut. ~$52M revenue, $14M EBITDA, 95% retention, focused on middle-market commercial auto and cyber. Considering a partial liquidity event with PE.
                  </div>
                </div>
                {/* Yulia classifies + pulls comps */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: accent }}>Y</div>
                  <div className="bg-white/10 p-5 rounded-2xl rounded-tl-none text-white text-[15px] leading-relaxed max-w-[80%]">
                    Specialty insurance brokerage at $14M EBITDA — I know this market well. Let me pull the comps and recent transactions while we talk.
                    <span className="block mt-3 text-[#dadadc]/60 text-xs italic">
                      Classifying: NAICS 524210 · Specialty insurance brokerage · upper middle market · Gate S0 → S2 (you have enough data) · pulling 2024-2025 comp set + recent deal multiples...
                    </span>
                  </div>
                </div>
                {/* Yulia delivers the Baseline */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 shrink-0" />
                  <div className="bg-white/10 p-5 rounded-2xl rounded-tl-none text-white text-[15px] leading-relaxed max-w-[80%]">
                    Specialty insurance brokerage at $10-25M EBITDA trades <span className="text-[#ffb2bf] font-bold">11-14× in the 2024-2025 set</span>, with the top quartile (95%+ retention, defensible niche) at 13-15×. Your 95% retention puts you above median.
                    <span className="block mt-3 font-semibold">
                      Conservative Baseline: $14M × 12.5× = <span className="text-[#ffb2bf]">$175M</span>. Top of range: $14M × 14.5× = <span className="text-[#ffb2bf]">$203M</span>.
                    </span>
                  </div>
                </div>
                {/* Three data cards */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 shrink-0" />
                  <div className="grid grid-cols-3 gap-3 max-w-[80%]">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <p className="text-[9px] text-[#dadadc]/60 uppercase font-bold mb-1">EBITDA</p>
                      <p className="text-lg font-black text-white">$14M</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <p className="text-[9px] text-[#dadadc]/60 uppercase font-bold mb-1">Multiple range</p>
                      <p className="text-lg font-black text-white">12.5–14.5×</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <p className="text-[9px] text-[#dadadc]/60 uppercase font-bold mb-1">Baseline</p>
                      <p className="text-lg font-black text-[#ffb2bf]">$175–203M</p>
                    </div>
                  </div>
                </div>
                {/* User asks about partial liquidity */}
                <div className="flex gap-3 items-start justify-end">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl rounded-tr-none text-white text-[15px] leading-relaxed max-w-[80%]">
                    What does a partial liquidity event with PE actually look like at this size?
                  </div>
                </div>
                {/* Yulia models the structure */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: accent }}>Y</div>
                  <div className="bg-white/10 p-5 rounded-2xl rounded-tl-none text-white text-[15px] leading-relaxed max-w-[80%]">
                    Most common structure for your size: PE buys 60-70% for cash + rollover. You take{' '}
                    <span className="text-[#ffb2bf] font-bold">$110-140M off the table day one</span> and keep 30-40% rollover for the second bite. PE buyer underwrites a 5-year exit at 1.8-2.2× their entry — meaning your rollover could be worth{' '}
                    <span className="text-[#ffb2bf] font-bold">$80-150M at exit</span>.
                    <span className="block mt-3 font-semibold">
                      Total proceeds across both bites: $190-290M, depending on growth and exit multiple. Want me to model 3 scenarios — conservative, base, aggressive — and show you the after-tax math?
                    </span>
                  </div>
                </div>
              </div>
              <div className="max-w-4xl mx-auto mt-10 pt-8 border-t border-white/10 text-center">
                <p className="text-[#dadadc]/60 text-sm">
                  90 seconds. No signup. No credit card. Yulia is already pulling comps, modeling the structure, and queuing the next questions — she will keep going until the picture is complete.
                </p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ The 22 gates — editorial, not card grid ═══ */}
        <section className="mb-28">
          <SectionHeader
            label="The methodology"
            title="22 gates. Yulia won't let you skip steps."
            sub="Each journey has specific gates with completion triggers Yulia verifies from your conversation and your data. The gates prevent the mistakes that kill deals."
            dark={dark}
            accent={accent}
          />

          <div className="space-y-8">
            {gateRows.map((row) => (
              <div
                key={row.journey}
                className="grid grid-cols-12 gap-4 md:gap-8 pt-6"
                style={{ borderTop: `1px solid ${border}` }}
              >
                <div className="col-span-12 md:col-span-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="material-symbols-outlined text-3xl"
                      style={{ color: accent }}
                    >
                      {row.icon}
                    </span>
                    <h3
                      className="font-headline font-black tracking-tight"
                      style={{ fontSize: '1.75rem', color: headingColor, lineHeight: 1 }}
                    >
                      {row.journey}
                    </h3>
                  </div>
                  <p className="text-[12px]" style={{ color: mutedColor }}>
                    {row.gates.length} gates
                  </p>
                </div>
                <div className="col-span-12 md:col-span-9">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {row.gates.map((g) => (
                      <span
                        key={g}
                        className="text-[11px] font-mono px-3 py-1.5 rounded-full"
                        style={{
                          background: innerBg,
                          border: `1px solid ${border}`,
                          color: bodyColor,
                        }}
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                  <p className="text-[14px] italic" style={{ color: mutedColor }}>
                    <span style={{ color: accent }}>The gate that matters:</span> {row.lock}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ The 6 engines — numbered editorial ═══ */}
        <section className="mb-28">
          <SectionHeader
            label="Under the hood"
            title="Six engines running behind one conversation."
            sub="Each engine is purpose-built for one job. Yulia invokes whichever the conversation needs — you only see the answers. The implementation details stay under the hood; what matters is that every answer is deterministic, cited, and auditable."
            dark={dark}
            accent={accent}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {engines.map((e) => (
              <div key={e.n} className="flex gap-5">
                <div
                  className="font-headline font-black tabular-nums shrink-0"
                  style={{
                    fontSize: '2.25rem',
                    color: accent,
                    lineHeight: 0.95,
                  }}
                >
                  {e.n}
                </div>
                <div>
                  <h3
                    className="font-headline font-black tracking-tight mb-2 flex items-center gap-2"
                    style={{
                      fontSize: '1.25rem',
                      color: headingColor,
                      lineHeight: 1.15,
                    }}
                  >
                    <span className="material-symbols-outlined text-base" style={{ color: accent }}>
                      {e.icon}
                    </span>
                    {e.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed" style={{ color: bodyColor }}>
                    {e.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Author vs Auditor split */}
          <div
            className="mt-12 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-10"
            style={{ background: '#0f1012', color: '#f9f9fc' }}
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-2xl" style={{ color: accent }}>
                  edit_note
                </span>
                <h4 className="font-headline font-black text-lg">Author Mode</h4>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  Creative
                </span>
              </div>
              <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(218,218,220,0.78)' }}>
                Generates CIMs, IC memos, board decks, valuation narratives, market summaries. Synthesizes from multiple sources. The Yulia who writes the documents that close deals.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-2xl" style={{ color: accent }}>
                  fact_check
                </span>
                <h4 className="font-headline font-black text-lg">Auditor Mode</h4>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  Forensic
                </span>
              </div>
              <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(218,218,220,0.78)' }}>
                Verifies add-backs, extracts contract clauses, reviews tax returns. Only cites from your documents — never hallucinates. Returns "NOT FOUND" when information is missing.
              </p>
            </div>
          </div>
        </section>

        {/* (Intentionally removed on the methodology page:)
            - Interactive SBA calculator — lives on /buy and /raise where it's
              active to the user's actual decision, not a reprise here.
            - ChatGPT vs Yulia comparison — lives on /pricing where the
              decision-tension moment actually matters. Keeping it once makes
              it hit; duplicating it dilutes. */}

        {/* ═══ Sign-off chain ═══ */}
        <SignOffChain
          intro={
            <>
              The methodology and the engines are the brain. The sign-off chain is what makes Yulia run the deal —
              instead of just describing it. Every consequential action is gated on the sign-off chain. She drafts,
              routes to your attorney with focus areas, holds the document in queue until your attorney attests,
              transmits to the counterparty, logs the audit trail. The buyer's lawyer can ask where any number came
              from three years from now and the answer is in the database.
            </>
          }
          steps={[
            {
              label: 'Draft',
              yulia: 'Yulia drafts the LOI, CIM, term sheet, IC memo',
              chain: 'From your verified numbers. Every number cited to the source.',
            },
            {
              label: 'Route',
              yulia: 'Routes to your attorney + CPA with focus areas',
              chain: 'request_review with specific sections to review and questions to answer.',
            },
            {
              label: 'Wait',
              yulia: 'Holds in queue until both sign off and attest',
              chain: 'Document state machine: draft → review → approved → agreed.',
            },
            {
              label: 'Execute',
              yulia: 'Transmits to the counterparty from your account',
              chain: 'share_document with the right access level, watermark, expiration.',
            },
            {
              label: 'Log',
              yulia: 'Every action audited forever',
              chain: 'deal_activity_log + SHA-256 hash on legal docs at execution.',
            },
          ]}
          bottomNote={
            <>
              When the buyer's lawyer asks "where did that number come from?" three years later, the answer is in the
              database with the reviewer's signature. That's not a feature. That's the operating system.
            </>
          }
          dark={dark}
          accent={accent}
        />

        {/* ═══ CTA ═══ */}
        <PageCTA
          headline={<>Now run it on your deal.</>}
          sub="The demo above is scripted. The one you start in chat is real. Tell Yulia what you're working on — selling a business, buying one, raising capital, or integrating a close — and watch the same chain run against your numbers. No signup. No credit card. Stop whenever you want."
          buttonLabel="Start a conversation"
          onClick={() =>
            bridgeToYulia(
              "I just watched the How It Works demo. Run the same chain on my situation: [describe your deal, target, or capital need]. Pull the comps, build the model, and show me the gates you'd open."
            )
          }
          dark={dark}
          accent={accent}
        />
      </div>
    </div>
  );
}
