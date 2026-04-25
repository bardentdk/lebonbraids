'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, User, Phone, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { PasswordInput } from './PasswordInput';
import { registerSchema, type RegisterInput } from '@/lib/auth/validators';
import { registerAction } from '@/lib/auth/actions';

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false as unknown as true,
      marketingConsent: false,
    },
  });

  const password = watch('password');

  const onSubmit = (data: RegisterInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await registerAction(data);

      if (!result.success) {
        setServerError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success(result.message || 'Compte créé !');
      if (result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Prénom"
          autoComplete="given-name"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label="Nom"
          autoComplete="family-name"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>

      <Input
        label="Adresse email"
        type="email"
        autoComplete="email"
        leftIcon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Téléphone (facultatif)"
        type="tel"
        autoComplete="tel"
        leftIcon={<Phone className="h-4 w-4" />}
        error={errors.phone?.message}
        {...register('phone')}
      />

      <PasswordInput
        label="Mot de passe"
        autoComplete="new-password"
        showStrength
        value={password}
        error={errors.password?.message}
        {...register('password')}
      />

      <PasswordInput
        label="Confirmer le mot de passe"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <div className="space-y-3">
        <Checkbox
          error={errors.acceptTerms?.message}
          label={
            <>
              J'accepte les{' '}
              <Link
                href="/cgu"
                className="font-medium text-primary-600 hover:underline"
              >
                conditions d'utilisation
              </Link>{' '}
              et la{' '}
              <Link
                href="/confidentialite"
                className="font-medium text-primary-600 hover:underline"
              >
                politique de confidentialité
              </Link>
            </>
          }
          {...register('acceptTerms')}
        />
        <Checkbox
          label="Je souhaite recevoir les offres et nouveautés par email"
          {...register('marketingConsent')}
        />
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
        Créer mon compte
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{' '}
        <Link
          href="/login"
          className="font-medium text-primary-600 transition-colors hover:text-primary-700"
        >
          Se connecter
        </Link>
      </p>
    </form>
  );
}