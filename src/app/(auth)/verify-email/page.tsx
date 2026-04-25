import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';

export const metadata: Metadata = {
  title: 'Vérifie ton email',
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthSplitLayout
      imageUrl="https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=1400&q=90"
      quote="Un simple clic et ton aventure commence."
    >
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-premium">
          <Mail className="h-9 w-9" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Vérifie ta boîte mail
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Nous avons envoyé un lien de confirmation à{' '}
            {email && (
              <strong className="text-foreground">{email}</strong>
            )}
            {!email && 'ton adresse email'}.<br />
            Clique dessus pour activer ton compte.
          </p>
        </div>

        <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-4 text-left text-sm text-primary-900">
          <p className="font-medium">💡 Astuce</p>
          <p className="mt-1 text-primary-800">
            Vérifie aussi tes dossiers <strong>Spam</strong> et{' '}
            <strong>Promotions</strong> si tu ne vois rien.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>
      </div>
    </AuthSplitLayout>
  );
}