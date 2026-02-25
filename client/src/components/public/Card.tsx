import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: string;
}

export default function Card({ children, className = '', hover = true, padding = 'p-8' }: CardProps) {
  return (
    <div
      className={`
        bg-white border border-[#E0DCD4] rounded-2xl ${padding}
        ${hover ? 'transition-all duration-250 ease-out hover:border-[#D4714E] hover:shadow-[0_8px_32px_rgba(218,119,86,.08)] hover:-translate-y-0.5 relative overflow-hidden group' : ''}
        ${className}
      `}
    >
      {hover && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#D4714E] opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
      )}
      {children}
    </div>
  );
}
