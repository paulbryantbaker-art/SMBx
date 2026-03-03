import { useState, useRef, useEffect } from 'react';
import { Suggestion, Badge, OutcomeCard, StepCard } from './ui';
import ChatComposer from './ChatComposer';
import { useChatContext } from '../../context/ChatContext';

export default function SellContent() {
  const { messages: chatMessages, isStreaming, streamingContent, sendMessage } = useChatContext();

  const [viewState, setViewState] = useState<'landing' | 'chat'>('landing');
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatMessages.length > 0 && viewState === 'landing') setViewState('chat');
  }, [chatMessages.length]);

  useEffect(() => {
    if (viewState === 'chat') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isStreaming, streamingContent, viewState]);

  const handleSend = () => {
    if (!inputValue.trim() || isStreaming) return;
    setViewState('chat');
    const text = inputValue;
    setInputValue('');
    sendMessage(text, '/sell');
  };

  const handleChipSend = (text: string) => {
    if (isStreaming) return;
    setViewState('chat');
    setInputValue('');
    sendMessage(text, '/sell');
  };

  return (
    <div className="bg-[#FDFCFB] text-[#1A1A18] font-sans relative selection:bg-[#D4714E] selection:text-white overflow-x-hidden">

      {/* --- 1. CHAT MESSAGES AREA --- */}
      <div className={`w-full max-w-4xl mx-auto px-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${viewState === 'chat' ? 'py-8 opacity-100 pb-32' : 'h-0 opacity-0 overflow-hidden'}`}>
        <div className="flex flex-col gap-6 pb-4">
          {viewState === 'chat' && (
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE6DF] mb-4">
              <button onClick={() => setViewState('landing')} className="text-sm font-bold text-[#A9A49C] hover:text-[#1A1A18] transition-colors" type="button">
                &larr; Exit Workspace
              </button>
              <div className="text-xs font-bold uppercase tracking-widest text-[#D4714E]">Valuation Engine Active</div>
            </div>
          )}

          {chatMessages.map((msg, idx) => (
            <div key={msg.id || idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
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

          {isStreaming && streamingContent && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#D4714E] flex items-center justify-center text-white font-bold text-xs shrink-0 mt-1 shadow-sm">Y</div>
              <div className="p-5 rounded-2xl rounded-tl-sm bg-[#F8F6F1] border border-[#EAE6DF] max-w-[85%] sm:max-w-[75%] leading-relaxed text-[16px] shadow-sm text-[#6E6A63]">
                {streamingContent}
              </div>
            </div>
          )}

          {isStreaming && !streamingContent && (
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

      {/* --- 2. HERO SECTION (Full viewport, centered) --- */}
      <div className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${viewState === 'landing' ? 'min-h-[100vh] flex flex-col justify-center items-center' : 'hidden'}`}>
        <div className="w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center mt-auto pt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0EB] text-[#D4714E] text-xs font-bold tracking-wider uppercase mb-10 border border-[#FBE3D9]">
            For Business Owners
          </div>

          <h1 className="text-5xl md:text-[80px] font-extrabold tracking-tight leading-[1.05] mb-8">
            Know your number.<br />
            <span className="text-[#D4714E]">Before you negotiate.</span>
          </h1>

          <p className="text-xl md:text-2xl text-[#6E6A63] font-medium max-w-3xl mx-auto leading-relaxed mb-12">
            Most owners leave money on the table. Yulia calculates your true adjusted earnings, finds hidden add-backs, and generates a defensible valuation in minutes.
          </p>

          <div className="w-full max-w-[800px]">
            <ChatComposer
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSend}
              placeholder="Tell Yulia about the business you want to sell..."
              disabled={isStreaming}
              variant="hero"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mt-8 mb-6">
            <Suggestion text="Value my $1.8M pest control business" onClick={() => handleChipSend("I want to sell my pest control business doing $1.8M in revenue. What is it worth?")} />
            <Suggestion text="Walk me through the selling process" onClick={() => handleChipSend("Walk me through the selling process. Where do I start?")} />
            <Suggestion text="What are common add-backs?" onClick={() => handleChipSend("What are common add-backs I should be looking for in my financials?")} />
          </div>

          <div className="text-center text-[13px] font-bold text-[#A9A49C] uppercase tracking-widest">
            Find Hidden Value &bull; Prove Your Price &bull; Generate CIMs
          </div>
        </div>

        <div className="mt-auto pb-8 pt-12 text-center text-[#A9A49C] animate-bounce">
          <div className="text-xs font-bold uppercase tracking-widest mb-2">Scroll to learn more</div>
          <span className="text-lg">&darr;</span>
        </div>
      </div>

      {/* --- 3. DOCKED CHAT INPUT (visible in chat mode) --- */}
      <div className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${viewState === 'chat' ? 'fixed bottom-0 left-0 right-0 z-50 pointer-events-none px-4 pt-4 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB] to-transparent' : 'hidden'}`} style={{ paddingBottom: viewState === 'chat' ? 'max(32px, env(safe-area-inset-bottom))' : undefined }}>
        <div className="max-w-[800px] mx-auto w-full pointer-events-auto">
          <ChatComposer
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            placeholder="Tell Yulia about the business you want to sell..."
            disabled={isStreaming}
            variant="docked"
            autoFocus
          />
        </div>
      </div>

      {/* --- 4. BELOW-FOLD MARKETING CONTENT --- */}
      <div className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${viewState === 'landing' ? 'opacity-100' : 'hidden'}`}>
        <div className="border-t border-[#EAE6DF]">

          {/* TICKER */}
          <div className="border-b border-[#EAE6DF] bg-white py-6">
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
          <section className="px-6 py-24 bg-[#F8F6F1] text-[#1A1A18] border-b border-[#EAE6DF]">
            <div className="max-w-6xl mx-auto">
              <div className="mb-16 md:flex justify-between items-end gap-8">
                <div className="max-w-2xl">
                  <div className="text-sm font-bold text-[#A9A49C] uppercase tracking-widest mb-4">The Seller Advantage</div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">Stop guessing.<br /><span className="text-[#D4714E]">Start proving.</span></h2>
                  <p className="text-[#6E6A63] text-lg leading-relaxed">
                    Selling a business is the most consequential financial decision most owners make. smbX.ai doesn&apos;t just estimate your value&mdash;it builds the defensible, data-backed case to justify your asking price.
                  </p>
                </div>
                <div className="mt-8 md:mt-0 flex items-center gap-4 bg-white px-6 py-5 rounded-2xl border border-[#EAE6DF] shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A18] flex items-center justify-center text-white font-black text-lg">$</div>
                  <div>
                    <div className="text-xs text-[#A9A49C] uppercase tracking-wider font-bold">Valuation Engine</div>
                    <div className="font-bold text-lg text-[#1A1A18]">SDE &amp; EBITDA Math</div>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-[#EAE6DF] shadow-sm relative overflow-hidden group">
                  <h3 className="text-2xl font-bold mb-4 relative z-10">Find the hidden money in your financials</h3>
                  <p className="text-[#6E6A63] mb-8 relative z-10 max-w-lg leading-relaxed">Your tax return isn&apos;t your valuation. Yulia identifies owner salaries, personal vehicles, one-time expenses, and family benefits to calculate your true Seller&apos;s Discretionary Earnings (SDE).</p>
                  <div className="flex flex-wrap gap-2 relative z-10">
                    <Badge text="Identify Add-backs" /><Badge text="Normalize EBITDA" /><Badge text="Justify Multiples" />
                  </div>
                </div>
                <div className="bg-white rounded-3xl p-8 border border-[#EAE6DF] shadow-sm flex flex-col">
                  <div className="w-12 h-12 bg-[#F8F6F1] rounded-xl flex items-center justify-center text-[#D4714E] font-black text-xl mb-6">01</div>
                  <h3 className="text-xl font-bold mb-3">SBA Pre-qualification</h3>
                  <p className="text-[#6E6A63] text-sm leading-relaxed mt-auto">Can a buyer actually finance your asking price? Yulia models live SBA rates and DSCR so you know before you list.</p>
                </div>
                <div className="bg-white rounded-3xl p-8 border border-[#EAE6DF] shadow-sm flex flex-col md:col-span-3 lg:col-span-1">
                  <div className="w-12 h-12 bg-[#F8F6F1] rounded-xl flex items-center justify-center text-[#D4714E] font-black text-xl mb-6">02</div>
                  <h3 className="text-xl font-bold mb-3">Market Intelligence</h3>
                  <p className="text-[#6E6A63] text-sm leading-relaxed mt-auto">Know exactly how many competitors operate in your ZIP code and whether Private Equity is rolling up your industry.</p>
                </div>
                <div className="bg-[#D4714E] rounded-3xl p-8 flex items-center justify-between md:col-span-2 text-white shadow-md">
                  <div className="max-w-lg">
                    <h3 className="text-3xl font-bold mb-3">Institutional CIMs in minutes, not weeks.</h3>
                    <p className="text-orange-100 font-medium leading-relaxed">Turn your raw financials into a 25-page Confidential Information Memorandum built to withstand buyer scrutiny.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* LIVE PREVIEW */}
          <section className="px-6 py-24 max-w-5xl mx-auto w-full">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Finding the hidden money</h2>
              <p className="text-[#6E6A63] text-lg">See how Yulia extracts your actual Seller&apos;s Discretionary Earnings (SDE).</p>
            </div>
            <div className="bg-[#F8F6F1] rounded-[40px] p-6 md:p-10 border border-[#EAE6DF] shadow-xl max-w-4xl mx-auto">
              <div className="flex flex-col gap-6">
                <div className="self-end bg-[#D4714E] text-white p-6 rounded-[24px] rounded-br-[8px] max-w-[85%] md:max-w-[75%] shadow-md text-[16px] leading-relaxed">
                  I&apos;m thinking of selling my plumbing business. We did $1.2M last year. Tax return shows $50K net income, but I take a $120K salary, and the business pays for my truck and family health insurance.
                </div>
                <div className="self-start flex gap-4 max-w-[95%] md:max-w-[85%]">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#EAE6DF] flex items-center justify-center text-[#D4714E] font-black text-sm shrink-0 shadow-sm mt-1">Y</div>
                  <div className="bg-white border border-[#EAE6DF] p-6 md:p-8 rounded-[24px] rounded-tl-[8px] shadow-md text-[#1A1A18] text-[16px] leading-relaxed">
                    <p className="mb-6">This is exactly why you shouldn&apos;t use your tax return to price your business. Let&apos;s calculate your actual <strong>Seller&apos;s Discretionary Earnings (SDE)</strong>.</p>
                    <div className="bg-[#FDFCFB] border border-[#EAE6DF] rounded-2xl p-6 mb-6 shadow-sm font-mono text-sm">
                      <div className="text-xs font-sans text-[#6E6A63] uppercase tracking-wider font-bold mb-4 border-b border-[#EAE6DF] pb-2">Add-back Schedule (Draft)</div>
                      <div className="flex justify-between mb-2"><span>Reported Net Income:</span> <span className="font-bold">$50,000</span></div>
                      <div className="flex justify-between mb-2 text-green-700"><span>+ Owner Salary:</span> <span>$120,000</span></div>
                      <div className="flex justify-between mb-2 text-green-700"><span>+ Owner Vehicle:</span> <span>$12,000</span></div>
                      <div className="flex justify-between mb-4 text-green-700 border-b border-[#EAE6DF] pb-3"><span>+ Family Health Ins.:</span> <span>$18,000</span></div>
                      <div className="flex justify-between pt-1">
                        <span className="font-bold font-sans">True SDE (Cash Flow):</span>
                        <span className="font-bold text-[#D4714E] text-lg">$200,000</span>
                      </div>
                    </div>
                    <div className="space-y-4 text-[15px] mb-6">
                      <div className="flex items-start gap-3 bg-green-50/50 p-4 rounded-xl border border-green-100">
                        <div className="mt-1 font-black text-green-600">&check;</div>
                        <div><strong>Valuation Impact:</strong> By identifying just those basic add-backs, your valuation basis jumped from $50K to $200K. At a standard 2.5x&ndash;3.2x multiple, your enterprise value is roughly <strong>$500K to $640K</strong>.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* OUTCOMES */}
          <section className="px-6 py-24 bg-white border-y border-[#EAE6DF]">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <div className="text-sm font-bold text-[#A9A49C] uppercase tracking-widest mb-4">The Deliverables</div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">What you actually walk away with.</h2>
                <p className="text-[#6E6A63] text-lg max-w-2xl mx-auto">You don&apos;t just get chat advice. Yulia instantly generates the exact institutional-grade collateral you need to market and close your business.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <OutcomeCard tag="Valuations" title="Defensible Valuation Reports" desc="Get a multi-methodology valuation report (SDE, EBITDA, DCF) perfectly formatted with comparable transaction data to prove your asking price." />
                <OutcomeCard tag="Marketing" title="Blind Teasers & CIMs" desc="We generate anonymous blind teasers to test the market, and 25-page Confidential Information Memorandums (CIMs) for verified buyers." />
                <OutcomeCard tag="Financing" title="SBA Bankability Models" desc="Prove to buyers that your deal is financeable. Get pre-filled Debt Service Coverage Ratio models based on live federal interest rates." />
                <OutcomeCard tag="Collaboration" title="Multi-Party Deal Rooms" desc="A single secure space where your attorney, CPA, and prospective buyers can review the documents Yulia generated." />
              </div>
            </div>
          </section>

          {/* EMPOWERMENT */}
          <section className="px-6 py-24 bg-[#F8F6F1] border-t border-[#EAE6DF]">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border border-[#EAE6DF] rounded-[40px] p-8 md:p-12 shadow-xl shadow-[#1A1A18]/5">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">The power to close on your terms.</h2>
                  <p className="text-lg text-[#6E6A63] leading-relaxed">Whether you are a first-time seller or exiting your third company, smbX.ai gives you the superpower to execute flawlessly. It&apos;s absolute clarity when it matters most.</p>
                </div>
                <div className="space-y-6">
                  <StepCard num="1" title="Absolute Certainty" desc="No more trusting a buyer who lowballs you. Your valuation is backed by live federal market data." />
                  <StepCard num="2" title="Maximum Value" desc="Discover the hidden money in your financials. Legitimate add-backs can effortlessly add hundreds of thousands to your enterprise value." />
                  <StepCard num="3" title="Unstoppable Momentum" desc="Deals die waiting for paperwork. Generate your CIM, LOI responses, and SBA models in seconds to keep excitement high." />
                </div>
              </div>
            </div>
          </section>

          {/* Bottom spacer */}
          <div className="pb-32" />
        </div>
      </div>

    </div>
  );
}
