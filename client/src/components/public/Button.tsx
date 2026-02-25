import { Link } from 'wouter';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'nav' | 'cardLink' | 'ctaBlock';

interface ButtonProps {
  variant: Variant;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  fullWidth?: boolean;
}

const base = 'inline-flex items-center justify-center gap-1.5 font-sans whitespace-nowrap no-underline transition-all duration-200 ease-out cursor-pointer';

const variants: Record<Variant, string> = {
  primary:
    `${base} bg-[#D4714E] text-white border-none rounded-full text-[15px] font-semibold px-8 py-4 hover:bg-[#BE6342] hover:-translate-y-px`,
  secondary:
    `${base} bg-transparent text-[#1A1A18] border-2 border-[#E8E4DC] rounded-full text-[15px] font-semibold px-7 py-3.5 hover:border-[#1A1A18]`,
  nav:
    `${base} bg-[#D4714E] text-white border-none rounded-full text-[13px] font-semibold py-2.5 px-[22px] hover:bg-[#BE6342]`,
  cardLink:
    `inline-flex items-center gap-1.5 text-[#D4714E] text-sm font-semibold font-sans bg-transparent border-none p-0 cursor-pointer no-underline transition-transform duration-200 hover:translate-x-1`,
  ctaBlock:
    `${base} bg-white text-[#D4714E] border-none rounded-full text-base font-bold px-10 py-[18px] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]`,
};

export default function Button({
  variant,
  href,
  onClick,
  children,
  className = '',
  type = 'button',
  disabled,
  fullWidth,
}: ButtonProps) {
  const classes = `${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  );
}
