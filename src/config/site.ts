export const siteConfig = {
  name: 'Braids Platform',
  shortName: 'Braids',
  description:
    'Prenez rendez-vous pour vos tresses et découvrez notre boutique de produits capillaires premium.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  email: 'contact@example.com',
  phone: '+33 6 00 00 00 00',
  address: 'À définir',
  socials: {
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    tiktok: 'https://tiktok.com/',
  },
  keywords: [
    'tresses',
    'braids',
    'coiffure afro',
    'tressage',
    'box braids',
    'knotless',
  ],
} as const;

export type SiteConfig = typeof siteConfig;