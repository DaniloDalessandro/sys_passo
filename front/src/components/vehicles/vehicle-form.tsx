"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiPhotoUpload } from "@/components/ui/multi-photo-upload";

interface VehicleFormProps {
  onSubmit: (data: Record<string, unknown>) => void;
  showPhotoPreview?: boolean;
  submitButtonText?: string;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-0.5 h-4 bg-blue-500 rounded-full" />
      <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-600">
        {children}
      </h3>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function VehicleForm({
  onSubmit,
  submitButtonText = "Enviar Solicitação",
}: VehicleFormProps) {
  const [formData, setFormData] = useState({
    placa: "",
    marca: "",
    modelo: "",
    ano: new Date().getFullYear(),
    cor: "",
    chassi: "",
    renavam: "",
    categoria: "",
    combustivel: "",
    capacidade: "",
  });

  const [photos, setPhotos] = useState<(File | null)[]>([null, null, null, null, null]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    if (id === "ano") {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        setFormData({ ...formData, ano: numValue });
      }
      return;
    }

    setFormData({ ...formData, [id]: value });
    if (errors[id]) setErrors({ ...errors, [id]: "" });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const currentYear = new Date().getFullYear();

    if (!formData.placa.trim()) newErrors.placa = "Placa é obrigatória";
    if (!formData.marca.trim()) newErrors.marca = "Marca é obrigatória";
    if (!formData.modelo.trim()) newErrors.modelo = "Modelo é obrigatório";
    if (!formData.ano || formData.ano < 1900 || formData.ano > currentYear + 1)
      newErrors.ano = "Ano inválido";
    if (!formData.cor.trim()) newErrors.cor = "Cor é obrigatória";
    if (!formData.chassi.trim()) newErrors.chassi = "Chassi é obrigatório";
    if (!formData.renavam.trim()) newErrors.renavam = "RENAVAM é obrigatório";
    if (!formData.categoria) newErrors.categoria = "Categoria é obrigatória";
    if (!formData.combustivel) newErrors.combustivel = "Combustível é obrigatório";
    if (!formData.capacidade.trim()) newErrors.capacidade = "Capacidade é obrigatória";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        photo_1: photos[0],
        photo_2: photos[1],
        photo_3: photos[2],
        photo_4: photos[3],
        photo_5: photos[4],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Informações Básicas ── */}
      <div>
        <SectionHeader>Informações Básicas</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <Field label="Placa" error={errors.placa}>
              <Input id="placa" value={formData.placa} onChange={handleChange} placeholder="ABC-1234" />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Marca" error={errors.marca}>
              <Input id="marca" value={formData.marca} onChange={handleChange} placeholder="Mercedes-Benz" />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Modelo" error={errors.modelo}>
              <Input id="modelo" value={formData.modelo} onChange={handleChange} placeholder="Sprinter" />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Ano" error={errors.ano}>
              <Input id="ano" type="number" value={formData.ano} onChange={handleChange} placeholder="2024" />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Cor" error={errors.cor}>
              <Input id="cor" value={formData.cor} onChange={handleChange} placeholder="Branco" />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Capacidade" error={errors.capacidade}>
              <Input id="capacidade" value={formData.capacidade} onChange={handleChange} placeholder="16 lugares" />
            </Field>
          </div>
        </div>
      </div>

      {/* ── Classificação ── */}
      <div className="pt-2 border-t border-gray-100">
        <SectionHeader>Classificação</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-3">
            <Field label="Categoria" error={errors.categoria}>
              <Select onValueChange={(v) => handleSelectChange("categoria", v)} value={formData.categoria}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Van">Van</SelectItem>
                  <SelectItem value="Caminhão">Caminhão</SelectItem>
                  <SelectItem value="Ônibus">Ônibus</SelectItem>
                  <SelectItem value="Carreta">Carreta</SelectItem>
                  <SelectItem value="Carro">Carro</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="md:col-span-3">
            <Field label="Combustível" error={errors.combustivel}>
              <Select onValueChange={(v) => handleSelectChange("combustivel", v)} value={formData.combustivel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o combustível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Gasolina">Gasolina</SelectItem>
                  <SelectItem value="Etanol">Etanol</SelectItem>
                  <SelectItem value="Flex">Flex</SelectItem>
                  <SelectItem value="GNV">GNV</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
      </div>

      {/* ── Documentação ── */}
      <div className="pt-2 border-t border-gray-100">
        <SectionHeader>Documentação</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-3">
            <Field label="Chassi" error={errors.chassi}>
              <Input id="chassi" value={formData.chassi} onChange={handleChange} placeholder="9BW123456789ABC01" />
            </Field>
          </div>
          <div className="md:col-span-3">
            <Field label="RENAVAM" error={errors.renavam}>
              <Input id="renavam" value={formData.renavam} onChange={handleChange} placeholder="12345678901" />
            </Field>
          </div>
        </div>
      </div>

      {/* ── Fotos ── */}
      <div className="pt-2 border-t border-gray-100">
        <SectionHeader>Fotos do Veículo</SectionHeader>
        <MultiPhotoUpload photos={photos} onChange={setPhotos} maxPhotos={5} label="" />
      </div>

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Enviando...
            </>
          ) : (
            submitButtonText
          )}
        </Button>
      </div>
    </form>
  );
}
