'use client'; import { useTransition, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Plus,
    Minus,
    RefreshCcw,
    Trash2,
    Package,
    ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation'; import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils/cn';
import {
    stockAdjustmentSchema,
    type StockAdjustmentInput,
} from '@/lib/validators/stock';
import { adjustStock } from '@/lib/actions/stocks'; interface Props {
    open: boolean;
    onClose: () => void;
    product: {
        id: string;
        name: string;
        stock_quantity: number;
    } | null;
}const TYPES = [
    {
        value: 'in' as const,
        label: 'Entrée',
        description: 'Réception de stock',
        icon: Plus,
        className: 'border-success/30 bg-success/5 hover:bg-success/10 text-success',
        activeClass: 'border-success bg-success/15',
    },
    {
        value: 'out' as const,
        label: 'Sortie',
        description: 'Vente manuelle',
        icon: Minus,
        className: 'border-warning/30 bg-warning/5 hover:bg-warning/10 text-warning',
        activeClass: 'border-warning bg-warning/15',
    },
    {
        value: 'adjustment' as const,
        label: 'Ajustement',
        description: 'Correction inventaire',
        icon: RefreshCcw,
        className: 'border-primary-200 bg-primary-50 hover:bg-primary-100 text-primary-700',
        activeClass: 'border-primary-500 bg-primary-100',
    },
    {
        value: 'loss' as const,
        label: 'Perte',
        description: 'Casse, vol, péremption',
        icon: Trash2,
        className: 'border-danger/30 bg-danger/5 hover:bg-danger/10 text-danger',
        activeClass: 'border-danger bg-danger/15',
    },
]; export function StockAdjustmentModal({ open, onClose, product }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [type, setType] = useState<StockAdjustmentInput['type']>('in'); const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<StockAdjustmentInput>({
        resolver: zodResolver(stockAdjustmentSchema),
        defaultValues: {
            product_id: product?.id || '',
            type: 'in',
            quantity: 1,
            reason: '',
        },
        values: product
            ? { product_id: product.id, type, quantity: 1, reason: '' }
            : undefined,
    }); const quantity = Number(watch('quantity') || 0);
    let preview = product?.stock_quantity || 0;
    if (product) {
        if (type === 'in') preview = product.stock_quantity + Math.abs(quantity);
        else if (type === 'out' || type === 'loss')
            preview = product.stock_quantity - Math.abs(quantity);
        else if (type === 'adjustment') preview = quantity;
    } const onSubmit = (data: StockAdjustmentInput) => {
        startTransition(async () => {
            const res = await adjustStock({ ...data, type });
            if (!res.success) return toast.error(res.error || 'Erreur');
            toast.success('Stock ajusté');
            reset();
            onClose();
            router.refresh();
        });
    }; if (!product) return null; return (
        <Modal
            open={open}
            onClose={onClose}
            title={Ajuster le stock — ${product.name}}
size = "md"
footer = {
<>
<Button variant="outline" onClick={onClose} disabled={isPending}>
Annuler
</Button>
<Button onClick={handleSubmit(onSubmit)} loading={isPending}>
Confirmer
</Button>
</>
}
>
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {/* Type d'opération */}
        <div>
            <label className="mb-2 block text-sm font-medium">Type d'opération</label>
            <div className="grid grid-cols-2 gap-2">
                {TYPES.map((t) => {
                    const Icon = t.icon;
                    const active = type === t.value;
                    return (
                        <button
                            key={t.value}
                            type="button"
                            onClick={() => setType(t.value)}
                            className={cn(
                                'flex items-start gap-3 rounded-xl border p-3 text-left transition-all',
                                t.className,
                                active && t.activeClass
                            )}
                        >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold">{t.label}</div>
                                <div className="text-[11px] opacity-80">{t.description}</div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
        <Input
      type="number"
      label={
        type === 'adjustment'
          ? 'Nouveau stock total'
          : 'Quantité'
      }
      hint={
        type === 'adjustment'
          ? "La quantité fournie remplacera le stock actuel"
          : undefined
      }
      {...register('quantity')}
      error={errors.quantity?.message}
    />
    {/* Preview */}
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-primary-600">
        <Package className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Stock après opération
        </div>
        <div className="mt-1 flex items-center gap-2 text-base font-semibold tabular-nums">
          <span className="text-muted-foreground">{product.stock_quantity}</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span
            className={cn(
              preview < 0
                ? 'text-danger'
                : preview === 0
                ? 'text-warning'
                : 'text-success'
            )}
          >
            {preview}
          </span>
        </div>
      </div>
    </div>
    <Textarea
      label="Raison"
      rows={2}
      placeholder="Ex: Réception fournisseur, vente boutique..."
      {...register('reason')}
      error={errors.reason?.message}
    />
  </form>
</Modal>
    );
}
