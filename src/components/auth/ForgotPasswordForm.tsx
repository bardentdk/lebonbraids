'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '@/lib/auth/validators';
import { forgotPasswordAction } from '@/lib/auth/actions';

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    startTransition(async () => {
      const result = await forgotPasswordAction(data);
      if (result.success) {
        setSentEmail(getValues('email'));
        setSent(true);
        toast.success('Email envoyé !');
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            <Input
              label="Adresse email"
              type="email"
              autoComplete="email"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              hint="Nous t'enverrons un lien pour réinitialiser ton mot de passe"
              {...register('email')}
            />

            <Button type="submit" size="xl" fullWidth loading={isPending}>
              Envoyer le lien
            </Button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success"
            >
              <CheckCircle2 className="h-8 w-8" strokeWidth={2} />
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold">Email envoyé !</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Nous avons envoyé un lien à{' '}
                <strong className="text-foreground">{sentEmail}</strong>.
                Clique sur le lien pour réinitialiser ton mot de passe.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}