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

export default function InputDock({ viewState, activeTab, onSend, disabled }: InputDockProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasContent = value.trim().length > 0;

  const placeholder = viewState === 'chat' ? PLACEHOLDERS.chat : (PLACEHOLDERS[activeTab] || PLACEHOLDERS.home);

  const send = useCallback(() => {
    const t = value.trim();
    if (!t || disabled) return;
    setValue('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
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

  // Auto-focus after morph to chat
  useEffect(() => {
    if (viewState === 'chat') {
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 300);
    }
  }, [viewState]);

  return (
    <div className="flex-shrink-0 w-full bg-white relative z-20" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
      {/* Gradient fade above dock — taller for more presence */}
      <div className="pointer-events-none absolute -top-16 left-0 right-0 h-16" style={{ background: 'linear-gradient(to bottom, transparent, white)' }} />

      <div className="max-w-3xl mx-auto px-4">
        {/* Input bar */}
        <div
          className={`relative bg-white rounded-2xl transition-all duration-300 ${
            viewState === 'landing'
              ? 'border-2 border-gray-300 shadow-[0_4px_20px_rgba(0,0,0,0.1),0_8px_40px_rgba(0,0,0,0.06)]'
              : 'border border-gray-200 shadow-lg'
          } focus-within:border-[#D4714E] focus-within:shadow-[0_4px_20px_rgba(212,113,78,0.15),0_8px_40px_rgba(212,113,78,0.08)]`}
        >
          <div className="flex items-end gap-3 px-4 py-3.5">
            {/* Sparkles icon — larger, filled */}
            <div className="flex-shrink-0 pb-0.5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#D4714E" stroke="#D4714E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
              </svg>
            </div>

            {/* Textarea */}
            <textarea
              ref={inputRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKey}
              placeholder={placeholder}
              className="flex-1 bg-transparent border-none outline-none resize-none text-[16px] text-[#2D3142] leading-[1.5] placeholder:text-[#6B7280] placeholder:font-medium"
              style={{ fontFamily: 'inherit', minHeight: '26px', maxHeight: '160px' }}
              rows={1}
            />

            {/* Send button — always visible, larger */}
            <button
              onClick={send}
              disabled={!hasContent || disabled}
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all ${
                hasContent && !disabled
                  ? 'bg-[#D4714E] text-white hover:bg-[#BE6342] shadow-md'
                  : 'bg-gray-200 text-gray-400'
              }`}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-[12px] text-[#9CA3AF] mt-2.5 hidden sm:block">
          Yulia is an AI advisor. Built on Census, BLS, FRED, and SEC EDGAR data.
        </p>
      </div>
    </div>
  );
}
