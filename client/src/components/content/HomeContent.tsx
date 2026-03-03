import { useState, useRef, useEffect } from 'react';
import { Badge, AudienceCard } from './ui';
import { useChatContext } from '../../context/ChatContext';

export default function HomeContent() {
  const { messages: chatMessages, isStreaming, streamingContent, sendMessage } = useChatContext();

  const [inputValue, setInputValue] = useState('');
  const [isChatting, setIsChatting] = useState(chatMessages.length > 0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatMessages.length > 0 && !isChatting) setIsChatting(true);
  }, [chatMessages.length]);

  useEffect(() => {
    if (isChatting) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isStreaming, streamingContent, isChatting]);

  const handleSend = (e?: React.FormEvent, forcedText?: string) => {
    e?.preventDefault();
    const textToSend = forcedText || inputValue;
    if (!textToSend.trim() || isStreaming) return;
    setIsChatting(true);
    setInputValue('');
    sendMessage(textToSend, '/');
  };

  return (
    <div className="bg-[#FDFCFB] text-[#1A1A18] font-sans relative selection:bg-[#D4714E] selection:text-white min-h-screen w-full flex flex-col">

      {/* --- SCROLLABLE AREA (Hidden when chatting) --- */}
      <div className={`flex-1 w-full transition-all duration-700 overflow-y-auto ${isChatting ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>

        {/* 100vh Hero Wrapper */}
        <div className="min-h-[100vh] flex flex-col justify-center items-center px-6 py-12 max-w-5xl mx-auto w-full relative z-10">

          <div className="text-center mb-8 w-full mt-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0EB] text-[#D4714E] text-xs font-bold tracking-wider uppercase mb-8 border border-[#FBE3D9]">
              The new standard for M&amp;A
            </div>
            <h1 className="text-5xl md:text-[80px] font-extrabold tracking-tight leading-[1.05] mb-8">
              Buy or sell a business.<br />
              <span className="text-[#D4714E]">Just by chatting.</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#6E6A63] font-medium max-w-3xl mx-auto leading-relaxed">
              Our AI intelligence and deal automation take the guesswork out of buying or selling any business. Just type, and Yulia runs the numbers.
            </p>
          </div>

          {/* Spacer block to hold the layout open where the absolute chat bar sits initially */}
          <div className="h-[140px] w-full" />

          {/* Static Scroll Indicator (NO BOUNCING TEXT) */}
          <div className="mt-auto pt-16 flex flex-col items-center text-[#A9A49C] text-2xl font-serif">
            &darr;
          </div>
        </div>

        {/* --- MARKETING CONTENT BELOW FOLD --- */}
        <div className="w-full border-t border-[#EAE6DF]">

          {/* TRUST TICKER */}
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

          {/* THE INFOGRAPHIC: smbX.ai ENGINE */}
          <section className="px-6 py-24 bg-[#F8F6F1] text-[#1A1A18] border-b border-[#EAE6DF]">
            <div className="max-w-6xl mx-auto">
              <div className="mb-16 md:flex justify-between items-end gap-8">
                <div className="max-w-2xl">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">The data is public.<br /><span className="text-[#D4714E]">The intelligence is not.</span></h2>
                  <p className="text-[#6E6A63] text-lg leading-relaxed">
                    The same market data that powers Wall Street is technically available to anyone. What isn&apos;t available is someone who can synthesize all of it into a deal-specific analysis in minutes. That&apos;s what Yulia does.
                  </p>
                </div>
                <div className="mt-8 md:mt-0 flex items-center gap-4 bg-white px-6 py-5 rounded-2xl border border-[#EAE6DF] shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A18] flex items-center justify-center text-white font-black text-lg">X</div>
                  <div>
                    <div className="text-xs text-[#A9A49C] uppercase tracking-wider font-bold">Proprietary Tech</div>
                    <div className="font-bold text-lg text-[#1A1A18]">smb<span className="text-[#D4714E]">X</span>.ai Engine</div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-[#EAE6DF] shadow-sm relative overflow-hidden group">
                  <h3 className="text-2xl font-bold mb-4 relative z-10">Seven layers of analysis</h3>
                  <p className="text-[#6E6A63] mb-8 relative z-10 max-w-lg leading-relaxed">
                    Every deal gets evaluated across seven dimensions. Not a generic checklist &mdash; a methodology built from real transaction experience.
                  </p>
                  <div className="flex flex-wrap gap-2 relative z-10">
                    <Badge text="Industry Structure" />
                    <Badge text="Regional Economics" />
                    <Badge text="Financial Normalization" />
                    <Badge text="Buyer Landscape" />
                    <Badge text="Deal Architecture" />
                    <Badge text="Risk Factors" />
                    <Badge text="Forward Signals" />
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-[#EAE6DF] shadow-sm flex flex-col">
                  <div className="w-12 h-12 bg-[#F8F6F1] rounded-xl flex items-center justify-center text-[#D4714E] font-black text-xl mb-6">01</div>
                  <h3 className="text-xl font-bold mb-3">Localized to your market</h3>
                  <p className="text-[#6E6A63] text-sm leading-relaxed mt-auto">
                    National averages hide what matters. A plumbing company in Phoenix and one in rural PA are fundamentally different deals.
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-[#EAE6DF] shadow-sm flex flex-col md:col-span-3 lg:col-span-1">
                  <div className="w-12 h-12 bg-[#F8F6F1] rounded-xl flex items-center justify-center text-[#D4714E] font-black text-xl mb-6">02</div>
                  <h3 className="text-xl font-bold mb-3">Calibrated to deal size</h3>
                  <p className="text-[#6E6A63] text-sm leading-relaxed mt-auto">
                    The right analysis for a $400K landscaping company differs from a $40M manufacturing platform. Yulia adapts to the deal in front of her.
                  </p>
                </div>

                <div className="bg-[#D4714E] rounded-3xl p-8 flex items-center justify-between md:col-span-2 text-white shadow-md">
                  <div className="max-w-lg">
                    <h3 className="text-3xl font-bold mb-3">Every number is sourced.</h3>
                    <p className="text-orange-100 font-medium leading-relaxed">
                      What your multiples are doing. How many competitors operate in your market. Whether a buyer can finance this deal through SBA.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* LIVE PREVIEW SECTION */}
          <section className="px-6 py-24 max-w-5xl mx-auto w-full">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">See Yulia in action</h2>
              <p className="text-[#6E6A63] text-lg">Every number is sourced. Every analysis shows its work.</p>
            </div>

            <div className="bg-[#F8F6F1] rounded-[40px] p-6 md:p-10 border border-[#EAE6DF] shadow-xl max-w-4xl mx-auto">
              <div className="flex flex-col gap-6">
                <div className="self-end bg-[#D4714E] text-white p-6 rounded-[24px] rounded-br-[8px] max-w-[85%] md:max-w-[75%] shadow-md text-[16px] leading-relaxed">
                  I&apos;m thinking about selling my commercial HVAC company. We&apos;re in Dallas-Fort Worth, about $4.2M in revenue and $780K in adjusted EBITDA last year.
                </div>
                <div className="self-start flex gap-4 max-w-[95%] md:max-w-[85%]">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#EAE6DF] flex items-center justify-center text-[#D4714E] font-black text-sm shrink-0 shadow-sm mt-1">Y</div>
                  <div className="bg-white border border-[#EAE6DF] p-6 md:p-8 rounded-[24px] rounded-tl-[8px] shadow-md text-[#1A1A18] text-[16px] leading-relaxed">
                    <p className="mb-4">
                      Commercial HVAC in DFW &mdash; strong combination right now. Let me run this against current market data through the smbX.ai engine.
                    </p>
                    <p className="mb-6">
                      Your $780K EBITDA puts you in what we call the lower middle market. For commercial HVAC in the Dallas-Fort Worth MSA, current multiples are running <strong className="bg-[#FFF0EB] text-[#D4714E] px-1 rounded">4.8x&ndash;6.2x</strong> based on comparable transactions and active PE interest.
                    </p>

                    <div className="bg-[#FDFCFB] border border-[#EAE6DF] rounded-2xl p-6 mb-6 shadow-sm">
                      <div className="text-sm text-[#6E6A63] uppercase tracking-wider font-bold mb-1">Preliminary Enterprise Value</div>
                      <div className="text-3xl font-black text-[#1A1A18]">$3.7M &ndash; $4.8M</div>
                    </div>

                    <div className="space-y-4 text-[15px] mb-6">
                      <div className="flex items-start gap-3 bg-green-50/50 p-4 rounded-xl border border-green-100">
                        <div className="mt-1 font-black text-green-600">&check;</div>
                        <div><strong>Working for you:</strong> DFW is a high-demand market. I&apos;m tracking 14 PE-backed HVAC platforms actively acquiring in Texas.</div>
                      </div>
                      <div className="flex items-start gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                        <div className="mt-1 font-black text-amber-600">!</div>
                        <div><strong>Worth examining:</strong> Your EBITDA margin of 18.6% is solid but below the 21% industry median. We should identify add-backs to optimize this before going to market.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* AUDIENCE GRID */}
          <section className="px-6 py-24 bg-white border-y border-[#EAE6DF]">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for everyone in the deal.</h2>
                <p className="text-[#6E6A63] text-lg">Start with the intelligence that makes every decision clearer.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <AudienceCard letter="S" title="Selling, buying, or raising capital" desc="Whether you&apos;re a first-time seller who needs to understand the process or a serial acquirer evaluating your next target." cta="Tell Yulia about your deal" />
                <AudienceCard letter="A" title="Brokers &amp; M&amp;A advisors" desc="Package listings faster. Qualify buyers instantly. Walk into every pitch with localized market intelligence that demonstrates your analytical depth." cta="See how advisors use smbX.ai" />
                <AudienceCard letter="P" title="PE, family offices &amp; search funds" desc="Screen industries, model acquisitions, and build conviction at deal-flow speed. Analysis that takes your team hours, ready in minutes." cta="Explore investor tools" />
                <AudienceCard letter="L" title="Attorneys &amp; CPAs" desc="Walk into every engagement with the financials, market position, and competitive landscape already organized and analyzed. Less ramp-up." cta="Start with Yulia" />
              </div>
            </div>
          </section>

          {/* TRACEABILITY / TRUST SECTION */}
          <section className="px-6 py-24 bg-[#F8F6F1]">
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-16 h-16 bg-white border border-[#EAE6DF] shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#D4714E] font-black text-2xl">
                &check;
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Every insight is traceable. <br />Every analysis is explainable.</h2>
              <p className="text-lg text-[#6E6A63] leading-relaxed mb-8">
                smbX.ai is built on data from agencies required by law to collect it &mdash; the same sovereign data sources that inform the Federal Reserve, Wall Street research desks, and the world&apos;s largest financial institutions.
              </p>
              <div className="inline-flex items-center justify-center p-5 bg-white rounded-2xl border border-[#EAE6DF] shadow-md">
                <span className="font-bold text-[#1A1A18] text-lg">That&apos;s the difference between a chatbot and an intelligence engine.</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* --- CHAT MESSAGES AREA (Visible only when chatting) --- */}
      <div className={`flex-1 w-full overflow-y-auto px-6 pt-8 pb-40 max-w-4xl mx-auto transition-all duration-700 ${isChatting ? 'opacity-100' : 'opacity-0 hidden'}`}>
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE6DF] mb-8">
          <button onClick={() => setIsChatting(false)} className="text-sm font-bold text-[#A9A49C] hover:text-[#1A1A18] transition-colors cursor-pointer bg-transparent border-none" type="button">
            &larr; Exit Workspace
          </button>
          <div className="text-xs font-bold uppercase tracking-widest text-[#D4714E]">Intelligence Engine Active</div>
        </div>

        <div className="flex flex-col gap-6">
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

      {/* --- THE MORPHING CHAT PILL --- */}
      {/* Uses absolute centering when landing, fixed bottom docking when chatting */}
      <div className={`w-full px-4 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isChatting
          ? 'fixed bottom-6 left-0 right-0'
          : 'absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 mt-8'
      }`} style={{ paddingBottom: isChatting ? 'max(8px, env(safe-area-inset-bottom))' : undefined }}>
        <div className="max-w-[800px] mx-auto w-full flex flex-col items-center">

          {/* Exact Sleek Pill Styling */}
          <form
            onSubmit={(e) => handleSend(e)}
            className={`w-full bg-white flex items-center transition-all duration-500 rounded-full p-2 pl-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgba(212,113,78,0.12)] focus-within:shadow-[0_16px_40px_rgba(212,113,78,0.15)] focus-within:border-[#D4714E]/50 focus-within:ring-4 focus-within:ring-[#FFF0EB] ${isChatting ? 'border border-[#EAE6DF]' : 'border border-transparent'}`}
          >
            <span className="text-[#D4714E] text-2xl leading-none mr-3 mb-[2px] font-serif select-none">&loz;</span>

            {/* Standard single-line input for sleekness */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(e); }}
              placeholder="Message Yulia about your deal..."
              className="flex-1 bg-transparent border-none focus:outline-none text-[16px] md:text-[18px] text-[#1A1A18] placeholder:text-[#A9A49C] py-3.5 md:py-4 px-2 font-medium"
            />

            <button
              type="submit"
              disabled={!inputValue.trim() || isStreaming}
              className="bg-[#D4714E] text-white px-6 md:px-8 py-3.5 md:py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-[#b8613d] transition-colors shadow-sm disabled:opacity-50 disabled:shadow-none ml-2 cursor-pointer"
            >
              Send
            </button>
          </form>

          {/* Suggestion Chips (Fades out when chatting) */}
          <div className={`transition-all duration-700 overflow-hidden flex flex-col items-center ${isChatting ? 'opacity-0 h-0 mt-0' : 'opacity-100 h-auto mt-8'}`}>
            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mb-6">
              <button type="button" onClick={() => handleSend(undefined, "Value my $2M plumbing business")} className="bg-white border border-[#EAE6DF] text-[#6E6A63] text-[13px] md:text-sm font-medium px-4 py-2.5 rounded-full hover:border-[#D4714E] hover:text-[#D4714E] hover:shadow-sm transition-all cursor-pointer">&ldquo;Value my $2M plumbing business&rdquo;</button>
              <button type="button" onClick={() => handleSend(undefined, "Walk me through selling my company")} className="bg-white border border-[#EAE6DF] text-[#6E6A63] text-[13px] md:text-sm font-medium px-4 py-2.5 rounded-full hover:border-[#D4714E] hover:text-[#D4714E] hover:shadow-sm transition-all cursor-pointer">&ldquo;Walk me through selling my company&rdquo;</button>
            </div>
            <div className="text-[12px] font-bold text-[#A9A49C] uppercase tracking-widest">
              Instant valuations &bull; SBA Bankability &bull; Localized Market Intelligence
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
