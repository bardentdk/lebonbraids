export interface PublicNavItem {
    label: string;
    href: string;
}export const publicNavigation: PublicNavItem[] = [
    { label: 'Accueil', href: '/' },
    { label: 'Prestations', href: '/prestations' },
    { label: 'À propos', href: '/a-propos' },
    { label: 'Contact', href: '/contact' },
];