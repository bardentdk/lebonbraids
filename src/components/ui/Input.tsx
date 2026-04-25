'use client';

import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      containerClassName,
      className,
      id,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;

    return (
      <div className={cn('w-full', containerClassName)}>
        <div
          className={cn(
            'relative flex items-center transition-all duration-200',
            error && 'animate-[shake_0.4s_cubic-bezier(0.36,0.07,0.19,0.97)]'
          )}
        >
          {leftIcon && (
            <div
              className={cn(
                'absolute left-4 z-10 transition-colors duration-200',
                focused ? 'text-primary-600' : 'text-muted-foreground',
                error && 'text-danger'
              )}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            placeholder=" "
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            className={cn(
              'peer w-full rounded-xl border bg-background px-4 text-sm text-foreground outline-none transition-all duration-200',
              'placeholder:text-transparent',
              label ? 'h-14 pt-5' : 'h-12',
              leftIcon && 'pl-12',
              rightIcon && 'pr-12',
              error
                ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
                : 'border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
              className
            )}
            {...props}
          />

          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                'pointer-events-none absolute text-sm transition-all duration-200',
                leftIcon ? 'left-12' : 'left-4',
                // Position par défaut (centré verticalement)
                'top-1/2 -translate-y-1/2',
                // Quand focus ou filled
                'peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:font-medium',
                'peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium',
                focused ? 'text-primary-600' : 'text-muted-foreground',
                error && 'text-danger peer-focus:text-danger'
              )}
            >
              {label}
            </label>
          )}

          {rightIcon && (
            <div className="absolute right-4 z-10 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-1.5 flex items-center gap-1.5 text-xs text-danger"
              role="alert"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </motion.p>
          )}
          {!error && hint && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1.5 text-xs text-muted-foreground"
            >
              {hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';