import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  children: ReactNode;
}

export default function Card({ hover = false, className = '', children, ...props }: CardProps) {
  const base = 'bg-white rounded-2xl shadow-[0_0.25rem_1.25rem_rgba(0,0,0,0.035)] p-6';
  const hoverClass = hover
    ? 'hover:shadow-[0_0.5rem_2rem_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-150'
    : '';

  return (
    <div className={`${base} ${hoverClass} ${className}`} {...props}>
      {children}
    </div>
  );
}
