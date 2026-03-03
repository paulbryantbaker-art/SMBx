import { useState, useRef, useCallback, useEffect } from 'react';
import type { TabId } from './Sidebar';

interface InputDockProps {
  viewState: string;
  activeTab: TabId;
  onSend: (content: string) => void;
  disabled?: boolean;
}

const PLACEHOLDERS: Record<string, string> = {
  home: 'Tell Yulia about your deal...',
  sell: 'Tell Yulia about the business you want to sell...',
  buy: 'Tell Yulia what kind of business you\'re looking for...',
  advisors: 'Tell Yulia about your client\'s deal...',
  pricing: 'Tell Yulia about your deal...',
  chat: 'Reply to Yulia...',
};

export const SUGGESTION_CHIPS: Record<string, { label: string; prompt: string }[]> = {
  home: [
    { label: '"What would a buyer pay for my business?"', prompt: 'What would a buyer pay for my business? I want to understand what it might be worth in today\'s market.' },
    { label: '"I\'m a broker \u2014 show me what you can do"', prompt: "I'm a business broker. Show me how you can help me with my practice \u2014 valuations, CIMs, buyer matching, deal management." },
  ],
  sell: [
    { label: '"Value my $1.8M pest control business"', prompt: 'Value my $1.8M revenue pest control business. Help me understand what it might be worth.' },
    { label: '"Walk me through the selling process"', prompt: 'Walk me through selling my company. I want to understand the full process from start to close.' },
  ],
  buy: [
    { label: '"Find acquisition targets in home healthcare"', prompt: 'Find acquisition targets in home healthcare. I\'m looking to buy in the $1-3M revenue range.' },
    { label: '"Evaluate a business I\'m looking at"', prompt: 'I\'m looking at a specific business to acquire. Help me evaluate whether it\'s a good deal.' },
  ],
  advisors: [
    { label: '"I have a new listing \u2014 help me package it"', prompt: 'I have a new listing and need to package it quickly. Help me build the market intelligence and CIM.' },
    { label: '"Show me what white-label deliverables look like"', prompt: 'Show me what white-label deliverables look like. I want to see the quality of reports I can brand with my firm\'s identity.' },
  ],
  pricing: [
    { label: '"What can you do for free? Show me."', prompt: 'What can you do for free? Show me the quality of your free analysis.' },
    { label: '"What\'s included in a full valuation report?"', prompt: 'What\'s included in a full valuation report? Walk me through what I\'d get.' },
  ],
};

function ArrowUp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

export default function InputDock({ viewState, activeTab, onSend, disabled }: InputDockProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasContent = value.trim().length > 0;
  const isLanding = viewState === 'landing';

  const placeholder = viewState === 'chat' ? PLACEHOLDERS.chat : (PLACEHOLDERS[activeTab] || PLACEHOLDERS.home);

  const send = useCallback(() => {
    const t = value.trim();
    if (!t || disabled) return;
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    onSend(t);
  }, [value, disabled, onSend]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, []);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }, [send]);

  useEffect(() => {
    if (viewState === 'chat') {
      setTimeout(() => textareaRef.current?.focus({ preventScroll: true }), 300);
    }
  }, [viewState]);

  if (isLanding) {
    return (
      <div className="fixed bottom-6 md:bottom-10 left-0 right-0 px-4 z-50 pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-[700px] mx-auto pointer-events-auto">
          <div className="bg-white rounded-2xl flex items-end shadow-[0_8px_30px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] border border-[#e0ddd7] transition-all duration-200 focus-within:border-[#c9a08a] focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.1),0_0_0_1px_rgba(174,86,48,0.15)]">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKey}
              placeholder={placeholder}
              className="flex-1 bg-transparent border-none outline-none resize-none text-[16px] text-[#1A1A18] placeholder:text-[#9a958e] py-4 pl-5 pr-2 leading-[1.5]"
              style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", serif', minHeight: '26px', maxHeight: '160px' }}
              rows={1}
            />
            <button
              onClick={send}
              disabled={!hasContent || disabled}
              className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 mr-3 mb-3 ${
                hasContent && !disabled
                  ? 'bg-[#D4714E] text-white hover:bg-[#b8613d] shadow-sm cursor-pointer'
                  : 'bg-[#EDEDEA] text-[#b5b0a8] cursor-default'
              }`}
              type="button"
            >
              <ArrowUp />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Chat mode
  return (
    <div className="flex-shrink-0 w-full bg-white relative z-20" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
      <div className="pointer-events-none absolute -top-16 left-0 right-0 h-16" style={{ background: 'linear-gradient(to bottom, transparent, white)' }} />

      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl flex items-end shadow-[0_0.25rem_1.25rem_rgba(0,0,0,0.035)] border border-[#e5e5e0] transition-all duration-200 focus-within:border-[#c9a08a] focus-within:shadow-[0_0.25rem_1.25rem_rgba(0,0,0,0.05),0_0_0_1px_rgba(174,86,48,0.12)]">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKey}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none resize-none text-[16px] text-[#1A1A18] placeholder:text-[#9a958e] py-4 pl-5 pr-2 leading-[1.5]"
            style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", serif', minHeight: '26px', maxHeight: '160px' }}
            rows={1}
          />
          <button
            onClick={send}
            disabled={!hasContent || disabled}
            className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 mr-3 mb-3 ${
              hasContent && !disabled
                ? 'bg-[#D4714E] text-white hover:bg-[#b8613d] shadow-sm cursor-pointer'
                : 'bg-[#EDEDEA] text-[#b5b0a8] cursor-default'
            }`}
            type="button"
          >
            <ArrowUp />
          </button>
        </div>

        <p className="text-center text-[12px] text-[#9CA3AF] mt-2.5 hidden sm:block" style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", serif' }}>
          Yulia is an AI advisor. Built on Census, BLS, FRED, and SEC EDGAR data.
        </p>
      </div>
    </div>
  );
}
