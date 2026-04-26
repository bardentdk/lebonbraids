import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Unlink } from 'lucide-react';
import { getPublicSettings } from '@/lib/settings/service';

export const metadata: Metadata = {
  title: 'Contact',
};

export default async function ContactPage() {
  const settings = await getPublicSettings();

  const email = settings['business.email'] as string;
  const phone = settings['business.phone'] as string;
  const address = settings['business.address'] as string;
  const city = settings['business.city'] as string;
  const instagram = settings['social.instagram'] as string;
  const facebook = settings['social.facebook'] as string;

  return (
    <div>
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-96 w-[600px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, hsl(var(--color-primary-300)) 0%, transparent 70%)',
          }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              <span className="text-gradient">Contact</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Une question ? Une demande spéciale ? Je suis là pour t'écouter.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {email && (
              <ContactCard icon={Mail} label="Email" value={email} href={`mailto:${email}`} />
            )}
            {phone && (
              <ContactCard icon={Phone} label="Téléphone" value={phone} href={`tel:${phone}`} />
            )}
            {(address || city) && (
              <ContactCard
                icon={MapPin}
                label="Adresse"
                value={[address, city].filter(Boolean).join(' — ')}
              />
            )}
            {instagram && (
              <ContactCard
                icon={Unlink}
                label="Instagram"
                value="Suivre"
                href={instagram}
                external
              />
            )}
            {facebook && (
              <ContactCard
                icon={Unlink}
                label="Facebook"
                value="Suivre"
                href={facebook}
                external
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-soft">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-1 break-words text-base font-medium">{value}</div>
      </div>
    </>
  );

  const className =
    'group flex flex-col rounded-2xl border border-border bg-background p-6 transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-soft';

  if (href) {
    return (
    <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={className}
    >
        {content}
    </a>
    );
  }
  return <div className={className}>{content}</div>;
}