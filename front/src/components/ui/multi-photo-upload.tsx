"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface PhotoFile {
  file: File;
  preview: string;
  index: number;
}

interface MultiPhotoUploadProps {
  photos: (File | null)[];
  onChange: (photos: (File | null)[]) => void;
  maxPhotos?: number;
  label?: string;
}

export function MultiPhotoUpload({
  photos,
  onChange,
  maxPhotos = 5,
  label = "Fotos do Veículo",
}: MultiPhotoUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPhotos = [...photos];
    const newPreviews = [...previews];

    files.forEach((file) => {
      const emptyIndex = newPhotos.findIndex((p) => p === null);
      if (emptyIndex !== -1 && emptyIndex < maxPhotos) {
        newPhotos[emptyIndex] = file;
        newPreviews[emptyIndex] = URL.createObjectURL(file);
      } else if (newPhotos.length < maxPhotos) {
        newPhotos.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });

    while (newPhotos.length < maxPhotos) {
      newPhotos.push(null);
      newPreviews.push("");
    }

    onChange(newPhotos.slice(0, maxPhotos));
    setPreviews(newPreviews.slice(0, maxPhotos));
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    const newPreviews = [...previews];

    if (newPreviews[index]) {
      URL.revokeObjectURL(newPreviews[index]);
    }

    newPhotos[index] = null;
    newPreviews[index] = "";

    onChange(newPhotos);
    setPreviews(newPreviews);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={triggerFileInput}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Adicionar Fotos
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: maxPhotos }).map((_, index) => (
          <div
            key={index}
            className="relative aspect-square overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/40 transition-colors hover:bg-muted/70"
          >
            {photos[index] && previews[index] ? (
              <>
                <img
                  src={previews[index]}
                  alt={`Foto ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground transition-colors hover:bg-destructive/90"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-center text-xs text-white">
                  Foto {index + 1}
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={triggerFileInput}
                className="flex h-full w-full flex-col items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <ImageIcon className="mb-1.5 h-6 w-6" />
                <span className="text-xs">Foto {index + 1}</span>
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {photos.filter((p) => p !== null).length} de {maxPhotos} fotos adicionadas
      </p>
    </div>
  );
}
