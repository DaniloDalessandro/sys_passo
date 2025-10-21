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

  // Debug: log conductors when they change
  useEffect(() => {
    console.log('Condutores carregados:', conductors);
  }, [conductors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let formattedValue = value;

    if (id === "ano") {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        formattedValue = numValue.toString();
        setFormData({ ...formData, [id]: numValue });
      }
      return;
    }

    setFormData({ ...formData, [id]: formattedValue });

    if (errors[id]) {
      setErrors({ ...errors, [id]: "" });
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });

    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleConductorsChange = (values: string[]) => {
    setFormData({ ...formData, conductors: values });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.placa.trim()) {
      newErrors.placa = "Placa é obrigatória";
    }

    if (!formData.marca.trim()) {
      newErrors.marca = "Marca é obrigatória";
    }

    if (!formData.modelo.trim()) {
      newErrors.modelo = "Modelo é obrigatório";
    }

    if (!formData.ano || formData.ano < 1900 || formData.ano > new Date().getFullYear() + 1) {
      newErrors.ano = "Ano inválido";
    }

    if (!formData.cor.trim()) {
      newErrors.cor = "Cor é obrigatória";
    }

    if (!formData.chassi.trim()) {
      newErrors.chassi = "Chassi é obrigatório";
    }

    if (!formData.renavam.trim()) {
      newErrors.renavam = "RENAVAM é obrigatório";
    }

    if (!formData.categoria.trim()) {
      newErrors.categoria = "Categoria é obrigatória";
    }

    if (!formData.combustivel.trim()) {
      newErrors.combustivel = "Combustível é obrigatório";
    }

    if (!formData.capacidade.trim()) {
      newErrors.capacidade = "Capacidade é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      photo_1: photos[0],
      photo_2: photos[1],
      photo_3: photos[2],
      photo_4: photos[3],
      photo_5: photos[4],
    };

    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-primary">
              {initialData ? "Editar Veículo" : "Novo Veículo"}
            </DialogTitle>
            <hr className="mt-2 border-b border-gray-200" />
          </DialogHeader>

          <div className="grid gap-6 py-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-700 border-b pb-2">Informações Básicas</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="placa">Placa *</Label>
                  <Input
                    id="placa"
                    value={formData.placa}
                    onChange={handleChange}
                    placeholder="ABC-1234"
                  />
                  {errors.placa && <span className="text-sm text-red-500">{errors.placa}</span>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="marca">Marca *</Label>
                  <Input
                    id="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    placeholder="Mercedes-Benz"
                  />
                  {errors.marca && <span className="text-sm text-red-500">{errors.marca}</span>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="modelo">Modelo *</Label>
                  <Input
                    id="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    placeholder="Sprinter"
                  />
                  {errors.modelo && <span className="text-sm text-red-500">{errors.modelo}</span>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ano">Ano *</Label>
                  <Input
                    id="ano"
                    type="number"
                    value={formData.ano}
                    onChange={handleChange}
                    placeholder="2024"
                  />
                  {errors.ano && <span className="text-sm text-red-500">{errors.ano}</span>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cor">Cor *</Label>
                  <Input
                    id="cor"
                    value={formData.cor}
                    onChange={handleChange}
                    placeholder="Branco"
                  />
                  {errors.cor && <span className="text-sm text-red-500">{errors.cor}</span>}
                </div>

                <div className="grid gap-2">
                  <Label>Categoria *</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("categoria", value)}
                    value={formData.categoria}
                  >
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
                  {errors.categoria && <span className="text-sm text-red-500">{errors.categoria}</span>}
                </div>

                <div className="grid gap-2">
                  <Label>Combustível *</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("combustivel", value)}
                    value={formData.combustivel}
                  >
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
                  {errors.combustivel && <span className="text-sm text-red-500">{errors.combustivel}</span>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="capacidade">Capacidade *</Label>
                  <Input
                    id="capacidade"
                    value={formData.capacidade}
                    onChange={handleChange}
                    placeholder="16 lugares"
                  />
                  {errors.capacidade && <span className="text-sm text-red-500">{errors.capacidade}</span>}
                </div>

                <div className="grid gap-2">
                  <Label>Status *</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("status", value)}
                    value={formData.status}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Documentação */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-700 border-b pb-2">Documentação</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="chassi">Chassi *</Label>
                  <Input
                    id="chassi"
                    value={formData.chassi}
                    onChange={handleChange}
                    placeholder="9BW123456789ABC01"
                  />
                  {errors.chassi && <span className="text-sm text-red-500">{errors.chassi}</span>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="renavam">RENAVAM *</Label>
                  <Input
                    id="renavam"
                    value={formData.renavam}
                    onChange={handleChange}
                    placeholder="12345678901"
                  />
                  {errors.renavam && <span className="text-sm text-red-500">{errors.renavam}</span>}
                </div>
              </div>
            </div>

            {/* Condutores */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-700 border-b pb-2">Condutores Autorizados</h3>

              <div className="grid gap-2">
                <Label>Condutores</Label>
                {loadingConductors ? (
                  <div className="text-sm text-gray-500 p-2 border rounded flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Carregando condutores...
                  </div>
                ) : conductorsError ? (
                  <div className="text-sm text-red-500 p-2 border border-red-200 rounded bg-red-50">
                    Erro ao carregar condutores: {conductorsError}
                  </div>
                ) : conductors.length === 0 ? (
                  <div className="text-sm text-gray-500 p-2 border rounded">
                    Nenhum condutor cadastrado
                  </div>
                ) : (
                  <MultiSelect
                    options={conductors.map((c) => ({
                      label: `${c.name} - ${c.cpf}`,
                      value: c.id.toString(),
                    }))}
                    selected={formData.conductors}
                    onChange={handleConductorsChange}
                    placeholder="Selecione os condutores autorizados"
                  />
                )}
                {!loadingConductors && !conductorsError && (
                  <p className="text-xs text-gray-500">
                    {conductors.length} condutor(es) disponível(is)
                  </p>
                )}
              </div>
            </div>

            {/* Fotos */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-700 border-b pb-2">Fotos do Veículo</h3>
              <MultiPhotoUpload
                photos={photos}
                onChange={setPhotos}
                maxPhotos={5}
                label=""
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {initialData ? "Salvando..." : "Criando..."}
                </>
              ) : (
                initialData ? "Salvar Alterações" : "Criar Veículo"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}