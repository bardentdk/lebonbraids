'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { PasswordInput } from './PasswordInput';
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from '@/lib/auth/validators';
import { resetPasswordAction } from '@/lib/auth/actions';

export function ResetPasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = (data: ResetPasswordInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await resetPasswordAction(data);
      if (!result.success) {
        setServerError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(result.message || 'Mot de passe mis à jour !');
      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <PasswordInput
        label="Nouveau mot de passe"
        autoComplete="new-password"
        showStrength
        value={password}
        error={errors.password?.message}
        {...register('password')}
      />

      <PasswordInput
        label="Confirmer le nouveau mot de passe"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger"
        >
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        size="xl"
        fullWidth
        loading={isPending}
        rightIcon={!isPending && <ArrowRight className="h-4 w-4" />}
      >
        Mettre à jour le mot de passe
      </Button>
    </form>
  );
}