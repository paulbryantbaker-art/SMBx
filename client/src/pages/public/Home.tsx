import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'wouter';

/* ═══ TYPES ═══ */

type Msg =
  | { type: 'user'; text: string }
  | { type: 'yulia'; html: string }
  | { type: 'pill-card'; label: string; title: string; body: string }
  | { type: 'pill-question'; html: string };

/* ═══ PILL DATA ═══ */

const PILL_DATA: Record<string, { label: string; title: string; body: string; question: string }> = {
  sell: {
    label: 'THE PROCESS',
    title: "Here's how selling works with Yulia",
    body: `<p>I handle your entire sell-side process. You talk, I work.</p>
      <div class="home-pr-items">
        <div class="home-pr-item"><h4>1. Tell me about your business</h4><p>Industry, revenue, team. I build your deal profile. Free.</p></div>
        <div class="home-pr-item"><h4>2. I calculate your real numbers</h4><p>SDE/EBITDA, every add-back found, preliminary valuation with math shown. Free.</p></div>
        <div class="home-pr-item"><h4>3. Full valuation + go to market</h4><p>CIM, buyer matching, LOI management, diligence, closing. Pay per deliverable.</p></div>
      </div>`,
    question: `<p>Most owners leave <strong>$30K\u2013$150K on the table</strong> because they miss add-backs \u2014 personal vehicle, health insurance, above-market rent, family payroll. I find every dollar.</p><p><strong>Want to see what your business could be worth? Tell me what you do and your approximate revenue.</strong></p>`,
  },
  buy: {
    label: 'THE PROCESS',
    title: "Here's how buying works with Yulia",
    body: `<p>Whether you're a first-time buyer, search fund, or PE firm \u2014 I handle the analytical heavy lifting.</p>
      <div class="home-pr-items">
        <div class="home-pr-item"><h4>Deal sourcing &amp; scoring</h4><p>Define your thesis. I score targets and rank by fit. 47 evaluated overnight.</p></div>
        <div class="home-pr-item"><h4>SBA bankability check</h4><p>Before you waste 3 months, I tell you if the deal finances at today's rates with June 2025 rules.</p></div>
        <div class="home-pr-item"><h4>Diligence through closing</h4><p>Valuation, QoE, deal structuring, working capital. Every document managed.</p></div>
      </div>`,
    question: `<p>The most common buyer mistake: months on a deal that doesn't pencil. I check that <strong>first</strong>.</p><p><strong>Are you looking at a specific deal, or building your acquisition thesis?</strong></p>`,
  },
  intelligence: {
    label: 'THE INTELLIGENCE',
    title: 'What makes Yulia different',
    body: `<p>Most tools help with paperwork. I give you intelligence that changes your outcome.</p>
      <div class="home-pr-items">
        <div class="home-pr-item"><h4>Market intelligence</h4><p>Competitive density, wages, growth for any industry \u00D7 any market. Data no other platform synthesizes.</p></div>
        <div class="home-pr-item"><h4>Real-time deal context</h4><p>Rates shifted? I recalculate your buyer pool. Roll-up cycle? Multiple just jumped. Concentration at 35%? Here's the fix.</p></div>
        <div class="home-pr-item"><h4>SBA bankability</h4><p>June 2025 rules baked in. Does this deal finance? I check before you invest months.</p></div>
      </div>`,
    question: `<p>Intelligence that used to cost <strong>$50,000/year</strong> \u2014 applied to your deal, your market, your situation.</p><p><strong>Tell me about your deal and I'll show you what I mean.</strong></p>`,
  },
  owners: {
    label: 'FOR BUSINESS OWNERS',
    title: 'Built for owners like you',
    body: `<p>Whether you're selling for the first time, buying your next business, or raising growth capital \u2014 I speak your language. No jargon, no assumptions.</p>
      <div class="home-pr-items">
        <div class="home-pr-item"><h4>Selling?</h4><p>I calculate your real earnings, find every add-back, and give you a valuation range before you talk to a single broker.</p></div>
        <div class="home-pr-item"><h4>Buying?</h4><p>I check if the deal finances, score it against your criteria, and flag every red flag in the financials.</p></div>
        <div class="home-pr-item"><h4>Raising?</h4><p>I benchmark your metrics, build your pitch, and match you with the right investors for your stage.</p></div>
      </div>`,
    question: `<p>Most owners who come to me discover their business is worth <strong>significantly more</strong> than they thought \u2014 just by identifying add-backs they didn't know existed.</p><p><strong>What's your situation? Tell me about your business and what you're thinking.</strong></p>`,
  },
  brokers: {
    label: 'FOR BROKERS & ADVISORS',
    title: 'Your deals, 3\u00D7 faster',
    body: `<p>You're the relationship expert. I'm the work product machine. Together, you close more deals with less overhead.</p>
      <div class="home-pr-items">
        <div class="home-pr-item"><h4>CIMs in an hour</h4><p>Upload financials and business details. I produce a polished, presentation-ready CIM that you review and refine \u2014 not build from scratch.</p></div>
        <div class="home-pr-item"><h4>Instant buyer scoring</h4><p>I screen and rank your buyer list by financial capability, strategic fit, and deal history. You focus on the top 5, not the top 50.</p></div>
        <div class="home-pr-item"><h4>Deal flow management</h4><p>Track every deal through 22 gates. I keep diligence on schedule, flag delays, and make sure nothing falls through the cracks.</p></div>
      </div>`,
    question: `<p>Brokers who use Yulia report handling <strong>3\u00D7 the deal flow</strong> with the same team. The work product is institutional quality \u2014 your clients see the difference.</p><p><strong>How many active listings are you managing right now? Let me show you what I can do with one of them.</strong></p>`,
  },
  pe: {
    label: 'FOR PE & SEARCH FUNDS',
    title: 'Institutional intelligence, instantly',
    body: `<p>I do what your junior analysts do \u2014 but overnight, not in 6 weeks. And I never miss a data point.</p>
      <div class="home-pr-items">
        <div class="home-pr-item"><h4>Thesis validation</h4><p>Score every MSA for establishment density, wage arbitrage, growth trajectory, and competitive saturation. Your roll-up geography, prioritized.</p></div>
        <div class="home-pr-item"><h4>Target scoring</h4><p>47 targets evaluated against your criteria overnight. Ranked by fit, with financials modeled and bankability checked.</p></div>
        <div class="home-pr-item"><h4>Portfolio intelligence</h4><p>Cross-deal benchmarking, integration playbooks, bolt-on identification. The operating partner's best friend.</p></div>
      </div>`,
    question: `<p>One PE firm used Yulia to source and close <strong>6 bolt-on acquisitions in 14 months</strong>. I replaced 200+ hours of analyst work per deal.</p><p><strong>What's your acquisition thesis? Industry, geography, size \u2014 I'll start scoring immediately.</strong></p>`,
  },
  pros: {
    label: 'FOR CPAs, ATTORNEYS & LENDERS',
    title: 'Your clients are doing deals',
    body: `<p>Three of your clients will sell, buy, or raise capital this year. Do you have the M&A intelligence to advise them?</p>
      <div class="home-pr-items">
        <div class="home-pr-item"><h4>For CPAs</h4><p>Provide valuation context, tax-optimized deal structuring guidance, and add-back analysis alongside your existing engagement.</p></div>
        <div class="home-pr-item"><h4>For attorneys</h4><p>Due diligence management, LOI comparison, working capital analysis. The financial intelligence behind your legal advice.</p></div>
        <div class="home-pr-item"><h4>For lenders</h4><p>SBA bankability analysis with June 2025 rules, DSCR modeling, deal-specific risk assessment. Approve faster with better data.</p></div>
      </div>`,
    question: `<p>Your clients already trust you. Now you can advise them on the most important financial event of their lives \u2014 <strong>with intelligence that didn't exist before</strong>.</p><p><strong>What kind of practice do you run? I'll show you exactly how this fits.</strong></p>`,
  },
};

/* ═══ SIMULATED RESPONSES ═══ */

function genResp(m: string): string {
  const l = m.toLowerCase();
  // Tool-triggered patterns (highest priority)
  if (l.includes('upload') || l.includes('financial'))
    return `<p>I can analyze your financials once you upload them. For now, <strong>tell me your approximate annual revenue and what you take home</strong> \u2014 I'll start calculating immediately.</p><p>When you're ready, the upload tool lets me process P&Ls, tax returns, and balance sheets directly.</p>`;
  if (l.includes('valuation'))
    return `<p>Let's calculate your real earnings. Most owners miss <strong>add-backs worth $30K\u2013$150K</strong> \u2014 vehicle, insurance, rent, family payroll.</p><p><strong>What's your industry, location, and approximate revenue?</strong></p>`;
  if (l.includes('search') && (l.includes('market') || l.includes('business')))
    return `<p>I can scan every market for businesses matching your criteria \u2014 industry, geography, size, profitability threshold.</p><p><strong>What industry are you targeting, and what's your size range?</strong></p>`;
  if (l.includes('sba') || l.includes('bankab'))
    return `<p>SBA bankability depends on <strong>DSCR, collateral coverage, industry risk</strong>, and the June 2025 rule changes. I check all of it instantly.</p><p><strong>What's the deal size and industry?</strong></p>`;
  // Industry patterns
  if (l.includes('hvac') || l.includes('plumb') || l.includes('heat'))
    return `<p>Good market. HVAC is one of the hottest PE roll-up verticals \u2014 <strong>138 deals</strong> in 2024 alone.</p><p>At $3M revenue, likely <strong>$450K\u2013$700K SDE</strong>. Preliminary range: <strong>$1.1M\u2013$2.5M</strong> standalone, significantly more as a platform add-on at 5\u20137\u00D7.</p><p><strong>What did you take home last year</strong> \u2014 salary, distributions, benefits, truck, phone, everything?</p>`;
  if (l.includes('saas') || l.includes('software') || l.includes('arr'))
    return `<p>SaaS $1\u20135M ARR \u2014 sweet spot. Strong retention commands <strong>4\u20137\u00D7 ARR</strong>.</p><p>Key metrics: <strong>NRR, gross margins</strong> (70%+), <strong>churn, concentration</strong>. 120%+ NRR is a different asset.</p><p><strong>Specific deal, or building thesis?</strong></p>`;
  if (l.includes('landscap'))
    return `<p>Landscaping at $400K \u2014 solid. We'll focus on <strong>total owner's earnings</strong>.</p><p>Most owners miss add-backs \u2014 <strong>vehicle, fuel, phone, depreciation, family payroll</strong>.</p><p><strong>What did you take home last year?</strong></p>`;
  if (l.includes('pe ') || l.includes('fund') || l.includes('roll-up') || l.includes('portfolio'))
    return `<p>Home services roll-up \u2014 proven playbook. I'll score every MSA for <strong>density, wage arbitrage, growth</strong>.</p><p><strong>Target EBITDA range and geographic preferences?</strong></p>`;
  // Intent patterns
  if (l.includes('sell') || l.includes('exit') || l.includes('worth'))
    return `<p>Let's calculate your real earnings. Most owners miss <strong>add-backs</strong> worth $30K\u2013$150K.</p><p><strong>Industry, location, and approximate revenue?</strong></p>`;
  if (l.includes('buy') || l.includes('acquir') || l.includes('search'))
    return `<p>Key questions: <strong>industry, size, geography, financing plan</strong>. If SBA, I'll check bankability instantly.</p><p><strong>Specific deal or building thesis?</strong></p>`;
  if (l.includes('raise') || l.includes('capital'))
    return `<p>Growth capital \u2014 how much equity at what valuation?</p><p><strong>Current revenue, and what would the capital fund?</strong></p>`;
  // Number patterns
  if (l.includes('$') || /\d+k/i.test(l) || /\d+,\d+/.test(l))
    return `<p>Good \u2014 let me work with those numbers.</p><p>Do you have any of these running through the business? Vehicle, phone, health insurance, family on payroll, one-time purchases?</p><p>Each is a legitimate <strong>add-back</strong> that increases your sale price.</p>`;
  // Default
  return `<p><strong>Tell me what you're working on</strong> \u2014 selling, buying, raising capital, or post-acquisition?</p><p>Give me the basics and I'll start immediately.</p>`;
}

/* ═══ PILLAR DATA ═══ */

const PROCESS_CARDS = [
  { t: 'Intake & Analysis', d: 'Classifies your deal, calculates real earnings, identifies hidden add-backs, benchmarks against your industry.' },
  { t: 'Valuation & Packaging', d: 'Multi-methodology valuation with math shown. CIM that attracts premium offers. The work product $100K firms deliver.' },
  { t: 'Deal Execution', d: 'LOI comparison, due diligence, deal structuring, working capital analysis. Every party, every document, through closing.' },
];

const INTEL_CARDS = [
  { t: 'Market Intelligence', d: 'Competitive density, regional economics, wage benchmarks. Census + BLS + BEA + IRS data no other platform combines.' },
  { t: 'Deal Bankability', d: 'Instant SBA financing analysis with latest rule changes. Know if a deal pencils before wasting months.' },
  { t: 'Fragmentation Maps', d: 'Roll-up opportunity scored by industry and metro. Your thesis validated overnight.' },
];

const DEAL_CHIPS = [
  { size: '$400K', type: 'Landscaping', result: 'Found $31K in add-backs \u2192 $425K asking', msg: 'I own a landscaping business doing about $400K in revenue' },
  { size: '$3M', type: 'HVAC', result: 'Valued $2.6M\u2013$3.9M, PE roll-up at 5.2\u00D7', msg: 'I own an HVAC company doing $3M in revenue' },
  { size: '$15M', type: 'SaaS', result: '47 targets scored, 3 LOIs in 60 days', msg: 'Search fund looking for SaaS targets, $1-5M ARR' },
  { size: '$200M', type: 'PE Portfolio', result: '6 bolt-ons in 14 months', msg: 'PE fund, $200M AUM, home services roll-up' },
];

const PERSONA_CARDS = [
  { key: 'owners', accent: false, title: 'Business Owners', desc: 'Selling, buying, or raising \u2014 Yulia speaks your language. No jargon, no assumptions. Clear guidance from first question to closing day.', quote: '\u201CI had no idea my add-backs were worth $127K. Yulia found every one.\u201D' },
  { key: 'brokers', accent: true, title: 'Brokers & Advisors', desc: 'Produce CIMs in an hour, not three weeks. Screen and score buyer lists instantly. Manage 3\u00D7 the deal flow with the same team.', quote: '\u201CI closed 4 more deals last quarter using Yulia for work product.\u201D' },
  { key: 'pe', accent: false, title: 'PE & Search Funds', desc: 'Score targets against your thesis overnight. Model returns, check bankability, run fragmentation analysis across every MSA in the country.', quote: '\u201CShe replaced 200 hours of analyst work on our last platform build.\u201D' },
  { key: 'pros', accent: false, title: 'CPAs, Attorneys & Lenders', desc: 'Your clients are doing deals. Yulia gives you the M&A intelligence to advise them \u2014 and a new revenue stream.', quote: '\u201CThree of my tax clients sold businesses this year. Yulia helped me advise all three.\u201D' },
];

/* ═══ TOOL ICONS (15px SVGs) ═══ */

const Icons = {
  paperclip: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  ),
  chart: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  search: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  shield: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

const HERO_TOOLS = [
  { icon: Icons.paperclip, label: 'Upload financials', text: 'I want to upload my financials for a valuation' },
  { icon: Icons.chart, label: 'Valuation', text: 'Run a valuation on my business' },
  { icon: Icons.search, label: 'Market search', text: 'Search for businesses for sale in home services' },
  { icon: Icons.shield, label: 'SBA check', text: 'Check SBA bankability for a $2M acquisition' },
];

const DOCK_TOOLS = [
  { icon: Icons.paperclip, label: 'Upload', text: 'I want to upload my financials for a valuation' },
  { icon: Icons.chart, label: 'Valuation', text: 'Run a valuation on my business' },
  { icon: Icons.search, label: 'Search', text: 'Search for businesses for sale in home services' },
  { icon: Icons.shield, label: 'SBA', text: 'Check SBA bankability for a $2M acquisition' },
];

/* ═══ SEND ICON ═══ */

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

/* ═══ COMPONENT ═══ */

export default function Home() {
  const [chatActive, setChatActive] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [value, setValue] = useState('');
  const [typing, setTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLTextAreaElement>(null);
  const dockRef = useRef<HTMLTextAreaElement>(null);

  /* ── Scroll to bottom ── */

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 50);
  }, []);

  /* ── Enter chat mode ── */

  const enterChat = useCallback(() => {
    setChatActive(true);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  /* ── Go home (reset) ── */

  const goHome = useCallback(() => {
    if (!chatActive) {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      return;
    }
    setChatActive(false);
    setMessages([]);
    setValue('');
    setTyping(false);
    if (heroRef.current) heroRef.current.style.height = 'auto';
    if (dockRef.current) dockRef.current.style.height = 'auto';
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [chatActive]);

  /* ── Send message ── */

  const send = useCallback(() => {
    const t = value.trim();
    if (!t || typing) return;
    if (!chatActive) enterChat();
    setMessages(prev => [...prev, { type: 'user', text: t }]);
    setValue('');
    if (heroRef.current) heroRef.current.style.height = 'auto';
    if (dockRef.current) dockRef.current.style.height = 'auto';
    setTyping(true);
    const resp = genResp(t);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { type: 'yulia', html: resp }]);
      dockRef.current?.focus();
    }, 1800 + Math.random() * 1000);
  }, [value, typing, chatActive, enterChat]);

  /* ── Fill input and send (deal chips) ── */

  const fillAndSend = useCallback((text: string) => {
    if (typing) return;
    if (!chatActive) enterChat();
    setMessages(prev => [...prev, { type: 'user', text }]);
    setValue('');
    setTyping(true);
    const resp = genResp(text);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { type: 'yulia', html: resp }]);
      dockRef.current?.focus();
    }, 1800 + Math.random() * 1000);
  }, [typing, chatActive, enterChat]);

  /* ── Trigger pill response ── */

  const triggerPill = useCallback((type: string) => {
    if (typing) return;
    if (!chatActive) enterChat();
    const d = PILL_DATA[type];
    if (!d) return;
    setMessages(prev => [...prev, { type: 'pill-card', label: d.label, title: d.title, body: d.body }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { type: 'pill-question', html: d.question }]);
      dockRef.current?.focus();
    }, 1200);
  }, [typing, chatActive, enterChat]);

  /* ── Fill input (tool buttons) — fills but does NOT send ── */

  const fillInput = useCallback((text: string) => {
    setValue(text);
    requestAnimationFrame(() => {
      const ref = chatActive ? dockRef : heroRef;
      if (ref.current) {
        ref.current.style.height = 'auto';
        ref.current.style.height = Math.min(ref.current.scrollHeight, 140) + 'px';
        ref.current.focus();
      }
    });
  }, [chatActive]);

  /* ── Scroll to top and focus hero input (bottom CTA) ── */

  const scrollToTopAndFocusHero = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => heroRef.current?.focus(), 500);
  }, []);

  /* ── Shared handlers ── */

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  };

  /* ── Focus dock when entering chat ── */

  useEffect(() => {
    if (chatActive) {
      setTimeout(() => dockRef.current?.focus(), 50);
    }
  }, [chatActive]);

  /* ── IntersectionObserver for pillar reveals ── */

  useEffect(() => {
    if (chatActive) return;
    const root = scrollRef.current;
    if (!root) return;

    const els = root.querySelectorAll('.home-pillar, .home-scroll-cta');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1, root });

    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [chatActive]);

  /* ── Scroll to bottom on new messages / typing ── */

  useEffect(() => {
    if (chatActive) scrollToBottom();
  }, [messages, typing, chatActive, scrollToBottom]);

  const hasContent = value.trim().length > 0;

  /* ── Tool button renderer ── */

  const renderTools = (tools: typeof HERO_TOOLS) => (
    <div className="flex overflow-x-auto gap-1.5 px-3 pb-3">
      {tools.map(t => (
        <button
          key={t.label}
          className="shrink-0 flex items-center gap-1.5 py-[7px] px-3 rounded-lg text-[12.5px] font-medium text-[#7A766E] bg-transparent border-none font-sans cursor-pointer transition-colors hover:bg-[#F0EDE6] whitespace-nowrap"
          onClick={() => fillInput(t.text)}
          type="button"
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-[#FAF8F4]">
      {/* ── TOPBAR ── */}
      <div className="shrink-0 bg-[#FAF8F4] z-10">
        <div className="flex items-center justify-between w-full max-w-[960px] mx-auto px-5 py-3.5 md:px-10 md:py-4">
          <div
            className="font-sans text-[19px] font-bold tracking-[-0.03em] text-[#1A1A18] cursor-pointer select-none"
            onClick={goHome}
          >
            smb<span className="text-[#DA7756]">x</span>.ai
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sell" className="hidden md:block text-sm font-medium text-[#7A766E] hover:text-[#1A1A18] no-underline transition-colors">Sell</Link>
            <Link href="/buy" className="hidden md:block text-sm font-medium text-[#7A766E] hover:text-[#1A1A18] no-underline transition-colors">Buy</Link>
            <Link href="/pricing" className="hidden md:block text-sm font-medium text-[#7A766E] hover:text-[#1A1A18] no-underline transition-colors">Pricing</Link>
            <button
              className="text-sm font-medium text-[#7A766E] hover:text-[#1A1A18] bg-transparent border-none font-sans p-0 cursor-pointer transition-colors"
              onClick={() => { if (!chatActive) document.getElementById('home-p1')?.scrollIntoView({ behavior: 'smooth' }); }}
            >
              Learn more
            </button>
            <Link href="/login" className="text-sm font-medium text-[#7A766E] hover:text-[#1A1A18] no-underline transition-colors">Log in</Link>
          </div>
        </div>
      </div>

      {/* ── SCROLL AREA ── */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain"
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        <div className="max-w-[640px] mx-auto px-5 min-h-full flex flex-col md:max-w-[860px] md:px-10 lg:max-w-[960px]">
          {!chatActive ? (
            <>
              {/* ═══ LANDING ═══ */}
              <div className="flex-1 flex flex-col items-center justify-center text-center py-5">
                <h1 className="home-fade-up font-serif text-[clamp(24px,5vw,44px)] font-extrabold leading-[1.12] tracking-[-0.025em] mb-2 m-0">
                  Sell a business.<br />Buy a business.<br />Raise capital.
                </h1>
                <p className="home-fade-up home-fade-up-1 text-[clamp(14px,1.4vw,17px)] text-[#7A766E] leading-[1.5] max-w-[400px] mb-9 m-0">
                  Your AI M&A advisor. She runs the process, knows your market.
                </p>

                {/* Hero Input Card */}
                <div className="home-fade-up home-fade-up-2 home-input-card w-full max-w-[580px] bg-white border-[1.5px] border-[#E0DCD4] rounded-[22px] overflow-hidden md:max-w-[660px]">
                  <div className="relative">
                    <textarea
                      ref={heroRef}
                      value={value}
                      onChange={handleChange}
                      onKeyDown={handleKey}
                      placeholder="Tell Yulia about your deal..."
                      className="w-full bg-transparent border-none outline-none resize-none text-[16.5px] font-sans text-[#1A1A18] leading-[1.5] placeholder:text-[#B5B0A8] px-5 pt-[18px] pb-2.5 pr-[50px]"
                      style={{ minHeight: 56, maxHeight: 140 }}
                      rows={1}
                    />
                    <button
                      className={`absolute right-3 bottom-2 w-[38px] h-[38px] rounded-full border-none bg-[#DA7756] text-white cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-[#C4684A] active:scale-95 ${hasContent ? 'opacity-100 scale-100' : 'opacity-0 scale-[.8] pointer-events-none'}`}
                      onClick={send}
                      type="button"
                    >
                      <SendIcon />
                    </button>
                  </div>
                  {renderTools(HERO_TOOLS)}
                </div>

                <p className="home-fade-up home-fade-up-3 text-[11.5px] text-[#C5C0B8] mt-3.5 m-0">
                  No account needed &middot; Start talking
                </p>

                {/* Suggestion Chips */}
                <div className="home-fade-up home-fade-up-4 flex flex-wrap justify-center gap-2 mt-5 max-w-[580px] md:max-w-[660px]">
                  {[
                    { label: 'Sell my business', pill: 'sell' },
                    { label: 'Buy a business', pill: 'buy' },
                    { label: 'What can Yulia do?', pill: 'intelligence' },
                  ].map(chip => (
                    <button
                      key={chip.label}
                      className="bg-white border border-[#E0DCD4] rounded-full py-[9px] px-[18px] text-[13.5px] font-medium text-[#4A4843] font-sans cursor-pointer transition-all whitespace-nowrap hover:border-[#DA7756] hover:text-[#DA7756] hover:bg-[#FFF0EB] active:scale-[.97]"
                      onClick={() => triggerPill(chip.pill)}
                      type="button"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Scroll tease */}
                <div
                  className="home-fade-up home-fade-up-5 home-bob mt-10 flex flex-col items-center gap-1 text-[#C5C0B8] text-[11px] font-medium tracking-[.06em] cursor-pointer"
                  onClick={() => document.getElementById('home-p1')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <span>LEARN MORE</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>

              {/* Landing divider — full-width gradient */}
              <div className="home-landing-divider" />

              {/* ═══ PILLARS ═══ */}

              {/* Pillar 1: The Process */}
              <div className="home-pillar py-[60px] md:py-20" id="home-p1">
                <div className="text-[11px] font-semibold tracking-[.14em] uppercase text-[#DA7756] mb-3">THE PROCESS</div>
                <h2 className="font-serif text-[clamp(22px,4vw,36px)] font-black leading-[1.15] tracking-[-0.02em] mb-3 m-0">
                  Yulia runs your deal.<br />Start to <em className="italic text-[#DA7756]">finish.</em>
                </h2>
                <p className="text-[15px] text-[#4A4843] leading-[1.6] mb-6 max-w-[540px] m-0 md:text-base">
                  She drives the entire M&A process &mdash; intake, financials, valuation, packaging, buyer matching, diligence, closing. She tells you what to do next, then does it.
                </p>
                <div className="flex flex-col gap-2.5 md:grid md:grid-cols-3 md:gap-3.5">
                  {PROCESS_CARDS.map(c => (
                    <div key={c.t} className="bg-white border border-[#E0DCD4] rounded-[14px] p-4 transition-all hover:border-transparent hover:shadow-[0_.5rem_2rem_rgba(0,0,0,.06)]">
                      <h3 className="text-sm font-bold mb-1 m-0">{c.t}</h3>
                      <p className="text-[13px] text-[#4A4843] leading-[1.5] m-0">{c.d}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-10 h-px bg-[#E0DCD4] mx-auto" />

              {/* Pillar 2: The Intelligence */}
              <div className="home-pillar py-[60px] md:py-20" id="home-p2">
                <div className="text-[11px] font-semibold tracking-[.14em] uppercase text-[#DA7756] mb-3">THE INTELLIGENCE</div>
                <h2 className="font-serif text-[clamp(22px,4vw,36px)] font-black leading-[1.15] tracking-[-0.02em] mb-3 m-0">
                  Yulia knows your market.<br /><em className="italic text-[#DA7756]">Better than you do.</em>
                </h2>
                <p className="text-[15px] text-[#4A4843] leading-[1.6] mb-6 max-w-[540px] m-0 md:text-base">
                  Real-time market intelligence applied to YOUR deal. Localized, data-driven insights that change your outcome.
                </p>

                {/* Yulia insight card */}
                <div className="bg-white border border-[#E0DCD4] rounded-[14px] p-[18px] mb-5 md:p-6 md:max-w-[600px]">
                  <div className="w-6 h-6 rounded-full bg-[#DA7756] text-white text-[10px] font-bold flex items-center justify-center mb-2 font-sans">Y</div>
                  <p className="font-serif text-[14.5px] leading-[1.6] m-0 md:text-[15.5px]">
                    Your industry is in a PE roll-up cycle. <strong>138 deals</strong> closed last year in HVAC alone. If we position you as a platform add-on, your multiple jumps from <strong>3.5&times; to 7&times;</strong>. That&apos;s an extra <strong>$1.2M</strong> on your sale price.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 md:grid md:grid-cols-3 md:gap-3.5">
                  {INTEL_CARDS.map(c => (
                    <div key={c.t} className="bg-white border border-[#E0DCD4] rounded-[14px] p-4 transition-all hover:border-transparent hover:shadow-[0_.5rem_2rem_rgba(0,0,0,.06)]">
                      <h3 className="text-sm font-bold mb-1 m-0">{c.t}</h3>
                      <p className="text-[13px] text-[#4A4843] leading-[1.5] m-0">{c.d}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-10 h-px bg-[#E0DCD4] mx-auto" />

              {/* Pillar 3: Every deal size */}
              <div className="home-pillar py-[60px] md:py-20" id="home-p3">
                <h2 className="font-serif text-[clamp(22px,4vw,36px)] font-black leading-[1.15] tracking-[-0.02em] mb-3 m-0">
                  Every deal size.
                </h2>
                <p className="text-[15px] text-[#4A4843] leading-[1.6] mb-6 max-w-[540px] m-0 md:text-base">
                  $400K landscaping exit to $500M PE portfolio. One platform.
                </p>

                <div
                  className="home-deal-strip flex gap-2.5 overflow-x-auto -mx-5 px-5 pb-2 md:grid md:grid-cols-4 md:gap-3.5 md:overflow-x-visible md:mx-0 md:px-0"
                  style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
                >
                  {DEAL_CHIPS.map(d => (
                    <div
                      key={d.size}
                      className="shrink-0 snap-start bg-white border border-[#E0DCD4] rounded-[14px] px-4 py-3.5 min-w-[160px] cursor-pointer transition-all hover:border-[#DA7756] hover:shadow-[0_2px_12px_rgba(218,119,86,.06)] active:scale-[.97] md:min-w-0"
                      onClick={() => fillAndSend(d.msg)}
                    >
                      <div className="font-serif text-lg font-black tracking-[-0.02em]">{d.size}</div>
                      <div className="text-xs text-[#7A766E] font-medium mb-1.5">{d.type}</div>
                      <div className="text-xs text-[#4A4843] leading-[1.4]">{d.result}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-10 h-px bg-[#E0DCD4] mx-auto" />

              {/* Pillar 4: Built for everyone */}
              <div className="home-pillar py-[60px] md:py-20" id="home-p4">
                <div className="text-[11px] font-semibold tracking-[.14em] uppercase text-[#DA7756] mb-3">BUILT FOR EVERYONE ON THE DEAL</div>
                <h2 className="font-serif text-[clamp(22px,4vw,36px)] font-black leading-[1.15] tracking-[-0.02em] mb-3 m-0">
                  One platform.<br /><em className="italic text-[#DA7756]">Every seat at the table.</em>
                </h2>

                <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-3.5">
                  {PERSONA_CARDS.map(p => (
                    <div
                      key={p.key}
                      className={`bg-white border rounded-[14px] p-5 cursor-pointer transition-all hover:border-transparent hover:shadow-[0_.5rem_2rem_rgba(0,0,0,.06)] hover:-translate-y-px active:scale-[.985] ${p.accent ? 'border-[#DA7756] border-[1.5px]' : 'border-[#E0DCD4]'}`}
                      onClick={() => triggerPill(p.key)}
                    >
                      <div className="pb-3.5 mb-3.5 border-b border-[#E0DCD4]">
                        <div className="font-sans text-base font-bold mb-1.5">{p.title}</div>
                        <p className="text-sm text-[#4A4843] leading-[1.5] m-0">{p.desc}</p>
                      </div>
                      <div className="font-serif text-[13.5px] text-[#DA7756] leading-[1.45] italic">{p.quote}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="home-scroll-cta text-center py-10 pb-[60px]">
                <p className="font-serif text-[clamp(18px,3vw,24px)] font-bold mb-4 m-0">Ready to start?</p>
                <button
                  className="bg-[#DA7756] text-white rounded-full py-3.5 px-8 text-[15px] font-semibold font-sans border-none cursor-pointer transition-all hover:bg-[#C4684A] hover:-translate-y-px hover:shadow-[0_.5rem_2rem_rgba(0,0,0,.06)] active:scale-[.97]"
                  onClick={scrollToTopAndFocusHero}
                  type="button"
                >
                  Talk to Yulia
                </button>
              </div>
            </>
          ) : (
            /* ═══ MESSAGES ═══ */
            <div className="flex flex-col gap-5 py-4 pb-6 max-w-[640px] mx-auto w-full">
              {messages.map((msg, i) => {
                if (msg.type === 'user') {
                  return (
                    <div key={i} className="home-msg-slide self-end max-w-[82%] bg-[#DA7756] text-white px-4 py-3 rounded-[18px_18px_6px_18px] text-[15px] leading-[1.5]">
                      {msg.text}
                    </div>
                  );
                }
                if (msg.type === 'yulia') {
                  return (
                    <div key={i} className="home-msg-slide self-start max-w-[90%]">
                      <div className="w-6 h-6 rounded-full bg-[#DA7756] text-white text-[10px] font-bold flex items-center justify-center mb-1.5 font-sans">Y</div>
                      <div className="home-yt font-serif text-[15px] leading-[1.7]" dangerouslySetInnerHTML={{ __html: msg.html }} />
                    </div>
                  );
                }
                if (msg.type === 'pill-card') {
                  return (
                    <div key={i} className="home-msg-slide self-start max-w-full md:max-w-[560px]">
                      <div className="bg-white border border-[#E0DCD4] rounded-2xl overflow-hidden mb-2">
                        <div className="px-[18px] pt-4 pb-3 border-b border-[#E0DCD4]">
                          <div className="text-[10px] font-semibold tracking-[.12em] uppercase text-[#DA7756] mb-1.5">{msg.label}</div>
                          <div className="font-serif text-lg font-black leading-[1.2] tracking-[-0.015em]">{msg.title}</div>
                        </div>
                        <div className="home-pr-body px-[18px] py-3.5" dangerouslySetInnerHTML={{ __html: msg.body }} />
                      </div>
                    </div>
                  );
                }
                if (msg.type === 'pill-question') {
                  return (
                    <div key={i} className="home-msg-slide px-1">
                      <div className="w-6 h-6 rounded-full bg-[#DA7756] text-white text-[10px] font-bold flex items-center justify-center mb-1.5 font-sans">Y</div>
                      <div className="home-yt font-serif text-[15px] leading-[1.65]" dangerouslySetInnerHTML={{ __html: msg.html }} />
                    </div>
                  );
                }
                return null;
              })}

              {/* Typing indicator */}
              {typing && (
                <div className="flex gap-[5px] py-1.5 self-start">
                  <div className="home-typing-dot w-[7px] h-[7px] rounded-full bg-[#C5C0B8]" />
                  <div className="home-typing-dot w-[7px] h-[7px] rounded-full bg-[#C5C0B8]" />
                  <div className="home-typing-dot w-[7px] h-[7px] rounded-full bg-[#C5C0B8]" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── DOCK (chat mode only) ── */}
      {chatActive && (
        <div
          className="shrink-0 px-5 py-2.5 bg-[#FAF8F4] z-10 md:px-10 md:py-3"
          style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}
        >
          <div className="max-w-[640px] mx-auto">
            <div className="home-input-card bg-white border-[1.5px] border-[#E0DCD4] rounded-[20px] overflow-hidden">
              <div className="relative">
                <textarea
                  ref={dockRef}
                  value={value}
                  onChange={handleChange}
                  onKeyDown={handleKey}
                  placeholder="Type a message..."
                  className="w-full bg-transparent border-none outline-none resize-none text-[16.5px] font-sans text-[#1A1A18] leading-[1.5] placeholder:text-[#B5B0A8] px-5 pt-3.5 pb-2.5 pr-[50px]"
                  style={{ minHeight: 52, maxHeight: 140 }}
                  rows={1}
                />
                <button
                  className={`absolute right-3 bottom-2 w-[38px] h-[38px] rounded-full border-none bg-[#DA7756] text-white cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-[#C4684A] active:scale-95 ${hasContent ? 'opacity-100 scale-100' : 'opacity-0 scale-[.8] pointer-events-none'}`}
                  onClick={send}
                  type="button"
                >
                  <SendIcon />
                </button>
              </div>
              {renderTools(DOCK_TOOLS)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
