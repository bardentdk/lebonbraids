import { cn } from '@/lib/utils/cn';
import {
  Clock,
  CheckCircle2,
  PlayCircle,
  CheckCheck,
  XCircle,
  UserX,
  type LucideIcon,
} from 'lucide-react';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

interface Config {
  label: string;
  icon: LucideIcon;
  className: string;
  dotClass: string;
}

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, Config> = {
  pending: {
    label: 'En attente',
    icon: Clock,
    className: 'bg-warning/10 text-warning',
    dotClass: 'bg-warning',
  },
  confirmed: {
    label: 'Confirmé',
    icon: CheckCircle2,
    className: 'bg-primary-100 text-primary-700',
    dotClass: 'bg-primary-500',
  },
  in_progress: {
    label: 'En cours',
    icon: PlayCircle,
    className: 'bg-accent/10 text-accent',
    dotClass: 'bg-accent',
  },
  completed: {
    label: 'Terminé',
    icon: CheckCheck,
    className: 'bg-success/10 text-success',
    dotClass: 'bg-success',
  },
  cancelled: {
    label: 'Annulé',
    icon: XCircle,
    className: 'bg-danger/10 text-danger',
    dotClass: 'bg-danger',
  },
  no_show: {
    label: 'Absent',
    icon: UserX,
    className: 'bg-muted text-muted-foreground',
    dotClass: 'bg-muted-foreground',
  },
};

interface BookingStatusBadgeProps {
  status: BookingStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export function BookingStatusBadge({
  status,
  size = 'md',
  className,
}: BookingStatusBadgeProps) {
  const config = BOOKING_STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        config.className,
        className
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {config.label}
    </span>
  );
}