import { useState, useRef, useEffect, type ReactNode } from 'react';

interface DropdownItem {
  label: string;
  value: string;
  icon?: ReactNode;
}

interface DropdownProps {
  items: DropdownItem[];
  value?: string;
  placeholder?: string;
  onSelect: (value: string) => void;
}

export default function Dropdown({ items, value, placeholder = 'Select...', onSelect }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = items.find(i => i.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      {/* Trigger — matches Button variant="secondary" */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="h-12 rounded-full px-8 py-3 text-base font-medium bg-white border border-border text-text-primary hover:bg-cream-hover transition-colors duration-150 cursor-pointer font-[system-ui,sans-serif] inline-flex items-center gap-2"
      >
        <span>{selected?.label || placeholder}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Menu */}
      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-full bg-white rounded-xl shadow-[0_0.5rem_2rem_rgba(0,0,0,0.06)] border border-border py-1 z-50">
          {items.map(item => (
            <button
              key={item.value}
              type="button"
              onClick={() => { onSelect(item.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-cream-dark transition-colors font-[system-ui,sans-serif] cursor-pointer ${
                item.value === value ? 'bg-cream-dark' : ''
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
