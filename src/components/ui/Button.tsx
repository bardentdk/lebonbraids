'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  shine?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-primary text-white shadow-premium hover:shadow-glow active:scale-[0.98]',
  secondary:
    'bg-secondary-500 text-white hover:bg-secondary-600 shadow-soft active:scale-[0.98]',
  outline:
    'border border-border bg-transparent hover:bg-muted text-foreground active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-muted text-foreground active:scale-[0.98]',
  danger:
    'bg-danger text-white hover:bg-danger/90 shadow-soft active:scale-[0.98]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm rounded-lg',
  md: 'h-11 px-6 text-sm rounded-xl',
  lg: 'h-12 px-7 text-base rounded-xl',
  xl: 'h-14 px-8 text-base rounded-2xl font-semibold',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      shine = true,
      leftIcon,
      rightIcon,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          shine && variant === 'primary' && 'btn-shine',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Spinner size="sm" />
            <span>Chargement...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            <span className="relative z-10">{children}</span>
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';