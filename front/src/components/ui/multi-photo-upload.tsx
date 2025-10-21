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
      // Encontra o primeiro slot vazio
      const emptyIndex = newPhotos.findIndex((p) => p === null);
      if (emptyIndex !== -1 && emptyIndex < maxPhotos) {
        newPhotos[emptyIndex] = file;
        newPreviews[emptyIndex] = URL.createObjectURL(file);
      } else if (newPhotos.length < maxPhotos) {
        newPhotos.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });

    // Preenche com nulls até maxPhotos
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: maxPhotos }).map((_, index) => (
          <div
            key={index}
            className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            {photos[index] && previews[index] ? (
              <>
                <img
                  src={previews[index]}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2 text-center">
                  Foto {index + 1}
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={triggerFileInput}
                className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <ImageIcon className="h-8 w-8 mb-2" />
                <span className="text-xs">Foto {index + 1}</span>
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        {photos.filter((p) => p !== null).length} de {maxPhotos} fotos adicionadas
      </p>
    </div>
  );
}
