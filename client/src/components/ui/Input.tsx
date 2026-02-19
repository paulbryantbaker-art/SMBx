import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary font-[system-ui,sans-serif] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`h-12 w-full rounded-lg border border-border bg-white px-4 text-base text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-terra focus:border-transparent transition-colors duration-150 font-[system-ui,sans-serif] ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
