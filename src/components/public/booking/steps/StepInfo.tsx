'use client';

import { Mail, Phone, User } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  marketingConsent: boolean;
  termsAccepted: boolean;
}

interface Props {
  info: ContactInfo;
  errors: Partial<Record<keyof ContactInfo, string>>;
  onChange: (data: Partial<ContactInfo>) => void;
}

export function StepInfo({ info, errors, onChange }: Props) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Tes coordonnées</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Pour qu'on puisse te confirmer ton rendez-vous.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Prénom"
            leftIcon={<User className="h-4 w-4" />}
            value={info.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            error={errors.firstName}
            autoComplete="given-name"
          />
          <Input
            label="Nom"
            value={info.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            error={errors.lastName}
            autoComplete="family-name"
          />
        </div>
        <Input
          label="Adresse email"
          type="email"
          leftIcon={<Mail className="h-4 w-4" />}
          value={info.email}
          onChange={(e) => onChange({ email: e.target.value })}
          error={errors.email}
          autoComplete="email"
        />
        <Input
          label="Téléphone"
          type="tel"
          leftIcon={<Phone className="h-4 w-4" />}
          value={info.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          error={errors.phone}
          autoComplete="tel"
        />
        <Textarea
          label="Notes (facultatif)"
          rows={3}
          placeholder="Longueur souhaitée, préférences, allergies..."
          value={info.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
        />

        <div className="space-y-3 pt-2">
          <Checkbox
            checked={info.termsAccepted}
            onChange={(e) => onChange({ termsAccepted: e.target.checked })}
            error={errors.termsAccepted}
            label={
              <>
                J'accepte les conditions de réservation et la politique
                d'annulation
              </>
            }
          />
          <Checkbox
            checked={info.marketingConsent}
            onChange={(e) => onChange({ marketingConsent: e.target.checked })}
            label="Je souhaite recevoir les offres et nouveautés par email"
          />
        </div>
      </div>
    </div>
  );
}