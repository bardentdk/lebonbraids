'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { PasswordInput } from './PasswordInput';
import { loginSchema, type LoginInput } from '@/lib/auth/validators';
import { loginAction } from '@/lib/auth/actions';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  });

  const onSubmit = (data: LoginInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await loginAction(data);

      if (!result.success) {
        setServerError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success(result.message || 'Connexion réussie');
      const redirectTo = searchParams.get('redirectTo') || result.redirectTo || '/';
      router.push(redirectTo);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-4">
        <Input
          label="Adresse email"
          type="email"
          autoComplete="email"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordInput
          label="Mot de passe"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      <div className="flex items-center justify-between">
        <Checkbox label="Se souvenir de moi" {...register('remember')} />
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
        >
          Mot de passe oublié ?
        </Link>
      </div>

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
        Se connecter
      </Button>

      <div className="relative flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Nouveau ici ?
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Link
        href="/register"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-transparent font-medium text-foreground transition-all hover:border-primary-400 hover:bg-muted/50"
      >
        Créer un compte
      </Link>
    </form>
  );
}