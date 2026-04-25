'use client';

import { Sparkles, Calendar, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function ThemePreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-muted/30 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Aperçu en direct
        </div>
        <div className="flex gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-danger/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
        </div>
      </div>

      <div className="space-y-4 rounded-xl bg-background p-6 shadow-soft">
        {/* Hero mock */}
        <div className="rounded-xl bg-gradient-primary p-6 text-white">
          <Badge className="border-white/30 bg-white/10 text-white" variant="outline">
            <Sparkles className="h-3 w-3" /> Nouveau
          </Badge>
          <h3 className="mt-3 text-2xl font-bold">Titre spectaculaire</h3>
          <p className="mt-1 text-sm text-white/80">
            Un aperçu de votre thème appliqué en temps réel sur l'interface.
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              className="bg-white text-primary-700 hover:bg-white/90"
              shine={false}
            >
              Action principale
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              En savoir plus
            </Button>
          </div>
        </div>

        {/* Cards mock */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="mt-3 text-sm font-semibold">Réservations</div>
            <div className="text-xs text-muted-foreground">12 ce mois-ci</div>
          </Card>
          <Card className="p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div className="mt-3 text-sm font-semibold">Commandes</div>
            <div className="text-xs text-muted-foreground">+3 aujourd'hui</div>
          </Card>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
            Primary
          </Button>
          <Button size="sm" variant="outline">
            Outline
          </Button>
          <Button size="sm" variant="ghost">
            Ghost
          </Button>
          <Badge variant="primary">
            <Heart className="h-3 w-3" /> Favori
          </Badge>
          <Badge variant="success">Actif</Badge>
          <Badge variant="warning">En attente</Badge>
        </div>
      </div>
    </div>
  );
}