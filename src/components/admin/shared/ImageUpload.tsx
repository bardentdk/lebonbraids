'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  bucket: string;
  folder?: string;
  label?: string;
  description?: string;
  maxSize?: number; // en Mo
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  bucket,
  folder = '',
  label,
  description,
  maxSize = 5,
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`Image trop volumineuse (max ${maxSize}Mo)`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Seules les images sont autorisées');
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', bucket);
        formData.append('folder', folder);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Échec du téléversement');
        }

        const { url } = await res.json();
        onChange(url);
        toast.success('Image téléversée');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erreur');
      } finally {
        setUploading(false);
      }
    },
    [bucket, folder, maxSize, onChange]
  );

  const handleRemove = async () => {
    onChange(null);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onInputChange}
      />

      {value ? (
        <div className="group relative overflow-hidden rounded-2xl border border-border bg-muted">
          <div className="relative aspect-video w-full">
            <Image
              src={value}
              alt="Preview"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-primary-950/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-foreground shadow-soft transition-all hover:scale-105"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Changer
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-2 rounded-xl bg-danger px-4 py-2 text-sm font-medium text-white shadow-soft transition-all hover:scale-105"
            >
              <X className="h-4 w-4" />
              Retirer
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          disabled={uploading}
          className={cn(
            'group relative flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-muted/30 transition-all',
            'hover:border-primary-400 hover:bg-primary-50/30',
            dragOver && 'border-primary-500 bg-primary-50/50 scale-[1.01]',
            !dragOver && 'border-border',
            uploading && 'cursor-not-allowed opacity-50'
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              <span className="text-sm text-muted-foreground">Téléversement…</span>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 transition-transform group-hover:scale-110">
                <Upload className="h-5 w-5" />
              </div>
              <div className="space-y-0.5 text-center">
                <div className="text-sm font-medium">
                  Cliquer ou glisser une image
                </div>
                <div className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP — max {maxSize}Mo
                </div>
              </div>
            </>
          )}
        </button>
      )}

      {description && !value && (
        <p className="mt-1.5 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}