import type { Metadata } from 'next';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Nouveau mot de passe',
  description: 'Choisissez un nouveau mot de passe',
};

export default function ResetPasswordPage() {
  return (
    <AuthSplitLayout
      imageUrl="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1400&q=90"
      quote="Un nouveau départ commence par un mot de passe solide."
    >
      <AuthHeader
        title="Nouveau mot de passe"
        subtitle="Choisis un mot de passe sécurisé que tu retiendras facilement."
      />
      <ResetPasswordForm />
    </AuthSplitLayout>
  );
}