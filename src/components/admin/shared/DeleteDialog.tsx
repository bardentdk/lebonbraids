'use client';

import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  loading?: boolean;
}

export function DeleteDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmer la suppression',
  description = 'Cette action est irréversible.',
  confirmText = 'Supprimer',
  loading,
}: DeleteDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-danger/10 text-danger">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Modal>
  );
}