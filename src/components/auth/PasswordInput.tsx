'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { PasswordStrength } from './PasswordStrength';

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
  showStrength?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrength = false, value, ...props }, ref) => {
    const [show, setShow] = useState(false);

    return (
      <div className="w-full">
        <Input
          ref={ref}
          type={show ? 'text' : 'password'}
          value={value}
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary-600"
              tabIndex={-1}
              aria-label={show ? 'Masquer' : 'Afficher'}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...props}
        />
        {showStrength && typeof value === 'string' && (
          <PasswordStrength password={value} />
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';