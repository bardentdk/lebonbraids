'use client';

import { useState, useTransition } from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { toggleShop } from '@/lib/actions/settings';

interface ShopToggleProps {
  initialEnabled: boolean;
}

export function ShopToggle({ initialEnabled }: ShopToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setEnabled(newValue);

    startTransition(async () => {
      const res = await toggleShop(newValue);
      if (!res.success) {
        toast.error(res.error || 'Erreur');
        setEnabled(!newValue);
        return;
      }
      toast.success(newValue ? 'Boutique activée 🛍️' : 'Boutique désactivée');
      router.refresh();
    });
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-colors ${
              enabled
                ? 'bg-gradient-primary text-white shadow-soft'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Boutique en ligne</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Active la vente de produits sur ton site. Si désactivée, seules
              les prestations seront proposées.
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-2.5 py-0.5 text-[11px] font-medium text-primary-700">
              <Sparkles className="h-3 w-3" />
              {enabled ? 'Activée' : 'Désactivée'}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <Switch
            checked={enabled}
            disabled={isPending}
            onChange={handleToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
}