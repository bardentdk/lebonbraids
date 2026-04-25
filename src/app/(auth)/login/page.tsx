import type { Metadata } from 'next';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre compte',
};

export default function LoginPage() {
  return (
    <AuthSplitLayout
      imageUrl="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1400&q=90"
      quote="L'art des tresses, sublimé par la technologie."
      quoteAuthor="Braids Platform"
    >
      <AuthHeader
        badge="Bienvenue à nouveau"
        title="Connexion"
        subtitle="Accède à ton espace personnel et à tes réservations."
      />
      <LoginForm />
    </AuthSplitLayout>
  );
}