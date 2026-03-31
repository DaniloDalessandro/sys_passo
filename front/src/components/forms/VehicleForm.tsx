"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Truck, FileText, Users, Image } from "lucide-react";
import { useConductors } from "@/hooks/useConductors";
import { MultiSelect } from "@/components/ui/multi-select";
import { MultiPhotoUpload } from "@/components/ui/multi-photo-upload";

interface VehicleFormProps {
  open: boolean;
  handleClose: () => void;
  initialData: any | null;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

export default function VehicleForm({
  open,
  handleClose,
  initialData,
  onSubmit,
  isSubmitting = false,
}: VehicleFormProps) {
  const { conductors, fetchConductors, isLoading: loadingConductors, error: conductorsError } = useConductors();

  const [formData, setFormData] = useState<any>({
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
    status: "ativo",
    conductors: [],
  });

  const [photos, setPhotos] = useState<(File | null)[]>([null, null, null, null, null]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      fetchConductors({ pageSize: 1000 });

      if (initialData) {
        setFormData({
          placa: initialData.placa || "",
          marca: initialData.marca || "",
          modelo: initialData.modelo || "",
          ano: initialData.ano || new Date().getFullYear(),
          cor: initialData.cor || "",
          chassi: initialData.chassi || "",
          renavam: initialData.renavam || "",
          categoria: initialData.categoria || "",
          combustivel: initialData.combustivel || "",
          capacidade: initialData.capacidade || "",
          status: initialData.status || "ativo",
          conductors: initialData.conductors?.map((c: any) => c.id.toString()) || [],
        });
      } else {
        setFormData({
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
          status: "ativo",
          conductors: [],
        });
      }
      setPhotos([null, null, null, null, null]);
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    if (id === "ano") {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        setFormData({ ...formData, [id]: numValue });
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

  const handleConductorsChange = (values: string[]) => {
    setFormData({ ...formData, conductors: values });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.placa.trim()) newErrors.placa = "Placa é obrigatória";
    if (!formData.marca.trim()) newErrors.marca = "Marca é obrigatória";
    if (!formData.modelo.trim()) newErrors.modelo = "Modelo é obrigatório";
    if (!formData.ano || formData.ano < 1900 || formData.ano > new Date().getFullYear() + 1) newErrors.ano = "Ano inválido";
    if (!formData.cor.trim()) newErrors.cor = "Cor é obrigatória";
    if (!formData.chassi.trim()) newErrors.chassi = "Chassi é obrigatório";
    if (!formData.renavam.trim()) newErrors.renavam = "RENAVAM é obrigatório";
    if (!formData.categoria.trim()) newErrors.categoria = "Categoria é obrigatória";
    if (!formData.combustivel.trim()) newErrors.combustivel = "Combustível é obrigatório";
    if (!formData.capacidade.trim()) newErrors.capacidade = "Capacidade é obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit({
      ...formData,
      photo_1: photos[0],
      photo_2: photos[1],
      photo_3: photos[2],
      photo_4: photos[3],
      photo_5: photos[4],
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[960px] max-w-[95vw]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-primary">
              {initialData ? "Editar Veículo" : "Novo Veículo"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* Layout 2 colunas principais */}
            <div className="grid grid-cols-2 gap-x-6">
              {/* ── COLUNA ESQUERDA: Informações Básicas ── */}
              <div>
                <div className="mb-3 flex items-center gap-2 border-b border-border pb-1.5">
                  <Truck className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Informações Básicas
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="placa" className="text-xs font-medium">Placa *</Label>
                      <Input id="placa" value={formData.placa} onChange={handleChange} placeholder="ABC-1234" className="h-8 text-sm" />
                      {errors.placa && <span className="text-xs text-destructive">{errors.placa}</span>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="marca" className="text-xs font-medium">Marca *</Label>
                      <Input id="marca" value={formData.marca} onChange={handleChange} placeholder="Mercedes-Benz" className="h-8 text-sm" />
                      {errors.marca && <span className="text-xs text-destructive">{errors.marca}</span>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="modelo" className="text-xs font-medium">Modelo *</Label>
                      <Input id="modelo" value={formData.modelo} onChange={handleChange} placeholder="Sprinter" className="h-8 text-sm" />
                      {errors.modelo && <span className="text-xs text-destructive">{errors.modelo}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="ano" className="text-xs font-medium">Ano *</Label>
                      <Input id="ano" type="number" value={formData.ano} onChange={handleChange} placeholder="2024" className="h-8 text-sm" />
                      {errors.ano && <span className="text-xs text-destructive">{errors.ano}</span>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="cor" className="text-xs font-medium">Cor *</Label>
                      <Input id="cor" value={formData.cor} onChange={handleChange} placeholder="Branco" className="h-8 text-sm" />
                      {errors.cor && <span className="text-xs text-destructive">{errors.cor}</span>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="capacidade" className="text-xs font-medium">Capacidade *</Label>
                      <Input id="capacidade" value={formData.capacidade} onChange={handleChange} placeholder="16 lugares" className="h-8 text-sm" />
                      {errors.capacidade && <span className="text-xs text-destructive">{errors.capacidade}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="grid gap-1.5">
                      <Label className="text-xs font-medium">Categoria *</Label>
                      <Select onValueChange={(v) => handleSelectChange("categoria", v)} value={formData.categoria}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Van">Van</SelectItem>
                          <SelectItem value="Caminhão">Caminhão</SelectItem>
                          <SelectItem value="Ônibus">Ônibus</SelectItem>
                          <SelectItem value="Carreta">Carreta</SelectItem>
                          <SelectItem value="Carro">Carro</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.categoria && <span className="text-xs text-destructive">{errors.categoria}</span>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs font-medium">Combustível *</Label>
                      <Select onValueChange={(v) => handleSelectChange("combustivel", v)} value={formData.combustivel}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Diesel">Diesel</SelectItem>
                          <SelectItem value="Gasolina">Gasolina</SelectItem>
                          <SelectItem value="Etanol">Etanol</SelectItem>
                          <SelectItem value="Flex">Flex</SelectItem>
                          <SelectItem value="GNV">GNV</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.combustivel && <span className="text-xs text-destructive">{errors.combustivel}</span>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs font-medium">Status</Label>
                      <Select onValueChange={(v) => handleSelectChange("status", v)} value={formData.status}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── COLUNA DIREITA: Documentação + Condutores ── */}
              <div className="space-y-4">
                {/* Documentação */}
                <div>
                  <div className="mb-3 flex items-center gap-2 border-b border-border pb-1.5">
                    <FileText className="h-3.5 w-3.5 text-warning" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Documentação
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="chassi" className="text-xs font-medium">Chassi *</Label>
                      <Input id="chassi" value={formData.chassi} onChange={handleChange} placeholder="9BW123456789ABC01" className="h-8 text-sm" />
                      {errors.chassi && <span className="text-xs text-destructive">{errors.chassi}</span>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="renavam" className="text-xs font-medium">RENAVAM *</Label>
                      <Input id="renavam" value={formData.renavam} onChange={handleChange} placeholder="12345678901" className="h-8 text-sm" />
                      {errors.renavam && <span className="text-xs text-destructive">{errors.renavam}</span>}
                    </div>
                  </div>
                </div>

                {/* Condutores */}
                <div>
                  <div className="mb-3 flex items-center gap-2 border-b border-border pb-1.5">
                    <Users className="h-3.5 w-3.5 text-success" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Condutores Autorizados
                    </span>
                  </div>
                  {loadingConductors ? (
                    <div className="flex items-center gap-2 rounded border border-border p-2 text-sm text-muted-foreground">
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                      Carregando condutores...
                    </div>
                  ) : conductorsError ? (
                    <div className="rounded border border-destructive/30 bg-destructive/8 p-2 text-sm text-destructive">
                      Erro ao carregar condutores: {conductorsError}
                    </div>
                  ) : conductors.length === 0 ? (
                    <div className="rounded border border-border p-2 text-sm text-muted-foreground">
                      Nenhum condutor cadastrado
                    </div>
                  ) : (
                    <>
                      <MultiSelect
                        options={conductors.map((c) => ({
                          label: `${c.name} - ${c.cpf}`,
                          value: c.id.toString(),
                        }))}
                        selected={formData.conductors}
                        onChange={handleConductorsChange}
                        placeholder="Selecione os condutores autorizados"
                      />
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {conductors.length} condutor(es) disponível(is)
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Fotos — linha completa */}
            <div>
              <div className="mb-3 flex items-center gap-2 border-b border-border pb-1.5">
                <Image className="h-3.5 w-3.5 text-info" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Fotos do Veículo
                </span>
              </div>
              <MultiPhotoUpload
                photos={photos}
                onChange={setPhotos}
                maxPhotos={5}
                label=""
              />
            </div>
          </div>

          <DialogFooter className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  {initialData ? "Salvando..." : "Criando..."}
                </>
              ) : (
                initialData ? "Salvar alterações" : "Cadastrar veículo"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
