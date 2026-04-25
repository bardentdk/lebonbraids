'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, label, color } = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;

    if (!password) return { score: 0, label: '', color: 'bg-muted' };
    if (s <= 1) return { score: 1, label: 'Faible', color: 'bg-danger' };
    if (s <= 3) return { score: 2, label: 'Moyen', color: 'bg-warning' };
    if (s === 4) return { score: 3, label: 'Fort', color: 'bg-primary-500' };
    return { score: 4, label: 'Excellent', color: 'bg-success' };
  }, [password]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: i <= score ? 1 : 0.2 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={cn(
              'h-1 flex-1 origin-left rounded-full transition-colors duration-300',
              i <= score ? color : 'bg-muted'
            )}
          />
        ))}
      </div>
      {label && (
        <motion.p
          key={label}
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'text-xs font-medium',
            score === 1 && 'text-danger',
            score === 2 && 'text-warning',
            score === 3 && 'text-primary-600',
            score === 4 && 'text-success'
          )}
        >
          Sécurité : {label}
        </motion.p>
      )}
    </div>
  );
}