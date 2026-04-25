import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Users,
  Sparkles,
  ShoppingBag,
  Package,
  ClipboardList,
  Receipt,
  CreditCard,
  BarChart3,
  Mail,
  Settings,
  Palette,
  Clock,
  Building2,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const adminNavigation: NavGroup[] = [
  {
    label: 'Vue d\'ensemble',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Planning', href: '/admin/planning', icon: CalendarDays },
      { label: 'Statistiques', href: '/admin/statistiques', icon: BarChart3 },
    ],
  },
  {
    label: 'Gestion',
    items: [
      { label: 'Réservations', href: '/admin/reservations', icon: Calendar },
      { label: 'Clients', href: '/admin/clients', icon: Users },
      { label: 'Commandes', href: '/admin/commandes', icon: ClipboardList },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { label: 'Prestations', href: '/admin/prestations', icon: Sparkles },
      { label: 'Produits', href: '/admin/produits', icon: ShoppingBag },
      { label: 'Stocks', href: '/admin/stocks', icon: Package },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Paiements', href: '/admin/paiements', icon: CreditCard },
      { label: 'Factures', href: '/admin/factures', icon: Receipt },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { label: 'Emails', href: '/admin/emails', icon: Mail },
      { label: 'Thème', href: '/admin/parametres/theme', icon: Palette },
      { label: 'Horaires', href: '/admin/parametres/horaires', icon: Clock },
      { label: 'Entreprise', href: '/admin/parametres/entreprise', icon: Building2 },
      { label: 'Paramètres', href: '/admin/parametres', icon: Settings },
    ],
  },
];