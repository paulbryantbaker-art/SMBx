import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'h-12 rounded-full px-8 py-3 text-base font-medium bg-terra text-white hover:bg-terra-hover transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'h-12 rounded-full px-8 py-3 text-base font-medium bg-white border border-border text-text-primary hover:bg-cream-hover transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'h-9 px-4 py-2 text-sm bg-transparent text-text-secondary hover:text-text-primary transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
  icon:
    'h-9 w-9 rounded-lg p-2 bg-transparent text-text-secondary hover:text-text-primary hover:bg-cream-hover transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${variantClasses[variant]} font-[system-ui,sans-serif] ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
