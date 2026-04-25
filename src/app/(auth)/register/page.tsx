import type { Metadata } from 'next';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Créer un compte',
  description: 'Créez votre compte',
};

export default function RegisterPage() {
  return (
    <AuthSplitLayout
      imageUrl="https://images.unsplash.com/photo-1595247299329-52cb83d7c15a?w=1400&q=90"
      quote="Rejoins une communauté qui met en valeur ta beauté."
      quoteAuthor="Braids Platform"
    >
      <AuthHeader
        badge="Nouveau ici"
        title="Créer un compte"
        subtitle="Réserve en quelques clics et accède à ton historique."
      />
      <RegisterForm />
    </AuthSplitLayout>
  );
}