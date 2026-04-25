'use client';

import { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, ...props }, ref) => {
    const inputId = id || `select-${label?.replace(/\s+/g, '-').toLowerCase()}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={cn(
              'h-12 w-full appearance-none rounded-xl border bg-background px-4 pr-10 text-sm text-foreground outline-none transition-all duration-200',
              error
                ? 'border-danger focus:ring-2 focus:ring-danger/20'
                : 'border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
        {!error && hint && (
          <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';