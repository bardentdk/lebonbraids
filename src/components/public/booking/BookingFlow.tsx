'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { BookingProgress } from './BookingProgress';
import { BookingSummary } from './BookingSummary';
import { StepServices } from './steps/StepServices';
import { StepDateTime } from './steps/StepDateTime';
import { StepInfo, type ContactInfo } from './steps/StepInfo';
import { StepConfirm } from './steps/StepConfirm';

const STEPS = [
  { id: 1, label: 'Prestations' },
  { id: 2, label: 'Date & heure' },
  { id: 3, label: 'Coordonnées' },
  { id: 4, label: 'Confirmation' },
];

interface Service {
  id: string;
  name: string;
  short_description: string | null;
  price: number;
  duration_minutes: number;
  cover_image_url: string | null;
  category?: { name: string } | null;
}

export function BookingFlow({ services }: { services: Service[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get('service');

  const [step, setStep] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    preselectedId ? [preselectedId] : []
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [info, setInfo] = useState<ContactInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    marketingConsent: false,
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactInfo, string>>>({});
  const [isPending, startTransition] = useTransition();

  const selectedServices = useMemo(
    () => services.filter((s) => selectedIds.includes(s.id)),
    [services, selectedIds]
  );

  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + s.duration_minutes,
    0
  );

  const canGoNext = (() => {
    if (step === 1) return selectedIds.length > 0;
    if (step === 2) return !!selectedSlot;
    if (step === 3) {
      return (
        info.firstName.length >= 2 &&
        info.lastName.length >= 2 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email) &&
        info.phone.length >= 8 &&
        info.termsAccepted
      );
    }
    return true;
  })();

  const handleNext = () => {
    if (step === 3) {
      const newErrors: typeof errors = {};
      if (info.firstName.length < 2) newErrors.firstName = 'Prénom trop court';
      if (info.lastName.length < 2) newErrors.lastName = 'Nom trop court';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email))
        newErrors.email = 'Email invalide';
      if (info.phone.length < 8) newErrors.phone = 'Téléphone invalide';
      if (!info.termsAccepted)
        newErrors.termsAccepted = 'Tu dois accepter les conditions';
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleConfirm = () => {
    if (!selectedSlot) return;
    startTransition(async () => {
      try {
        const res = await fetch('/api/public/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_ids: selectedIds,
            start_at: selectedSlot.toISOString(),
            client_first_name: info.firstName,
            client_last_name: info.lastName,
            client_email: info.email,
            client_phone: info.phone,
            notes: info.notes,
            marketing_consent: info.marketingConsent,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || 'Erreur lors de la réservation');
          return;
        }
        toast.success('Réservation confirmée ✨');
        router.push(`/confirmation/${data.reference}`);
      } catch (err) {
        toast.error('Erreur de connexion');
      }
    });
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <BookingProgress steps={STEPS} current={step} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <StepServices
                services={services}
                selectedIds={selectedIds}
                onToggle={(id) =>
                  setSelectedIds((prev) =>
                    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                  )
                }
              />
            )}
            {step === 2 && (
              <StepDateTime
                totalDuration={totalDuration}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onSelectDate={(d) => {
                  setSelectedDate(d);
                  setSelectedSlot(null);
                }}
                onSelectSlot={setSelectedSlot}
              />
            )}
            {step === 3 && (
              <StepInfo
                info={info}
                errors={errors}
                onChange={(data) => {
                  setInfo((prev) => ({ ...prev, ...data }));
                  setErrors({});
                }}
              />
            )}
            {step === 4 && selectedSlot && (
              <StepConfirm
                services={selectedServices}
                selectedSlot={selectedSlot}
                info={info}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Boutons navigation */}
        <div className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            disabled={step === 1 || isPending}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Précédent
          </Button>

          {step < 4 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Continuer
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleConfirm}
              loading={isPending}
              leftIcon={!isPending ? <Check className="h-4 w-4" /> : undefined}
              size="lg"
            >
              Confirmer la réservation
            </Button>
          )}
        </div>
      </div>

      {/* Récapitulatif */}
      <div className="hidden lg:block">
        <BookingSummary
          selectedServices={selectedServices}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
        />
      </div>
    </div>
  );
}