'use client';

import { Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatTime, formatTimeRange } from '@/lib/booking/format';
import { BOOKING_STATUS_CONFIG, type BookingStatus } from './BookingStatusBadge';

interface Props {
  booking: {
    id: string;
    client_first_name: string;
    client_last_name: string;
    start_at: string;
    end_at: string;
    status: BookingStatus;
    services?: Array<{ service_name: string }>;
  };
  variant?: 'compact' | 'full' | 'absolute';
  style?: React.CSSProperties;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

export function BookingCard({
  booking,
  variant = 'compact',
  style,
  onClick,
  draggable,
  onDragStart,
}: Props) {
  const config = BOOKING_STATUS_CONFIG[booking.status];
  const services = booking.services?.map((s) => s.service_name).join(', ') || '';

  if (variant === 'absolute') {
    return (
      <button
        type="button"
        onClick={onClick}
        draggable={draggable}
        onDragStart={onDragStart}
        style={style}
        className={cn(
          'group absolute left-1 right-1 z-10 flex flex-col items-stretch overflow-hidden rounded-lg border-l-4 bg-background p-2 text-left shadow-soft transition-all',
          'hover:z-20 hover:shadow-premium hover:scale-[1.02]',
          booking.status === 'pending' && 'border-warning bg-warning/5',
          booking.status === 'confirmed' && 'border-primary-500 bg-primary-50',
          booking.status === 'in_progress' && 'border-accent bg-accent/10',
          booking.status === 'completed' && 'border-success bg-success/5',
          booking.status === 'cancelled' && 'border-danger bg-danger/5 opacity-60 line-through',
          booking.status === 'no_show' && 'border-muted-foreground bg-muted opacity-50'
        )}
      >
        <div className="flex items-center gap-1.5 text-[10px] font-medium tabular-nums text-muted-foreground">
          <Clock className="h-2.5 w-2.5" />
          {formatTimeRange(booking.start_at, booking.end_at)}
        </div>
        <div className="truncate text-xs font-semibold leading-tight">
          {booking.client_first_name} {booking.client_last_name}
        </div>
        {services && (
          <div className="truncate text-[10px] text-muted-foreground leading-tight">
            {services}
          </div>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-stretch gap-3 rounded-xl border border-border bg-background p-3 text-left transition-all',
        'hover:border-primary-300 hover:shadow-soft'
      )}
    >
      <div className={cn('w-1.5 flex-shrink-0 rounded-full', config.dotClass)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {formatTime(booking.start_at)}
          </span>
        </div>
        <div className="truncate text-sm font-semibold">
          {booking.client_first_name} {booking.client_last_name}
        </div>
        {services && (
          <div className="truncate text-xs text-muted-foreground">{services}</div>
        )}
      </div>
    </button>
  );
}