import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import Markdown from 'react-markdown';
import { useAnonymousChat } from '../../hooks/useAnonymousChat';
import HomeSidebar from '../../components/public/HomeSidebar';

/* ═══ TYPES ═══ */

type Phase = 'landing' | 'journey' | 'chat';

interface JSection {
  label?: string;
  title: string;
  cards?: { h: string; p: string }[];
  deals?: { sz: string; tp: string; rs: string; msg: string }[];
}

interface JData {
  label: string;
  h1: string;
  sub: string;
  insight: string;
  sections: JSection[];
  quote: { t: string; w: string };
  ph: string;
}

/* ═══ JOURNEY DATA ═══ */

const J: Record<string, JData> = {
  sell: {
    label: 'SELL-SIDE',
    h1: 'Know what you\'re worth. <em>Exactly.</em>',
    sub: '58% of owners have no succession plan and no data on their position. 12 million businesses worth $10 trillion will change hands this decade. Don\u2019t be the one who leaves money on the table.',
    insight: 'The difference between a <strong>2\u00d7 and 4\u00d7 multiple</strong> on identical cash flow comes down to seven factors most owners don\u2019t know about. Recurring revenue, customer concentration, owner dependency, margin quality, growth rate, clean financials, and industry timing. Yulia quantifies every one \u2014 and shows you exactly where you stand before you talk to a single buyer.',
    sections: [
      { label: 'PHASE 1: DISCOVERY', title: 'Tell Yulia about <em>your business.</em>', cards: [
        { h: 'Business classification & market mapping', p: 'Start by telling Yulia your industry, location, revenue, and what you take home. She classifies your business by NAICS code and immediately maps your competitive landscape \u2014 how many similar businesses operate in your market, how they\u2019re distributed by size, and whether your industry is fragmented or consolidated. This is Census County Business Patterns data that PE firms pay analysts to assemble manually. Yulia pulls it in seconds and uses it to frame every analysis that follows.' },
        { h: 'Your market position', p: 'Yulia benchmarks your business against local peers using BLS wage data, BEA economic indicators, and IRS profitability benchmarks for your industry and size band. Are your labor costs above or below market? Is your margin normal for your sector? Is your local economy growing or contracting? Most owners have never seen this data about their own business \u2014 because until now, it didn\u2019t exist in any accessible format.' },
      ] },
      { label: 'PHASE 2: VALUATION', title: 'Find every dollar. <em>Show the math.</em>', cards: [
        { h: 'Add-back identification', p: 'Owners routinely leave $30K\u2013$150K on the table in missed add-backs \u2014 personal vehicle expenses, family health insurance, above-market rent to a related entity, family members on payroll, one-time legal fees, owner perks. Yulia systematically identifies every legitimate add-back by checking your expenses against IRS Statistics of Income benchmarks for your industry. The difference between SDE under $100K (which commands 1.2\u00d7\u20132.4\u00d7) and SDE above $500K (which commands 2.5\u00d7\u20133.5\u00d7+) is enormous. Every add-back found directly increases your sale price.' },
        { h: 'Multi-methodology valuation', p: 'Yulia doesn\u2019t give you one number \u2014 she gives you a defensible range using multiple approaches. Industry-specific SDE/EBITDA multiples calibrated to your geography and business quality. Comparable transaction analysis using recent deals in your sector and size band. Asset-based floor valuation. Each methodology shown with sources, so you \u2014 and potential buyers \u2014 can see exactly how the number was derived. This is the kind of valuation work that M&A advisors charge $5K\u2013$15K to produce.' },
        { h: 'The seven factors that move your multiple', p: 'Within any size band, specific business characteristics create a spread of 1.5\u00d7\u20132.0\u00d7 in the multiple \u2014 the difference between a $1M exit and a $2M exit on identical cash flow. Recurring revenue above 50% is the single most powerful lever. Customer concentration below 15% adds a 20\u201330% premium. Owner independence, margin quality, growth rate, clean financials, and industry timing each move the needle. Yulia scores you on all seven and shows exactly where to improve before going to market.' },
      ] },
      { label: 'PHASE 3: INTELLIGENCE', title: 'The data that changes <em>your outcome.</em>', cards: [
        { h: 'Industry consolidation timing', p: 'Is your industry in a PE roll-up cycle? 138 HVAC deals closed in 2024 alone, with multiples reaching 7\u00d7\u201311\u00d7 EBITDA for platform-quality businesses. Pest control, dental practices, veterinary clinics, IT managed services, and wealth management are all experiencing active PE-driven consolidation. If your industry is in cycle, your multiple could be 2\u00d7\u20133\u00d7 higher than the standard range \u2014 but only if you know it and position accordingly. Yulia tracks every consolidation wave and tells you if your exit window is open.' },
        { h: 'Geographic valuation intelligence', p: 'Location changes everything. A 2025 case study compared two nearly identical manufacturing companies \u2014 $16.9M and $18.2M revenue, similar margins. Company A in Michigan\u2019s Lower Peninsula received 15 offers averaging $15.4M. Company B in the Upper Peninsula received 5 offers averaging $9.4M. A 40% gap from geography alone. Yulia uses BEA Regional Price Parities, Census competitive density data, and BLS wage benchmarks to show how your specific location affects your valuation \u2014 and helps you position the business to buyers in stronger markets.' },
      ] },
      { label: 'PHASE 4: GO TO MARKET', title: 'The package that <em>gets you offers.</em>', cards: [
        { h: 'CIM generation', p: 'Yulia produces a presentation-ready Confidential Information Memorandum \u2014 the document that represents your business to every potential buyer. Executive summary, business narrative, financial analysis with every add-back detailed, market context pulled from Census/BLS/BEA data, comparable transaction analysis, and growth projections. What takes a broker two days in Word and Excel, Yulia builds in minutes \u2014 and the market intelligence woven in gives your CIM a depth that most broker-prepared packages lack entirely.' },
        { h: 'Buyer identification & scoring', p: 'Not all buyers are equal. Yulia identifies likely buyer profiles for your business \u2014 strategic acquirers in your industry, PE firms running roll-ups in your sector, search funds targeting your size range, and individual operators. She scores each buyer type by strategic fit, financing ability, and likelihood to close. If your industry is in a consolidation cycle, she identifies the specific firms doing acquisitions and what they\u2019re paying.' },
      ] },
      { label: 'PHASE 5: CLOSE THE DEAL', title: 'From first offer <em>to closing day.</em>', cards: [
        { h: 'LOI evaluation & negotiation', p: 'When offers arrive, Yulia evaluates each LOI against market benchmarks \u2014 is the proposed multiple fair for your industry and market? Are the terms standard or aggressive? She flags unfavorable provisions (excessive earnouts, unreasonable non-competes, below-market working capital targets) and models different deal structures: asset vs. stock sale implications, earnout scenarios with probability weighting, seller financing terms, and tax impact analysis. You go into negotiation knowing exactly what\u2019s standard and where you have leverage.' },
        { h: 'Due diligence management', p: 'The diligence process is where deals die. Yulia organizes the process: financial document preparation, quality of earnings reconciliation, working capital analysis, customer and vendor contract review, and risk identification. She prepares you for the questions buyers will ask and helps you address potential issues before they become deal-breakers.' },
        { h: 'Deal structuring through closing', p: 'Yulia models the complete deal structure: purchase price allocation, working capital targets and adjustment mechanisms, representations and warranties, indemnification terms, transition services, and non-compete provisions. She helps you understand the tax implications of different structures and works alongside your attorney and CPA to ensure nothing falls through the cracks on the way to closing day.' },
      ] },
      { label: 'EVERY DEAL SIZE', title: 'Your business. <em>Your scale.</em>', deals: [
        { sz: '$1.5M', tp: 'Pest Control', rs: '87% recurring, 3.8\u00d7 SDE', msg: 'I own a pest control company doing $1.5M' },
        { sz: '$8M', tp: 'HVAC', rs: 'PE roll-up cycle, 5.2\u00d7', msg: 'I own an HVAC company doing $8M in revenue' },
        { sz: '$45M', tp: 'Vet Group', rs: 'Corporate buyer, 4.8\u00d7 EBITDA', msg: 'I own a veterinary practice group doing $45M' },
        { sz: '$300M', tp: 'Manufacturing', rs: 'Strategic acquirer, 8.1\u00d7 EBITDA', msg: 'I own a specialty manufacturer doing $300M in revenue' },
      ] },
    ],
    quote: { t: '\u201CTwo nearly identical manufacturing companies \u2014 $16.9M and $18.2M revenue, similar margins. Company A in Michigan\u2019s Lower Peninsula got 15 offers averaging $15.4M. Company B in the Upper Peninsula got 5 offers averaging $9.4M. Location alone caused a 40% valuation gap.\u201D', w: 'Breneman Advisors Case Study, 2025' },
    ph: 'Tell Yulia about your business...',
  },
  buy: {
    label: 'BUY-SIDE',
    h1: 'Find the deal. <em>Know the math.</em>',
    sub: 'Whether you\u2019re a first-time buyer with an SBA loan, a search fund screening 200 targets, or a PE firm running a 12-company roll-up \u2014 the question at every stage is the same: does this deal actually work?',
    insight: 'SBA acquisition lending hit <strong>$8.29 billion</strong> in the first 9 months of FY2025 \u2014 up 34.58% YoY across 7,003 deals. But June 2025\u2019s SOP 50 10 8 changed the rules: <strong>seller notes must now be on full standby for the entire loan term</strong>, and the 10% minimum equity injection is back. Most buyers haven\u2019t caught up yet. Yulia has.',
    sections: [
      { label: 'PHASE 1: SOURCING', title: 'Define your thesis. <em>Find your deal.</em>', cards: [
        { h: 'Acquisition criteria & buyer profile', p: 'Tell Yulia what you\u2019re looking for \u2014 industry, geography, size range, SDE/EBITDA targets, deal structure preferences, and financing approach. She builds your buyer profile and calibrates every analysis to your specific criteria. A first-time buyer using SBA financing has fundamentally different needs than a PE firm building a platform \u2014 Yulia adapts her entire workflow to your situation.' },
        { h: 'Target screening at scale', p: 'For search funds and PE firms, Yulia can screen hundreds of opportunities against your thesis in minutes. She scores every target against the seven factors that separate a 2\u00d7 from a 4\u00d7 multiple: recurring revenue percentage, customer concentration, owner dependency, growth rate, margin quality, financial cleanliness, and industry timing. Deals that fail on fundamentals get flagged immediately \u2014 before you invest a single hour of diligence time.' },
      ] },
      { label: 'PHASE 2: DEAL ANALYSIS', title: 'Kill bad deals <em>in minutes.</em>', cards: [
        { h: 'SBA bankability analysis', p: 'For deals under $5M, SBA 7(a) financing is the dominant mechanism \u2014 and June 2025\u2019s SOP 50 10 8 changed which deals can close. Yulia models the complete structure: 10% minimum equity injection, debt service coverage ratio at current SOFR + SBA margin, seller note standby requirements (now full standby for the entire loan term), personal guarantee obligations, and credit-elsewhere testing. She tells you whether the deal finances before you write the LOI.' },
        { h: 'Red flag detection', p: 'Customer concentration above 30% subtracts 0.5\u00d7\u20131.0\u00d7 from the multiple. Owner dependency \u2014 where the owner generates 80%+ of sales or is the primary client relationship \u2014 turns acquisitions into earnout nightmares. Revenue declining while expenses rise. Inconsistent financials that reduce multiples by 15\u201330%. Yulia flags every red flag systematically, scores the risk, and tells you whether it\u2019s fixable or a deal-killer.' },
        { h: 'Valuation with local intelligence', p: 'The $1M\u2013$5M segment is an information desert. PitchBook and Grata start at $3M+ revenue. BIZCOMPS only covers asset sales under $1M. For a search fund evaluating a $2.5M HVAC business in a mid-sized metro, finding five truly comparable recent transactions is nearly impossible through any single platform. Yulia fills the gap by synthesizing localized Census competitive density, BLS wage benchmarks, BEA economic context, and industry transaction multiples.' },
      ] },
      { label: 'PHASE 3: BIDDING', title: 'Bid with confidence. <em>Win the deal.</em>', cards: [
        { h: 'LOI preparation', p: 'Yulia helps you structure a competitive offer that reflects the true market value of the business in its specific geography. She models multiple scenarios: all-cash vs. SBA-financed, different equity injection levels, earnout structures with probability weighting, and seller financing terms under the new standby rules. Your LOI arrives backed by real market data and a clear financing plan.' },
        { h: 'Deal structure optimization', p: 'Every deal has multiple ways to structure the transaction. Asset purchase vs. stock purchase has tax implications for both sides. Earnout terms need to be realistic and measurable. Working capital targets need to be set correctly or they become a last-minute fight. Yulia models all of these scenarios, shows you the financial impact of each, and helps you propose a structure that works for both sides.' },
      ] },
      { label: 'PHASE 4: DUE DILIGENCE', title: 'Find everything. <em>Miss nothing.</em>', cards: [
        { h: 'Quality of earnings deep dive', p: 'The QoE analysis is where deals get made or broken. Yulia examines revenue quality (one-time vs. recurring, customer concentration trends, contract terms), expense normalization (add-backs that inflate earnings vs. missing costs that deflate them), working capital adequacy, and cash flow sustainability. This is the analysis that PE firms pay $50K\u2013$150K to accounting firms to produce.' },
        { h: 'Market context during diligence', p: 'While you\u2019re in diligence, market conditions are changing. Interest rates shift. A competitor enters the market. A PE firm announces a roll-up in the sector. Yulia maintains a live market intelligence feed for your specific deal \u2014 recalculating DSCR when rates move, flagging competitive landscape changes, and alerting you to industry consolidation activity that could affect the deal\u2019s strategic value.' },
        { h: 'Risk identification & mitigation', p: 'Yulia systematically identifies risks across every dimension: financial (revenue concentration, margin sustainability, working capital adequacy), operational (key employee dependency, system risks, regulatory exposure), market (competitive threats, industry headwinds, geographic risks), and legal (contract assignability, IP ownership, pending litigation). Each risk is scored by severity and probability, with mitigation strategies suggested.' },
      ] },
      { label: 'PHASE 5: CLOSING & BEYOND', title: 'Close the deal. <em>Protect the value.</em>', cards: [
        { h: 'Closing management', p: 'The period between signing the purchase agreement and closing is where deals slip away. Yulia tracks every closing condition: financing commitments, landlord consents, contract assignments, regulatory approvals, working capital calculations, and funds flow. When issues arise \u2014 and they always do \u2014 she helps you assess whether they\u2019re material and how to resolve them without killing the deal.' },
        { h: 'Post-merger integration: the first 100 days', p: 'Most acquisitions lose value in the first year because integration is an afterthought. Yulia starts PMI planning during diligence \u2014 not after closing. Key employee identification and retention strategy. Customer communication plan. System and process transitions. Financial integration and reporting. The first 100 days set the trajectory for the entire investment \u2014 Yulia makes sure you have a plan before day one.' },
      ] },
      { label: 'EVERY BUYER TYPE', title: 'Individual to <em>institutional.</em>', deals: [
        { sz: '$2M', tp: 'Dental Practice', rs: '5 local comps, 2.8\u00d7 SDE', msg: 'Search fund evaluating a $2M dental practice' },
        { sz: '$15M', tp: 'IT Services', rs: '47 targets scored for roll-up', msg: 'Building a managed IT services roll-up, $3-15M ARR targets' },
        { sz: '$120M', tp: 'Home Services', rs: '6 bolt-ons in 14 months', msg: 'PE platform, home services roll-up at $120M' },
        { sz: '$500M', tp: 'Healthcare Platform', rs: 'Cross-border, dual-track process', msg: 'Evaluating a $500M healthcare platform acquisition' },
      ] },
    ],
    quote: { t: '\u201CSBA acquisition loans default at just 1.93% \u2014 29% lower than non-acquisition SBA loans. The data is on your side if you structure the deal right. Most buyers don\u2019t know the June 2025 rules yet. That\u2019s an edge.\u201D', w: 'Yulia, on SBA-backed acquisitions' },
    ph: 'Tell Yulia what you\'re looking for...',
  },
  raise: {
    label: 'RAISE CAPITAL',
    h1: 'The right capital. <em>The right terms.</em>',
    sub: 'Whether you\u2019re raising your first round of growth capital, refinancing debt, or bringing in a strategic partner \u2014 Yulia helps you find the money, prepare the materials, and negotiate the terms.',
    insight: 'Most business owners approach capital raising backwards \u2014 they start looking for money before they know what they need, how much to ask for, or what terms are reasonable. Yulia starts with a <strong>capital needs assessment</strong> that maps your situation to the right capital sources, then builds the materials and strategy to get you funded.',
    sections: [
      { label: 'PHASE 1: READINESS', title: 'Are you ready <em>to raise?</em>', cards: [
        { h: 'Capital needs assessment', p: 'Tell Yulia about your business, your goals, and why you need capital. She classifies your situation \u2014 growth capital, acquisition financing, working capital, debt refinancing, partner buyout \u2014 and maps it to the right capital sources. Not every business needs equity. Not every situation calls for SBA. Yulia tells you which path fits and why.' },
        { h: 'Financial package preparation', p: 'Investors and lenders speak the language of clean financials. Yulia prepares a complete financial package: normalized P&L with add-backs identified, balance sheet analysis, cash flow projections, and debt service capacity modeling. She flags the issues that will come up in diligence \u2014 revenue concentration, owner dependency, margin trends \u2014 so you can address them before they become objections.' },
      ] },
      { label: 'PHASE 2: MATERIALS', title: 'The package that <em>gets you funded.</em>', cards: [
        { h: 'Pitch deck & investor narrative', p: 'Yulia builds a presentation-ready pitch deck: your story, the opportunity, market context (pulled from Census and BLS data for your industry and geography), financial performance, use of funds, and projected returns. She frames the narrative around what investors in your space actually care about \u2014 which varies dramatically by capital source.' },
        { h: 'Investment teaser & CIM', p: 'For confidential processes, Yulia generates a blind teaser that generates interest without revealing identity, plus a full CIM with market intelligence woven in. The depth of data \u2014 competitive density, local wage benchmarks, GDP trajectory \u2014 signals to investors that you understand your market better than most businesses they see.' },
      ] },
      { label: 'PHASE 3: MATCHING', title: 'Find the right <em>capital source.</em>', cards: [
        { h: 'Investor & lender matching', p: 'Not all money is the same. SBA 7(a) for acquisitions under $5M. Conventional bank lines for working capital. Growth equity for expansion. Mezzanine for leveraged situations. PE for control transactions. Yulia matches your specific situation to the capital sources most likely to fund \u2014 and tells you what terms to expect from each.' },
        { h: 'Outreach strategy', p: 'Yulia helps you build a targeted outreach list and communication strategy. How many sources to approach simultaneously. How to create competitive tension. When to share financials. How to handle NDAs and data rooms. The process matters as much as the materials \u2014 sloppy process signals sloppy operations.' },
      ] },
      { label: 'PHASE 4: TERMS & CLOSE', title: 'Negotiate from <em>strength.</em>', cards: [
        { h: 'Term sheet analysis', p: 'When offers arrive, Yulia breaks down every term: valuation methodology, equity dilution, control provisions, anti-dilution clauses, liquidation preferences, board composition, information rights, and protective covenants. She benchmarks each term against market standards so you know what\u2019s fair, what\u2019s aggressive, and where you have leverage.' },
        { h: 'Diligence & closing', p: 'Capital raise diligence is different from M&A diligence \u2014 investors focus on growth potential, market size, and management capability rather than just historical financials. Yulia prepares you for investor questions, organizes the data room, and helps manage the process through funding.' },
      ] },
      { label: 'EVERY CAPITAL NEED', title: 'Your situation. <em>Your solution.</em>', deals: [
        { sz: '$2M', tp: 'Growth Equity', rs: '3 investor matches', msg: 'Looking to raise $2M in growth equity for expansion' },
        { sz: '$15M', tp: 'Acquisition Line', rs: 'Bank vs. mezz analysis', msg: 'I need $15M in acquisition financing for a roll-up' },
        { sz: '$75M', tp: 'PE Recapitalization', rs: 'Partial liquidity, retain ops', msg: 'Exploring a PE recap, want partial liquidity at $75M' },
        { sz: '$250M', tp: 'Institutional Round', rs: '4 lead investors, dual-track', msg: 'Raising a $250M institutional round for platform expansion' },
      ] },
    ],
    quote: { t: '\u201CMost founders approach 15 investors and hear back from 3. The ones who get funded fast have two things: clean financials and a clear story. Yulia builds both before you make a single call.\u201D', w: 'Yulia, on capital raising' },
    ph: 'Tell Yulia about your capital needs...',
  },
  intelligence: {
    label: 'AI INTELLIGENCE',
    h1: 'Intelligence no one <em>else has.</em>',
    sub: 'The answer to \u201CWhat is this business worth in this market, can it be financed, and should you act now?\u201D No platform answers that for SMB. We\u2019re the first.',
    insight: 'No existing platform combines local economic context with industry competitive density and valuation benchmarks. A PE firm using Grata has <strong>zero insight</strong> into local wage structure or cost-of-living dynamics. A broker listing in Boise has <strong>no systematic way</strong> to compare that market to Denver. We built the integration layer that turns free government data into institutional-grade intelligence.',
    sections: [
      { label: 'THE DATA FOUNDATION', title: 'Six federal engines. <em>One intelligence layer.</em>', cards: [
        { h: 'Census County Business Patterns', p: 'Establishment counts by 6-digit NAICS code at the ZIP, county, and MSA level \u2014 along with employment and annual payroll. This is the foundation for competitive landscape intelligence: how many businesses like yours operate in your market, how they\u2019re distributed by size, and whether your industry is fragmented (roll-up opportunity) or consolidated (barrier to entry).' },
        { h: 'BLS Quarterly Census of Employment & Wages', p: 'Average weekly wages by industry at the county level, updated quarterly. This answers critical deal questions: Is a seller\u2019s payroll competitive or bloated? Are labor costs rising in this market? How does this geography compare to the national average for this industry?' },
        { h: 'BEA Regional Economic Accounts', p: 'County-level GDP, GDP growth rates, and Regional Price Parities that measure local purchasing power. $100 in San Francisco buys $84.58 worth of goods nationally, while $100 in Pine Bluff, Arkansas buys $124.49 \u2014 a 47% gap that should change how every comp is interpreted. No other platform adjusts for this.' },
        { h: 'FRED + Treasury + SBA Lending Data', p: 'Real-time interest rates, SBA 7(a) lending volumes by district, inflation metrics, and Treasury yield curves \u2014 all feeding directly into deal structure analysis. When rates shift, Yulia recalculates every active deal\u2019s DSCR automatically.' },
        { h: 'IRS Statistics of Income', p: 'Profitability benchmarks by industry and business size \u2014 the only public dataset that shows what businesses actually earn as a percentage of revenue, broken down by NAICS code and revenue band. This is how Yulia calibrates add-back analysis.' },
        { h: 'SEC EDGAR + Transaction Comparables', p: 'Public company filings, M&A transaction records, and comparable deal multiples across sectors and sizes. Combined with localized data, this creates valuation context that\u2019s both industry-specific and geography-adjusted \u2014 institutional-grade analysis applied to the SMB segment where it\u2019s never existed.' },
      ] },
      { label: 'WHAT THIS MAKES POSSIBLE', title: 'Products no one <em>else can build.</em>', cards: [
        { h: 'One-Click Market Intelligence Report', p: 'Enter any NAICS code and any geography. Yulia generates a complete market picture: competitive density and fragmentation score, local wage benchmarks vs. national averages, GDP trajectory, cost-of-living adjustment, estimated valuation ranges, and current buyer demand signals.' },
        { h: 'Market Fragmentation Heat Map', p: 'Roll-up opportunity scored by industry and MSA \u2014 derived from Census establishment counts and size distributions, overlaid with BLS wage pressure data and BEA growth trajectories. The dashboard PE associates currently spend weeks building for each new thesis, updated continuously.' },
        { h: 'Your Business vs. Your Market', p: 'How does your revenue and headcount compare to local industry peers? Are your labor costs above or below market? What are businesses like yours actually selling for in your geography? Data-driven context that replaces \u201CI think it\u2019s worth about...\u201D with \u201CHere\u2019s exactly where you stand and why.\u201D' },
      ] },
    ],
    quote: { t: '\u201CThe moat isn\u2019t the data \u2014 it\u2019s free and public. The moat is the integration layer: cross-source NAICS concordance, temporal alignment across datasets with different update cycles, suppression gap-filling, and derived metrics. A ChatGPT prompt can\u2019t do any of this.\u201D', w: 'smbx.ai Architecture' },
    ph: 'Ask about any industry or market...',
  },
  agency: {
    label: 'AGENTIC AI',
    h1: 'She does <em>the work.</em>',
    sub: 'Ask ChatGPT about a deal and you get a paragraph. Ask Yulia and you get a CIM, a valuation model, an SBA financing analysis, and a deal memo. She doesn\u2019t answer questions. She produces work product.',
    insight: 'Upload a P&L and get a complete confidential information memorandum \u2014 <strong>narrative, financials, add-backs, projections, and market context</strong>. Describe a target and get it scored against seven valuation factors instantly. Tell her to screen a deal and she checks <strong>SBA eligibility, red flags, DSCR, and structure</strong> before you write the LOI.',
    sections: [
      { label: 'WORK PRODUCT', title: 'Deliverables. <em>Not paragraphs.</em>', cards: [
        { h: 'Confidential Information Memorandum', p: 'Upload a P&L, tax return, or financial summary. Yulia produces a presentation-ready CIM: executive summary, business narrative, financial analysis with every add-back identified, market context from Census/BLS/BEA data, comparable transaction analysis, and growth projections. What takes a broker two days of Word and Excel, built in minutes with real market data woven in.' },
        { h: 'Multi-Methodology Valuation', p: 'SDE and EBITDA calculation with systematic add-back identification \u2014 checked against IRS Statistics of Income benchmarks for your industry and size band. Then multiple valuation approaches: industry-specific multiples, comparable transactions adjusted for geography and business quality, and asset-based floor valuation. Every number sourced, every assumption shown.' },
        { h: 'SBA Financing Model', p: 'Full deal structure analysis under the current SOP 50 10 8 rules: 10% equity injection requirement, DSCR at current SOFR + SBA margin, seller note standby period modeling, personal guarantee obligations, and credit-elsewhere test. Tells you exactly whether a deal finances, what the monthly payment looks like, and how to structure the equity stack.' },
        { h: 'Deal Screening Memo', p: 'The seven valuation factors scored (recurring revenue %, customer concentration, owner dependency, growth rate, margin quality, financial cleanliness, industry timing), red flags identified, financing feasibility assessed, and a go/no-go recommendation with the reasoning shown. Kill bad deals in minutes, not months.' },
      ] },
      { label: 'PROCESS MANAGEMENT', title: 'From first message <em>to integration.</em>', cards: [
        { h: 'Adaptive deal workspace', p: 'Every conversation builds context. Yulia maintains a living deal profile that evolves as you share more information. She doesn\u2019t start from scratch each time. She remembers your deal, tracks what\u2019s been completed, identifies what\u2019s missing, and proactively surfaces the next most valuable action.' },
        { h: 'Buyer/target matching', p: 'For sellers: identifies likely buyer profiles \u2014 financial buyers, strategic acquirers, PE roll-ups, individual operators \u2014 scored by fit and financing ability. For buyers: screens targets against your thesis, ranks by attractiveness, and helps prioritize diligence time.' },
        { h: 'Diligence through closing', p: 'Quality of earnings, working capital targets, deal structure comparison, risk identification, and closing checklists. Yulia doesn\u2019t replace your attorney or CPA \u2014 she arms them with organized, pre-analyzed information so their billable hours go further.' },
        { h: 'Post-merger integration', p: 'The deal closes \u2014 now what? First 100 days: key employee retention, customer communication, system transitions, financial integration, and operational continuity. Most deals lose value because integration is an afterthought. Yulia makes it part of the process from day one.' },
      ] },
    ],
    quote: { t: '\u201CThe single most valuable intelligence is the specific, localized answer to: What is this business worth in this market, can it be financed, and should you act now? No one answered that for SMB until now.\u201D', w: 'smbx.ai' },
    ph: 'Tell Yulia what you need built...',
  },
};

/* ═══ ACTION CARDS ═══ */

const ACTION_CARDS = [
  { key: 'sell', label: 'Sell my business', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg> },
  { key: 'buy', label: 'Buy a business', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg> },
  { key: 'raise', label: 'Raise capital', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round"><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></svg> },
  { key: 'agency', label: 'Agentic AI', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg> },
  { key: 'intelligence', label: 'AI intelligence', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg> },
];

/* ═══ TOOL ITEMS ═══ */

interface ToolItem {
  label: string;
  desc: string;
  fill?: string;
  action?: 'upload';
  icon: React.ReactNode;
}

const TOOLS: ToolItem[] = [
  { label: 'Upload financials', desc: 'Share a P&L, tax return, or balance sheet', action: 'upload', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg> },
  { label: 'Business valuation', desc: 'Estimate worth based on revenue, earnings, and comps', fill: 'I need a business valuation \u2014 I own a ', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg> },
  { label: 'Search for a business', desc: 'Find businesses by industry, location, size, or price', fill: "Help me find a business \u2014 I'm looking for ", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg> },
  { label: 'SBA loan check', desc: 'See if a deal qualifies for SBA 7(a) \u2014 up to $5M, 10% down', fill: "Can this deal get SBA financing? I'm looking at a ", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
];

/* ═══ COMPONENT ═══ */

export default function Home() {
  const [phase, setPhase] = useState<Phase>('landing');
  const [currentJ, setCurrentJ] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [toolsOpen, setToolsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { messages, sending, streamingText, error, limitReached, sendMessage, getSessionId, sessionData, reset: resetChat } = useAnonymousChat({ context: currentJ || undefined });

  const [attachment, setAttachment] = useState<{ name: string; size: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const plusRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Scroll to bottom */
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 50);
  }, []);

  /* Show journey */
  const showJourney = useCallback((key: string) => {
    setCurrentJ(key);
    setPhase('journey');
    window.history.pushState({ smbx: key }, '', '/#' + key);
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, 50);
  }, []);

  /* Enter chat */
  const enterChat = useCallback(() => {
    setPhase('chat');
    window.history.pushState({ smbx: 'chat' }, '', '/#chat');
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, 50);
  }, []);

  /* Go home */
  const goHome = useCallback(() => {
    setPhase('landing');
    setCurrentJ(null);
    resetChat();
    setValue('');
    setToolsOpen(false);
    if (inputRef.current) inputRef.current.style.height = 'auto';
    window.history.pushState({}, '', '/');
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, 50);
  }, [resetChat]);

  /* Send message */
  const send = useCallback(() => {
    const t = value.trim();
    if (!t || sending) return;
    setToolsOpen(false);
    if (phase !== 'chat') enterChat();
    setValue('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    sendMessage(t);
  }, [value, sending, phase, enterChat, sendMessage]);

  /* Deal tap */
  const dealTap = useCallback((msg: string) => {
    if (sending) return;
    if (phase !== 'chat') enterChat();
    sendMessage(msg);
  }, [sending, phase, enterChat, sendMessage]);

  /* Fill input from tool popup */
  const fillInput = useCallback((text: string) => {
    setValue(text);
    setToolsOpen(false);
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 140) + 'px';
        inputRef.current.focus();
      }
    });
  }, []);

  /* Handle tool click — either fill or action */
  const handleToolClick = useCallback((tool: ToolItem) => {
    if (tool.action === 'upload') {
      setToolsOpen(false);
      fileInputRef.current?.click();
    } else if (tool.fill) {
      fillInput(tool.fill);
    }
  }, [fillInput]);

  /* File upload handler */
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Ensure session exists
    const sessionId = getSessionId();
    if (!sessionId) {
      // Need to start a session first — enter chat mode
      if (phase !== 'chat') enterChat();
    }

    setUploading(true);
    setToolsOpen(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Ensure session exists before upload
      const sid = getSessionId() || await (async () => {
        // Create session by sending a dummy — actually, let's just create one
        const res = await fetch('/api/chat/anonymous', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ context: currentJ || undefined }),
        });
        if (res.ok) {
          const data = await res.json();
          return data.sessionId;
        }
        return null;
      })();

      if (!sid) {
        setUploading(false);
        return;
      }

      const res = await fetch(`/api/chat/anonymous/${sid}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAttachment({ name: data.file.name, size: data.file.sizeFormatted });
        if (phase !== 'chat') enterChat();
        // Auto-send a message about the upload
        sendMessage(`I've uploaded my financials: ${data.file.name}. Let me walk you through the key numbers.`);
      }
    } catch {
      // ignore upload errors silently
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [getSessionId, phase, enterChat, sendMessage, currentJ]);

  /* Textarea handlers */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  }, []);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }, [send]);

  /* Click outside to close tools */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (toolsOpen &&
        toolsRef.current && !toolsRef.current.contains(e.target as Node) &&
        plusRef.current && !plusRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [toolsOpen]);

  /* Scroll to bottom on new messages / typing */
  useEffect(() => {
    if (phase === 'chat') scrollToBottom();
  }, [messages, sending, streamingText, phase, scrollToBottom]);

  /* Focus input on chat enter */
  useEffect(() => {
    if (phase === 'chat') setTimeout(() => inputRef.current?.focus(), 100);
  }, [phase]);

  /* Browser back button */
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const s = e.state as { smbx?: string } | null;
      if (s?.smbx && s.smbx !== 'chat' && J[s.smbx]) {
        setCurrentJ(s.smbx);
        setPhase('journey');
      } else {
        setPhase('landing');
        setCurrentJ(null);
        resetChat();
        setValue('');
        setToolsOpen(false);
      }
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      }, 50);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [resetChat]);

  /* Deep link support — check hash on mount */
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '').toLowerCase();
    if (hash && J[hash]) {
      setCurrentJ(hash);
      setPhase('journey');
      window.history.replaceState({ smbx: hash }, '', '/#' + hash);
    }
  }, []);

  const hasContent = value.trim().length > 0;

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-[#FAF8F4]" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* ── SIDEBAR ── */}
      <HomeSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewConversation={() => { goHome(); setSidebarOpen(false); }}
        currentSessionId={getSessionId()}
        messages={messages}
        sessionData={sessionData}
      />

      {/* ── TOPBAR ── */}
      <div
        className="shrink-0 z-20 relative"
        style={{ borderBottom: phase === 'chat' ? '1px solid #DDD9D1' : '1px solid transparent', transition: 'border-color .3s' }}
      >
        <div className="flex items-center justify-between px-3 py-3 md:px-8 lg:px-12 overflow-hidden">
          <div className="flex items-center gap-1.5 min-w-0 shrink">
            {phase !== 'landing' ? (
              <button
                onClick={goHome}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-transparent border-none cursor-pointer text-[#3D3B37] hover:bg-[rgba(212,113,78,.08)] hover:text-[#D4714E] transition-colors shrink-0"
                type="button"
                aria-label="Back"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-transparent border-none cursor-pointer text-[#3D3B37] hover:bg-[rgba(212,113,78,.08)] hover:text-[#D4714E] transition-colors shrink-0"
                type="button"
                aria-label="Open sidebar"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              </button>
            )}
            <div
              className="text-[24px] font-extrabold tracking-[-0.03em] text-[#1A1A18] cursor-pointer select-none shrink-0 md:text-[26px] lg:text-[28px]"
              onClick={goHome}
            >
              smb<span className="text-[#D4714E]">x</span>.ai
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {phase !== 'landing' && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-transparent border-none cursor-pointer text-[#3D3B37] hover:bg-[rgba(212,113,78,.08)] hover:text-[#D4714E] transition-colors"
                type="button"
                aria-label="Open sidebar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              </button>
            )}
            <Link href="/login" className="flex items-center justify-center bg-transparent border-none cursor-pointer text-[#3D3B37] p-1.5 rounded-full transition-all hover:text-[#D4714E] hover:bg-[rgba(212,113,78,.08)] no-underline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* ── SCROLL AREA ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overscroll-y-contain pb-20"
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        <div className="px-5 md:max-w-[860px] md:px-10 md:mx-auto lg:max-w-[960px] lg:px-12">

          {/* ═══ LANDING ═══ */}
          {phase === 'landing' && (
            <div className="flex flex-col items-center justify-center text-center py-10 min-h-[calc(100dvh-60px-80px)]">
              <h1 className="home-fade-up text-[44px] font-extrabold leading-[1.08] tracking-[-0.03em] mb-5 md:text-[48px] md:mb-7 lg:text-[54px] lg:mb-11">
                Sell a business.<br />Buy a business.<br />Raise capital.
              </h1>
              <p className="home-fade-up text-[20px] text-[#6E6A63] leading-[1.45] max-w-[360px] mb-11 md:text-[19px] md:max-w-[440px] md:mb-12 lg:text-[20px] lg:max-w-[480px] lg:mb-20" style={{ animationDelay: '.06s' }}>
                AI-powered M&amp;A. From first question to closing day.
              </p>

              <div className="home-agrid w-full home-fade-up md:max-w-[660px] lg:max-w-[900px] lg:mb-6" style={{ animationDelay: '.18s' }}>
                {ACTION_CARDS.map((c) => (
                  <div
                    key={c.key}
                    className="home-acard"
                    onClick={() => showJourney(c.key)}
                  >
                    {c.icon}
                    <span className="text-[11px] font-bold leading-[1.2] text-[#1A1A18] md:text-[16px] lg:text-base">{c.label}</span>
                  </div>
                ))}
              </div>

              <div className="home-landing-nudge flex-col items-center mt-8 home-fade-up" style={{ animationDelay: '.3s' }}>
                <p className="text-[22px] text-[#6E6A63] leading-[1.4] text-center max-w-[420px] font-medium lg:text-[24px] lg:max-w-[480px]" style={{ fontFamily: "'Caveat', cursive" }}>
                  Pick a card to learn more, or just start chatting with Yulia and dive right in &mdash; for free.
                </p>
                <svg className="mt-4" width="28" height="52" viewBox="0 0 24 48" fill="none" stroke="rgba(212,113,78,.45)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'nudgeBounce 2s ease infinite' }}>
                  <path d="M12 4v28" /><path d="M6 26l6 8 6-8" />
                </svg>
              </div>
            </div>
          )}

          {/* ═══ JOURNEY ═══ */}
          {phase === 'journey' && currentJ && (() => {
            const j = J[currentJ];
            return (
              <div className="home-fade-up py-7 pb-24" style={{ animationDuration: '.35s' }}>
                <div className="mb-9">
                  <div className="text-sm font-bold tracking-[.12em] uppercase text-[#D4714E] mb-3.5">{j.label}</div>
                  <h1 className="home-j-heading text-[36px] font-extrabold leading-[1.1] tracking-[-0.02em] mb-4 lg:text-[40px]" dangerouslySetInnerHTML={{ __html: j.h1 }} />
                  <p className="text-[20px] text-[#3D3B37] leading-[1.5] max-w-[560px]">{j.sub}</p>
                </div>

                <div className="home-j-insight mb-10">
                  <p className="text-[18px] leading-[1.6] font-medium">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#D4714E] text-white text-[11px] font-bold mr-2 align-middle" style={{ boxShadow: '0 2px 6px rgba(212,113,78,.2)' }}>Y</span>
                    <span dangerouslySetInnerHTML={{ __html: j.insight }} />
                  </p>
                </div>

                {j.sections.map((s, si) => (
                  <div key={si}>
                    <div className="mb-10">
                      {s.label && <div className="text-sm font-bold tracking-[.1em] uppercase text-[#D4714E] mb-3.5">{s.label}</div>}
                      <h3 className="home-j-heading text-[28px] font-extrabold leading-[1.15] mb-[18px] tracking-[-0.015em] lg:text-[26px]" dangerouslySetInnerHTML={{ __html: s.title }} />

                      {s.cards && (
                        <div className="flex flex-col gap-3.5 md:grid md:grid-cols-3 md:gap-3">
                          {s.cards.map((c, ci) => (
                            <div key={ci} className="home-j-card">
                              <h4 className="text-[19px] font-bold mb-2.5 m-0">{c.h}</h4>
                              <p className="text-[17px] text-[#3D3B37] leading-[1.55] m-0">{c.p}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {s.deals && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-1">
                          {s.deals.map((d, di) => (
                            <div key={di} className="home-j-deal" onClick={() => dealTap(d.msg)}>
                              <div className="text-[30px] font-extrabold tracking-[-0.02em] text-[#D4714E]">{d.sz}</div>
                              <div className="text-base font-bold mb-2">{d.tp}</div>
                              <div className="text-base text-[#3D3B37] leading-[1.45]">{d.rs}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="w-10 h-px bg-[#DDD9D1] my-10" />
                  </div>
                ))}

                <div className="home-j-quote">
                  <em className="block text-[20px] leading-[1.5] font-semibold mb-3 not-italic" dangerouslySetInnerHTML={{ __html: j.quote.t }} />
                  <div className="text-[15px] text-[#D4714E] font-semibold">&mdash; {j.quote.w}</div>
                </div>

                <div className="flex flex-col items-center mt-10 mb-5">
                  <p className="text-[22px] text-[#6E6A63] leading-[1.4] text-center max-w-[360px] font-medium lg:text-[24px] lg:max-w-[420px]" style={{ fontFamily: "'Caveat', cursive" }}>
                    Just start chatting to get started &mdash; it&apos;s free.
                  </p>
                  <svg className="mt-4" width="28" height="52" viewBox="0 0 24 48" fill="none" stroke="rgba(212,113,78,.45)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'nudgeBounce 2s ease infinite' }}>
                    <path d="M12 4v28" /><path d="M6 26l6 8 6-8" />
                  </svg>
                </div>
              </div>
            );
          })()}

          {/* ═══ CHAT MESSAGES ═══ */}
          {phase === 'chat' && (
            <div className="flex flex-col gap-4 py-5 pb-6 max-w-[640px] mx-auto w-full">
              {messages.map((msg) =>
                msg.role === 'user' ? (
                  <div key={msg.id} className="home-msg-slide self-end max-w-[82%] bg-[#D4714E] text-white px-[18px] py-3.5 rounded-[20px_20px_6px_20px] text-base leading-[1.5] break-words overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(212,113,78,.2)', overflowWrap: 'break-word' }}>
                    {msg.content}
                  </div>
                ) : (
                  <div key={msg.id} className="home-msg-slide self-start max-w-[90%] min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#D4714E] text-white text-xs font-bold flex items-center justify-center mb-2 shrink-0" style={{ boxShadow: '0 2px 6px rgba(212,113,78,.2)' }}>Y</div>
                    <div className="bg-white rounded-[20px] px-[18px] py-4 text-base leading-[1.65] font-medium home-yt overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(26,26,24,.05)', overflowWrap: 'break-word' }}>
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                ),
              )}
              {sending && streamingText && (
                <div className="home-msg-slide self-start max-w-[90%] min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#D4714E] text-white text-xs font-bold flex items-center justify-center mb-2 shrink-0" style={{ boxShadow: '0 2px 6px rgba(212,113,78,.2)' }}>Y</div>
                  <div className="bg-white rounded-[20px] px-[18px] py-4 text-base leading-[1.65] font-medium home-yt overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(26,26,24,.05)', overflowWrap: 'break-word' }}>
                    <Markdown>{streamingText}</Markdown>
                  </div>
                </div>
              )}
              {sending && !streamingText && (
                <div className="flex gap-[5px] py-2 self-start">
                  <div className="home-typing-dot w-2 h-2 rounded-full bg-[#A9A49C]" />
                  <div className="home-typing-dot w-2 h-2 rounded-full bg-[#A9A49C]" />
                  <div className="home-typing-dot w-2 h-2 rounded-full bg-[#A9A49C]" />
                </div>
              )}
              {error && (
                <div className="self-center text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</div>
              )}
              {limitReached && (
                <div className="self-center text-sm text-[#6E6A63] bg-[#F3F0EA] px-4 py-3 rounded-lg text-center">
                  <p className="font-semibold mb-1">Message limit reached</p>
                  <Link href="/signup" className="text-[#D4714E] font-semibold hover:underline">Sign up for unlimited access</Link>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.xlsx,.xls,.csv"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* ── DOCK ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 px-3 md:px-5 bg-[#FAF8F4] border-t border-[#DDD9D1]"
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))', paddingTop: '8px' }}
      >
        <div className="max-w-[640px] mx-auto">
          {/* Attachment bubble */}
          {attachment && (
            <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-white rounded-lg border border-[#DDD9D1]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              <span className="text-sm font-medium text-[#1A1A18] truncate flex-1">{attachment.name}</span>
              <span className="text-xs text-[#A9A49C]">{attachment.size}</span>
              <button onClick={() => setAttachment(null)} className="text-[#A9A49C] hover:text-[#1A1A18] bg-transparent border-none cursor-pointer p-0.5" type="button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          <div className="home-dock-card relative">
            {/* Tool popup */}
            <div ref={toolsRef} className={`home-tools-popup ${toolsOpen ? 'open' : ''}`}>
              {TOOLS.map(t => (
                <button key={t.label} className="home-tp-item" onClick={() => handleToolClick(t)} type="button">
                  {t.icon}
                  <div>
                    <div className="text-[15px] font-semibold text-[#1A1A18] leading-[1.3]">{t.label}</div>
                    <div className="text-[13px] text-[#6E6A63] leading-[1.4] mt-0.5">{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="relative">
              <button
                ref={plusRef}
                onClick={() => setToolsOpen(prev => !prev)}
                className="absolute left-2.5 top-2 w-9 h-9 rounded-full border-none bg-[#F3F0EA] text-[#D4714E] cursor-pointer flex items-center justify-center z-[2] hover:bg-[#FFF0EB] active:scale-90"
                style={{ transition: 'all .2s' }}
                type="button"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-[#D4714E] border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: toolsOpen ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
              </button>
              <textarea
                ref={inputRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKey}
                placeholder="Tell Yulia about your deal..."
                className="w-full bg-transparent border-none outline-none resize-none text-[17px] text-[#1A1A18] leading-[1.5] placeholder:text-[#6E6A63] lg:text-[18px]"
                style={{ fontFamily: 'inherit', minHeight: 50, maxHeight: 140, padding: '14px 52px 14px 50px' }}
                rows={1}
              />
              <button
                onClick={send}
                className={`absolute right-2 top-2 w-9 h-9 rounded-full border-none bg-[#D4714E] text-white cursor-pointer flex items-center justify-center hover:bg-[#BE6342] active:scale-90 ${hasContent && !sending ? 'opacity-100 scale-100' : 'opacity-0 scale-[.8] pointer-events-none'}`}
                style={{ boxShadow: '0 2px 8px rgba(212,113,78,.3)', transition: 'all .2s' }}
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
