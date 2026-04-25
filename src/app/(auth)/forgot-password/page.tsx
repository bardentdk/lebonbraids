import type { Metadata } from 'next';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Mot de passe oublié',
  description: 'Réinitialisez votre mot de passe',
};

export default function ForgotPasswordPage() {
  return (
    <AuthSplitLayout
      imageUrl="https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=1400&q=90"
      quote="Pas de panique, on t'envoie un lien pour retrouver l'accès."
    >
      <AuthHeader
        title="Mot de passe oublié ?"
        subtitle="Entre ton email, nous t'enverrons un lien de réinitialisation."
      />
      <ForgotPasswordForm />
    </AuthSplitLayout>
  );
}