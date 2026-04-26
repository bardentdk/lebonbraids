import Link from 'next/link';
import { Sparkles, Unlink, Mail, Phone, MapPin } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { getPublicSettings } from '@/lib/settings/service';export async function Footer({ shopEnabled }: { shopEnabled: boolean }) {
const settings = await getPublicSettings();const businessName = (settings['business.name'] as string) || siteConfig.name;
const businessEmail = (settings['business.email'] as string) || siteConfig.email;
const businessPhone = (settings['business.phone'] as string) || siteConfig.phone;
const businessAddress = settings['business.address'] as string;
const businessCity = settings['business.city'] as string;
const tagline = (settings['business.tagline'] as string) || siteConfig.description;
const instagramUrl = settings['social.instagram'] as string;
const facebookUrl = settings['social.facebook'] as string;return (
<footer className="relative mt-20 overflow-hidden border-t border-border bg-muted/30">
{/* Glow décoratif */}
<div
aria-hidden="true"
className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full opacity-30 blur-3xl"
style={{
background:
'radial-gradient(circle, hsl(var(--color-primary-300)) 0%, transparent 70%)',
}}
/>
<div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full opacity-20 blur-3xl"
style={{
background:
'radial-gradient(circle, hsl(var(--color-secondary-500)) 0%, transparent 70%)',
}}
/>  <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
      {/* Brand */}
      <div>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-soft">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold">{businessName}</span>
        </Link>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {tagline}
        </p>
        <div className="mt-5 flex gap-2">
          {instagramUrl && (              
            <a href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-all hover:scale-110 hover:border-primary-400 hover:text-primary-600"
              aria-label="Instagram"
            >
              <Unlink className="h-4 w-4" />
            </a>
          )}
          {facebookUrl && (              
            <a href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-all hover:scale-110 hover:border-primary-400 hover:text-primary-600"
              aria-label="Facebook"
            >
              <Unlink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>      {/* Navigation */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
          Navigation
        </h3>
        <ul className="space-y-2.5 text-sm">
          <li>
            <Link href="/" className="text-muted-foreground transition-colors hover:text-primary-600">
              Accueil
            </Link>
          </li>
          <li>
            <Link href="/prestations" className="text-muted-foreground transition-colors hover:text-primary-600">
              Prestations
            </Link>
          </li>
          {shopEnabled && (
            <li>
              <Link href="/boutique" className="text-muted-foreground transition-colors hover:text-primary-600">
                Boutique
              </Link>
            </li>
          )}
          <li>
            <Link href="/reservation" className="text-muted-foreground transition-colors hover:text-primary-600">
              Réservation
            </Link>
          </li>
          <li>
            <Link href="/a-propos" className="text-muted-foreground transition-colors hover:text-primary-600">
              À propos
            </Link>
          </li>
          <li>
            <Link href="/contact" className="text-muted-foreground transition-colors hover:text-primary-600">
              Contact
            </Link>
          </li>
        </ul>
      </div>      {/* Contact */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
          Contact
        </h3>
        <ul className="space-y-3 text-sm">
          {businessEmail && (
            <li>                
                <a href={`mailto:${businessEmail}`}
                    className="flex items-start gap-2.5 text-muted-foreground transition-colors hover:text-primary-600"
                >
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{businessEmail}</span>
              </a>
            </li>
          )}
          {businessPhone && (
            <li>                
                <a href={`tel:${businessPhone}`}
                    className="flex items-start gap-2.5 text-muted-foreground transition-colors hover:text-primary-600"
                >
                    <Phone className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{businessPhone}</span>
                </a>
            </li>
          )}
          {(businessAddress || businessCity) && (
            <li className="flex items-start gap-2.5 text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>
                {businessAddress && <>{businessAddress}<br /></>}
                {businessCity}
              </span>
            </li>
          )}
        </ul>
      </div>      {/* Légal */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
          Informations
        </h3>
        <ul className="space-y-2.5 text-sm">
          <li>
            <Link href="/cgu" className="text-muted-foreground transition-colors hover:text-primary-600">
              Conditions d'utilisation
            </Link>
          </li>
          <li>
            <Link href="/confidentialite" className="text-muted-foreground transition-colors hover:text-primary-600">
              Politique de confidentialité
            </Link>
          </li>
          <li>
            <Link href="/mentions-legales" className="text-muted-foreground transition-colors hover:text-primary-600">
              Mentions légales
            </Link>
          </li>
        </ul>
      </div>
    </div>    <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>
        © {new Date().getFullYear()} {businessName}. Tous droits réservés.
      </p>
      <p>
        Conçu avec ♥ — Plateforme propulsée par{' '}
        <span className="text-gradient font-semibold">Braids Platform</span>
      </p>
    </div>
  </div>
</footer>
);
}