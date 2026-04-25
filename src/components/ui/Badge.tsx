import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type Variant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary-100 text-primary-800',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  outline: 'border border-border text-foreground',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}