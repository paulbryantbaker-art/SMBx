import { useState, useRef, useEffect } from 'react';
import { Suggestion } from './ui';

interface Message {
  role: 'user' | 'yulia';
  content: string;
}

export default function PricingContent() {
  const [viewState, setViewState] = useState<'landing' | 'chat'>('landing');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewState === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, viewState]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  };

  const handleSend = (e: React.SyntheticEvent | null, forcedText?: string) => {
    e?.preventDefault();
    const textToSend = forcedText || inputValue;
    if (!textToSend.trim()) return;

    setViewState('chat');
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setInputValue('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'yulia',
        content: "That's exactly what I'm built for. The initial advisory conversation is free — no credit card, no signup wall. Tell me about your deal and I'll show you what the analysis looks like before you spend a dollar."
      }]);
    }, 1500);
  };

  return (
    <div className={`bg-[#FDFCFB] text-[#1A1A18] font-sans relative selection:bg-[#D4714E] selection:text-white overflow-x-hidden ${viewState === 'chat' ? 'h-full flex flex-col overflow-hidden' : 'min-h-screen'}`}>

      {/* --- 1. CHAT MESSAGES AREA --- */}
      <div className={`w-full max-w-4xl mx-auto px-6 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${viewState === 'chat' ? 'flex-1 py-8 opacity-100 overflow-y-auto min-h-0' : 'h-0 opacity-0 overflow-hidden'}`} style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
        <div className="flex-1 flex flex-col justify-end gap-6 pb-4">
          {viewState === 'chat' && (
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE6DF] mb-4">
              <button onClick={() => setViewState('landing')} className="text-sm font-bold text-[#A9A49C] hover:text-[#1A1A18] transition-colors" type="button">
                &larr; Exit Workspace
              </button>
              <div className="text-xs font-bold uppercase tracking-widest text-[#D4714E]">Intelligence Engine Active</div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'yulia' && (
                <div className="w-8 h-8 rounded-full bg-[#D4714E] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm mt-1">Y</div>
              )}
              <div className={`p-5 rounded-2xl max-w-[85%] sm:max-w-[75%] leading-relaxed text-[16px] shadow-sm border ${
                msg.role === 'user'
                  ? 'bg-white border-[#EAE6DF] text-[#1A1A18] rounded-tr-sm shadow-[0_4px_12px_rgba(212,113,78,0.08)]'
                  : 'bg-[#F8F6F1] border-[#EAE6DF] text-[#6E6A63] rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#D4714E] flex items-center justify-center text-white font-bold text-xs shrink-0 mt-1 shadow-sm">Y</div>
              <div className="p-5 rounded-2xl rounded-tl-sm bg-[#F8F6F1] border border-[#EAE6DF] flex items-center gap-1.5 shadow-sm h-[60px]">
                <div className="w-2 h-2 bg-[#A9A49C] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#A9A49C] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#A9A49C] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* --- 2. TOP LANDING CONTENT --- */}
      <div className={`grid transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${viewState === 'landing' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <section className="px-6 pt-20 md:pt-40 pb-8 max-w-5xl mx-auto w-full relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0EB] text-[#D4714E] text-xs font-bold tracking-wider uppercase mb-10 border border-[#FBE3D9]">
              Pay-As-You-Go Pricing
            </div>

            <h1 className="text-5xl md:text-[80px] font-extrabold tracking-tight leading-[1.05] mb-8">
              If you could Google it,<br />
              <span className="text-[#D4714E]">it should be free.</span>
            </h1>

            <p className="text-xl md:text-2xl text-[#6E6A63] font-medium max-w-3xl mx-auto leading-relaxed">
              The conversation with Yulia is always free. Foundational analysis is free because the underlying data is public. You only pay for personalized intelligence and document generation.
            </p>
          </section>
        </div>
      </div>

      {/* --- 3. THE CHAT STAGE (Gravity Well) --- */}
      <div className={`w-full px-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-50 ${viewState === 'chat' ? 'shrink-0 pb-8 pt-4 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB] to-transparent' : 'py-16 md:py-24'}`} style={{ paddingBottom: viewState === 'chat' ? 'max(32px, env(safe-area-inset-bottom))' : undefined }}>
        <div className="max-w-[800px] mx-auto w-full flex flex-col items-center">
          <form
            onSubmit={handleSend}
            className={`w-full bg-white rounded-[28px] p-2 pl-6 flex items-end transition-all ${viewState === 'chat' ? 'shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-200 ring-1 ring-black/[0.04]' : 'shadow-[0_8px_30px_rgba(0,0,0,0.08),0_20px_60px_rgba(212,113,78,0.18)] border-2 border-[#D4714E]/35 ring-2 ring-[#D4714E]/15 hover:scale-[1.01] focus-within:scale-[1.01] focus-within:border-[#D4714E]/50 focus-within:ring-[#D4714E]/25'}`}
          >
            <span className="text-[#D4714E] text-2xl leading-none mr-2 mb-[14px] font-serif select-none">&loz;</span>
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Ask Yulia about pricing or start a deal..."
              rows={1}
              className="flex-1 bg-transparent border-none outline-none resize-none text-[16px] text-[#1A1A18] placeholder:text-[#A9A49C] py-3.5 px-2 font-medium leading-[1.5]"
              style={{ fontFamily: 'inherit', minHeight: '26px', maxHeight: '160px' }}
            />
            <button
              type="button"
              onClick={(e) => handleSend(e)}
              disabled={!inputValue.trim() && !isTyping}
              className="px-6 py-3.5 mb-1 rounded-full flex items-center justify-center bg-[#D4714E] text-white font-bold text-sm tracking-widest uppercase hover:bg-[#b8613d] transition-colors disabled:opacity-50 disabled:hover:bg-[#D4714E]"
            >
              Send
            </button>
          </form>

          <div className={`grid transition-all duration-700 ease-in-out w-full ${viewState === 'landing' ? 'grid-rows-[1fr] opacity-100 mt-10' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
            <div className="overflow-hidden flex flex-col items-center">
              <div className="flex flex-wrap justify-center gap-3 max-w-3xl mb-8">
                <Suggestion text="What does a valuation report cost?" onClick={() => handleSend(null, "What does a valuation report cost?")} />
                <Suggestion text="How does the wallet work?" onClick={() => handleSend(null, "How does the wallet work? What do I get for free?")} />
              </div>
              <div className="text-center text-[13px] font-bold text-[#A9A49C] uppercase tracking-widest">
                No Retainer &bull; No Subscription &bull; $1 = $1 Purchasing Power
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 4. BOTTOM LANDING CONTENT --- */}
      <div className={`grid transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] pb-32 ${viewState === 'landing' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pb-0'}`}>
        <div className="overflow-hidden">

          {/* FREE TIER */}
          <section className="px-6 py-20 bg-white border-y border-[#EAE6DF] relative z-10 mt-12">
            <div className="max-w-6xl mx-auto">
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-2">Start here. It&apos;s on us.</h2>
                <p className="text-[#6E6A63] text-lg">No credit card. No signup wall. Just tell Yulia about your deal.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FreeCard title="Unlimited Chat" desc="Ask anything about your deal, market, or the process. Yulia's advisory conversation has no limits." />
                <FreeCard title="Business Classification" desc="Yulia identifies your deal's framework (SDE vs EBITDA) and applicable buyer pool instantly." />
                <FreeCard title="Preliminary Valuation" desc="An initial estimate based on industry multiples, your profile, and current market conditions." />
                <FreeCard title="Market Overview" desc="Industry dynamics, competitive landscape, and regional context for your specific deal." />
                <FreeCard title="Add-back Discovery" desc="Yulia scans your profile for common add-backs that increase your business's actual earnings." />
                <FreeCard title="SBA Pre-qualification" desc="Check if your deal qualifies for SBA financing and understand what that means for the buyer pool." />
              </div>
            </div>
          </section>

          {/* PREMIUM DELIVERABLES */}
          <section className="px-6 py-24 bg-[#F8F6F1] relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Go deeper when your deal is ready.</h2>
                <p className="text-[#6E6A63] text-lg max-w-2xl mx-auto">Premium deliverables are generated when you need them. No subscriptions. No retainers. Your investment grows with your deal.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-[#EAE6DF] shadow-sm">
                  <h3 className="text-2xl font-bold mb-6 border-b border-[#EAE6DF] pb-4">Seller Deliverables</h3>
                  <div className="space-y-6">
                    <PriceItem title="Market Intelligence Report" price="$200" desc="Comprehensive analysis of your industry, competitive landscape, and buyer activity localized to your metro." />
                    <PriceItem title="Full Valuation Analysis" price="$350" desc="Multi-methodology valuation (SDE/EBITDA/DCF) built to withstand buyer and lender scrutiny." />
                    <PriceItem title="Confidential Info Memo (CIM)" price="$700" desc="A professional 25+ page deal book presenting your business to potential buyers." />
                    <PriceItem title="Deal Structuring Intel" price="$250" desc="Offer evaluation, deal structure optimization, and negotiation strategy through close." />
                  </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-[#EAE6DF] shadow-sm">
                  <h3 className="text-2xl font-bold mb-6 border-b border-[#EAE6DF] pb-4">Buyer Deliverables</h3>
                  <div className="space-y-6">
                    <PriceItem title="Target Financial Analysis" price="$275" desc="Deep financial modeling including DSCR, ROI projections, and SBA financing scenarios." />
                    <PriceItem title="Market & Competitive Intel" price="$200" desc="Industry mapping, competitive density, and target identification for your thesis." />
                    <PriceItem title="Due Diligence Report" price="$300" desc="Pre-diligence risk assessment and red flag identification before engaging outside counsel." />
                    <PriceItem title="Deal Structuring" price="$250" desc="Sources & uses, seller note modeling, earnout scenarios, and final offer construction." />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* WALLET FAQ */}
          <section className="px-6 py-24 bg-white border-t border-[#EAE6DF] relative z-10">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">How the Wallet works.</h2>
              <p className="text-lg text-[#6E6A63] leading-relaxed mb-12 text-center">
                smbX.ai uses a transparent wallet system. Add funds when you&apos;re ready for a premium deliverable. Yulia tells you exactly what it costs before you commit. No recurring charges, no hidden fees. $1 in your wallet equals $1 of purchasing power.
              </p>
              <div className="bg-[#FDFCFB] p-8 md:p-12 rounded-[40px] border border-[#EAE6DF] shadow-sm">
                <h3 className="font-bold text-2xl mb-8">Frequently Asked Questions</h3>
                <div className="space-y-8">
                  <div>
                    <h4 className="font-bold text-[#1A1A18] text-lg">Is the free analysis really free?</h4>
                    <p className="text-[#6E6A63] mt-2 leading-relaxed">Yes. No credit card required. We built it this way because the underlying data is public. What you pay for is the personalized synthesis and document generation.</p>
                  </div>
                  <div className="h-px w-full bg-[#EAE6DF]" />
                  <div>
                    <h4 className="font-bold text-[#1A1A18] text-lg">How is this different from ChatGPT?</h4>
                    <p className="text-[#6E6A63] mt-2 leading-relaxed">ChatGPT is a general model. smbX.ai is a purpose-built intelligence engine grounded in sovereign Federal data (Census, BLS, SEC) executing a strict 7-layer M&amp;A methodology.</p>
                  </div>
                  <div className="h-px w-full bg-[#EAE6DF]" />
                  <div>
                    <h4 className="font-bold text-[#1A1A18] text-lg">Can I use deliverables with my clients?</h4>
                    <p className="text-[#6E6A63] mt-2 leading-relaxed">Yes. All paid deliverables can be white-labeled with your firm&apos;s branding at no extra cost.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

    </div>
  );
}

/* ── Pricing-specific sub-components ── */

function FreeCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-6 border border-[#EAE6DF] rounded-2xl bg-[#FDFCFB] hover:shadow-sm transition-shadow">
      <div className="font-black text-[#D4714E] text-xl mb-3">✓</div>
      <h4 className="font-bold text-lg mb-2">{title}</h4>
      <p className="text-[#6E6A63] text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function PriceItem({ title, price, desc }: { title: string; price: string; desc: string }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start border-b border-[#EAE6DF] pb-6 last:border-0 last:pb-0">
      <div className="flex-1">
        <h4 className="font-bold text-[#1A1A18] text-lg">{title}</h4>
        <p className="text-[#6E6A63] text-sm mt-1 leading-relaxed">{desc}</p>
      </div>
      <div className="font-black text-xl text-[#D4714E] shrink-0">{price}</div>
    </div>
  );
}
