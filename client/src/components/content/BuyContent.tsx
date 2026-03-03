import { useState, useRef, useEffect } from 'react';
import { Suggestion, Badge, OutcomeCard, StepCard } from './ui';

interface Message {
  role: 'user' | 'yulia';
  content: string;
}

export default function BuyContent() {
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
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
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
        content: "I'll pull the market data for that target. To run the SBA feasibility and DSCR model, I'll need the asking price and the target's SDE or EBITDA. What numbers are you working with?"
      }]);
    }, 1500);
  };

  return (
    <div className={`bg-[#FDFCFB] text-[#1A1A18] font-sans relative selection:bg-[#D4714E] selection:text-white overflow-x-hidden ${viewState === 'chat' ? 'h-[100dvh] flex flex-col overflow-hidden' : 'min-h-screen'}`}>

      {/* --- 1. CHAT MESSAGES AREA --- */}
      <div className={`w-full max-w-4xl mx-auto px-6 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${viewState === 'chat' ? 'flex-1 py-8 opacity-100 overflow-y-auto' : 'h-0 opacity-0 overflow-hidden'}`}>
        <div className="flex-1 flex flex-col justify-end gap-6 pb-4">
          {viewState === 'chat' && (
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE6DF] mb-4">
              <button onClick={() => setViewState('landing')} className="text-sm font-bold text-[#A9A49C] hover:text-[#1A1A18] transition-colors" type="button">
                &larr; Exit Workspace
              </button>
              <div className="text-xs font-bold uppercase tracking-widest text-[#D4714E]">Deal Analysis Active</div>
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
              For Buyers &amp; Investors
            </div>

            <h1 className="text-5xl md:text-[80px] font-extrabold tracking-tight leading-[1.05] mb-8">
              Find the right deal.<br />
              <span className="text-[#D4714E]">Know it&apos;s the right deal.</span>
            </h1>

            <p className="text-xl md:text-2xl text-[#6E6A63] font-medium max-w-3xl mx-auto leading-relaxed">
              Acquisitions fail when buyers lack the intelligence to evaluate targets properly. Turn conviction from a gut feeling into a defensible number.
            </p>
          </section>
        </div>
      </div>

      {/* --- 3. THE CHAT STAGE (Gravity Well) --- */}
      <div className={`w-full px-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-50 ${viewState === 'chat' ? 'shrink-0 pb-8 pt-4 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB] to-transparent' : 'py-16 md:py-24'}`}>
        <div className="max-w-[800px] mx-auto w-full flex flex-col items-center">
          <form
            onSubmit={handleSend}
            className={`w-full bg-white rounded-[28px] p-2 pl-6 flex items-end shadow-[0_20px_60px_rgba(212,113,78,0.12)] ring-4 ring-[#FFF0EB] border border-[#D4714E]/30 transition-all hover:scale-[1.01] focus-within:scale-[1.01] focus-within:border-[#D4714E] focus-within:ring-[#FFF0EB] ${viewState === 'chat' ? 'shadow-md ring-0 hover:scale-100 focus-within:scale-100' : ''}`}
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
              placeholder="Tell Yulia what you're looking for..."
              rows={1}
              className="flex-1 bg-transparent border-none focus:outline-none text-[18px] text-[#1A1A18] placeholder:text-[#A9A49C] py-4 px-2 font-medium resize-none min-h-[56px] max-h-[200px] overflow-y-auto"
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
                <Suggestion text="Find acquisition targets in HVAC" onClick={() => handleSend(null, "I am looking for acquisition targets in the HVAC industry.")} />
                <Suggestion text="Model SBA financing for a $2M deal" onClick={() => handleSend(null, "Can you help me model SBA financing for a $2M acquisition?")} />
                <Suggestion text="Draft an LOI" onClick={() => handleSend(null, "I need to draft an LOI for a dental practice acquisition.")} />
              </div>
              <div className="text-center text-[13px] font-bold text-[#A9A49C] uppercase tracking-widest">
                DSCR Math &bull; Target Evaluation &bull; Deal Structuring
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 4. BOTTOM LANDING CONTENT --- */}
      <div className={`grid transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] pb-32 ${viewState === 'landing' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pb-0'}`}>
        <div className="overflow-hidden">

          {/* TICKER */}
          <div className="border-y border-[#EAE6DF] bg-white py-6 relative z-10 mt-12">
            <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-between items-center gap-6 text-sm font-bold text-[#A9A49C] tracking-widest uppercase">
              <span className="hidden md:inline-block">Powered By:</span>
              <span className="text-[#1A1A18] flex items-center gap-2"><span className="text-[#D4714E] text-lg leading-none">&middot;</span> U.S. Census</span>
              <span className="text-[#1A1A18] flex items-center gap-2"><span className="text-[#D4714E] text-lg leading-none">&middot;</span> BLS</span>
              <span className="text-[#1A1A18] flex items-center gap-2"><span className="text-[#D4714E] text-lg leading-none">&middot;</span> Federal Reserve</span>
              <span className="text-[#1A1A18] flex items-center gap-2"><span className="text-[#D4714E] text-lg leading-none">&middot;</span> SEC EDGAR</span>
              <span className="text-[#1A1A18] flex items-center gap-2"><span className="text-[#D4714E] text-lg leading-none">&middot;</span> SBA</span>
            </div>
          </div>

          {/* INFOGRAPHIC */}
          <section className="px-6 py-24 bg-[#F8F6F1] text-[#1A1A18] border-b border-[#EAE6DF] relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="mb-16 md:flex justify-between items-end gap-8">
                <div className="max-w-2xl">
                  <div className="text-sm font-bold text-[#A9A49C] uppercase tracking-widest mb-4">The Buyer Advantage</div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">Institutional intelligence.<br /><span className="text-[#D4714E]">Zero wait time.</span></h2>
                  <p className="text-[#6E6A63] text-lg leading-relaxed">
                    The smbX.ai Engine evaluates targets, maps the competitive landscape, and runs live financing math so you know exactly what you&apos;re buying into before you write a check.
                  </p>
                </div>
                <div className="mt-8 md:mt-0 flex items-center gap-4 bg-white px-6 py-5 rounded-2xl border border-[#EAE6DF] shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A18] flex items-center justify-center text-white font-black text-lg">%</div>
                  <div>
                    <div className="text-xs text-[#A9A49C] uppercase tracking-wider font-bold">Financial Engine</div>
                    <div className="font-bold text-lg text-[#1A1A18]">Deal Feasibility</div>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-[#EAE6DF] shadow-sm relative overflow-hidden group">
                  <h3 className="text-2xl font-bold mb-4 relative z-10">Instant SBA Bankability &amp; DSCR</h3>
                  <p className="text-[#6E6A63] mb-8 relative z-10 max-w-lg leading-relaxed">SBA financing feasibility, debt service coverage ratios (DSCR), and cash-on-cash return projections modeled side-by-side using live federal rates.</p>
                  <div className="flex flex-wrap gap-2 relative z-10">
                    <Badge text="DSCR Analysis" /><Badge text="Cash-on-Cash Return" /><Badge text="SBA 7(a) Modeling" />
                  </div>
                </div>
                <div className="bg-white rounded-3xl p-8 border border-[#EAE6DF] shadow-sm flex flex-col">
                  <div className="w-12 h-12 bg-[#F8F6F1] rounded-xl flex items-center justify-center text-[#D4714E] font-black text-xl mb-6">01</div>
                  <h3 className="text-xl font-bold mb-3">Target Evaluation</h3>
                  <p className="text-[#6E6A63] text-sm leading-relaxed mt-auto">Valuation benchmarking against comparable transactions and red-flag identification. Know if the asking price is justified.</p>
                </div>
                <div className="bg-white rounded-3xl p-8 border border-[#EAE6DF] shadow-sm flex flex-col md:col-span-3 lg:col-span-1">
                  <div className="w-12 h-12 bg-[#F8F6F1] rounded-xl flex items-center justify-center text-[#D4714E] font-black text-xl mb-6">02</div>
                  <h3 className="text-xl font-bold mb-3">Market Intelligence</h3>
                  <p className="text-[#6E6A63] text-sm leading-relaxed mt-auto">Industry landscape, competitive density, and consolidation activity in your target sector.</p>
                </div>
                <div className="bg-[#D4714E] rounded-3xl p-8 flex items-center justify-between md:col-span-2 text-white shadow-md">
                  <div className="max-w-lg">
                    <h3 className="text-3xl font-bold mb-3">Deal structuring and optimization.</h3>
                    <p className="text-orange-100 font-medium leading-relaxed">Understand the levers that get a deal done. We model earnouts, seller financing scenarios, equity rolls, and working capital pegs automatically.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* LIVE PREVIEW */}
          <section className="px-6 py-24 max-w-5xl mx-auto w-full relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">The numbers behind the decision</h2>
              <p className="text-[#6E6A63] text-lg">See how Yulia instantly models SBA bankability and debt service coverage.</p>
            </div>
            <div className="bg-[#F8F6F1] rounded-[40px] p-6 md:p-10 border border-[#EAE6DF] shadow-xl max-w-4xl mx-auto">
              <div className="flex flex-col gap-6">
                <div className="self-end bg-[#D4714E] text-white p-6 rounded-[24px] rounded-br-[8px] max-w-[85%] md:max-w-[75%] shadow-md text-[16px] leading-relaxed">
                  I found a commercial landscaping business asking $2.4M. SDE is $600K. I have $250K liquid for a down payment. Can I finance this with an SBA loan?
                </div>
                <div className="self-start flex gap-4 max-w-[95%] md:max-w-[85%]">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#EAE6DF] flex items-center justify-center text-[#D4714E] font-black text-sm shrink-0 shadow-sm mt-1">Y</div>
                  <div className="bg-white border border-[#EAE6DF] p-6 md:p-8 rounded-[24px] rounded-tl-[8px] shadow-md text-[#1A1A18] text-[16px] leading-relaxed">
                    <p className="mb-6">Let&apos;s run the SBA bankability model on that $2.4M asking price using current 7(a) lending rates. The critical metric here is the <strong>Debt Service Coverage Ratio (DSCR)</strong>.</p>
                    <div className="bg-[#FDFCFB] border border-[#EAE6DF] rounded-2xl p-6 mb-6 shadow-sm font-mono text-sm">
                      <div className="text-xs font-sans text-[#6E6A63] uppercase tracking-wider font-bold mb-4 border-b border-[#EAE6DF] pb-2">SBA Feasibility Model</div>
                      <div className="flex justify-between mb-2"><span>Target Asking Price:</span> <span className="font-bold">$2,400,000</span></div>
                      <div className="flex justify-between mb-2 text-[#6E6A63]"><span>Buyer Equity (Min 10%):</span> <span>$240,000</span></div>
                      <div className="flex justify-between mb-4 text-[#6E6A63] border-b border-[#EAE6DF] pb-3"><span>SBA Loan Amount:</span> <span>$2,160,000</span></div>
                      <div className="flex justify-between mb-2"><span className="text-[#6E6A63]">Est. Annual Debt Service (9.25%):</span> <span className="font-bold text-red-700">($332,410)</span></div>
                      <div className="flex justify-between mb-4 text-[#6E6A63] border-b border-[#EAE6DF] pb-3"><span>Target SDE:</span> <span className="font-bold text-green-700">$600,000</span></div>
                      <div className="flex justify-between pt-1 items-center">
                        <span className="font-bold font-sans text-lg">DSCR:</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-sans text-green-700 font-bold bg-green-50 px-2 py-1 rounded border border-green-100">Passes SBA Min (1.25x)</span>
                          <span className="font-bold text-[#D4714E] text-xl">1.80x</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 text-[15px] mb-6">
                      <div className="flex items-start gap-3 bg-green-50/50 p-4 rounded-xl border border-green-100">
                        <div className="mt-1 font-black text-green-600">✓</div>
                        <div><strong>Good news:</strong> With a 1.80x DSCR, this comfortably beats the SBA&apos;s 1.25x minimum. Your $250K liquidity covers the 10% injection.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* OUTCOMES */}
          <section className="px-6 py-24 bg-white border-y border-[#EAE6DF] relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <div className="text-sm font-bold text-[#A9A49C] uppercase tracking-widest mb-4">The Deliverables</div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">What you actually walk away with.</h2>
                <p className="text-[#6E6A63] text-lg max-w-2xl mx-auto">Yulia instantly generates the exact institutional-grade collateral you need to evaluate targets, secure funding, and close deals.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <OutcomeCard tag="Analysis" title="Target Financial Models" desc="Deep financial modeling including DSCR, ROI projections, cash-on-cash returns, and SBA financing scenarios." />
                <OutcomeCard tag="Intelligence" title="Market & Competitive Reports" desc="Industry mapping, competitive density analysis, and consolidation trends matched directly to your buy thesis." />
                <OutcomeCard tag="Diligence" title="Due Diligence Checklists" desc="Pre-diligence risk assessments and automated data room request lists tailored to the specific industry." />
                <OutcomeCard tag="Execution" title="LOIs & Deal Structuring" desc="Draft Letters of Intent, model sources & uses, analyze seller note scenarios, and construct the final offer terms." />
              </div>
            </div>
          </section>

          {/* EMPOWERMENT */}
          <section className="px-6 py-24 bg-[#F8F6F1] border-t border-[#EAE6DF] relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border border-[#EAE6DF] rounded-[40px] p-8 md:p-12 shadow-xl shadow-[#1A1A18]/5">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Move with the speed of an institutional fund.</h2>
                  <p className="text-lg text-[#6E6A63] leading-relaxed">Whether you are a solo searcher evaluating your first acquisition or a platform running a buy-and-build strategy, smbX.ai scales with your thesis.</p>
                </div>
                <div className="space-y-6">
                  <StepCard num="1" title="Instant Conviction" desc="Stop wasting weeks on targets that don't pencil out. Run the math and check the multiples before you ever schedule the first call." />
                  <StepCard num="2" title="Capital Stack Clarity" desc="Know exactly how you will fund the deal. Yulia models the senior debt, seller financing, and equity required to hit your target return." />
                  <StepCard num="3" title="Negotiation Leverage" desc="Sellers respect buyers who know the market. Walk into negotiations armed with clear Census data and BLS wage reports." />
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

    </div>
  );
}
