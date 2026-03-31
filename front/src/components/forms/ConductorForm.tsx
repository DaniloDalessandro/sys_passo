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
import { User, CreditCard, FileText, Phone, MapPin, Camera, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useDuplicateWarnings } from "@/hooks/useDuplicateWarnings";
import { DuplicateWarningInline } from "@/components/ui/duplicate-warning";
import { LICENSE_CATEGORIES } from "@/constants/license-categories";

interface ConductorFormProps {
  open: boolean;
  handleClose: () => void;
  initialData: any | null;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

const formatCPF = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
};

const validateCPF = (cpf: string) => {
  const numbers = cpf.replace(/\D/g, "");
  if (numbers.length !== 11 || /^(\d)\1+$/.test(numbers)) return false;
  let sum = 0;
  let remainder;
  for (let i = 1; i <= 9; i++) sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(numbers.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(numbers.substring(10, 11));
};

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const isValidAge = (birthDate: Date): boolean => calculateAge(birthDate) >= 18;

export default function ConductorForm({
  open,
  handleClose,
  initialData,
  onSubmit,
  isSubmitting = false,
}: ConductorFormProps) {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [cnhFile, setCnhFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isAgeValid, setIsAgeValid] = useState<boolean>(true);

  const { warnings, checkDuplicate, clearAllWarnings } = useDuplicateWarnings(initialData?.id);

  useEffect(() => {
    if (open) {
      const data = initialData || {};
      setFormData({
        name: data.name || "",
        cpf: data.cpf || "",
        email: data.email || "",
        phone: data.phone || "",
        license_number: data.license_number || "",
        license_category: data.license_category || "B",
        birth_date: data.birth_date ? new Date(data.birth_date) : null,
        gender: data.gender || "M",
        nationality: data.nationality || "Brasileira",
        street: data.street || "",
        number: data.number || "",
        neighborhood: data.neighborhood || "",
        city: data.city || "",
        reference_point: data.reference_point || "",
        whatsapp: data.whatsapp || "",
        license_expiry_date: data.license_expiry_date ? new Date(data.license_expiry_date) : null,
        is_active: data.is_active ?? true,
        photo: data.photo || null,
      });
      setErrors({});
      setDocumentFile(null);
      setCnhFile(null);
      setPhotoFile(null);
      clearAllWarnings();
      setIsAgeValid(data.birth_date ? isValidAge(new Date(data.birth_date)) : true);
    }
  }, [open, initialData, clearAllWarnings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let formattedValue = value;
    if (id === "cpf") formattedValue = formatCPF(value).slice(0, 14);
    if (id === "phone" || id === "whatsapp") formattedValue = formatPhone(value).slice(0, 15);
    setFormData({ ...formData, [id]: formattedValue });
    if (errors[id]) setErrors({ ...errors, [id]: "" });
    if (id === "cpf" || id === "email" || id === "license_number") {
      checkDuplicate(id, formattedValue);
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const handleDateChange = (field: string, date: Date | undefined) => {
    setFormData({ ...formData, [field]: date });
    if (field === "birth_date") setIsAgeValid(!date || isValidAge(date));
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!formData.cpf.trim()) newErrors.cpf = "CPF é obrigatório";
    else if (!validateCPF(formData.cpf)) newErrors.cpf = "CPF inválido";
    if (!formData.email.trim()) newErrors.email = "Email é obrigatório";
    else if (!validateEmail(formData.email)) newErrors.email = "Email inválido";
    if (!formData.phone.trim()) newErrors.phone = "Telefone é obrigatório";
    if (!formData.birth_date) newErrors.birth_date = "Data de nascimento é obrigatória";
    else if (!isAgeValid) newErrors.birth_date = "Condutor deve ter pelo menos 18 anos";
    if (!formData.gender) newErrors.gender = "Gênero é obrigatório";
    if (!formData.nationality.trim()) newErrors.nationality = "Nacionalidade é obrigatória";
    if (!formData.street.trim()) newErrors.street = "Rua é obrigatória";
    if (!formData.number.trim()) newErrors.number = "Número é obrigatório";
    if (!formData.neighborhood.trim()) newErrors.neighborhood = "Bairro é obrigatório";
    if (!formData.city.trim()) newErrors.city = "Cidade é obrigatória";
    if (!formData.license_number.trim()) newErrors.license_number = "Número da CNH é obrigatório";
    if (!formData.license_category) newErrors.license_category = "Categoria da CNH é obrigatória";
    if (!formData.license_expiry_date) newErrors.license_expiry_date = "Validade da CNH é obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit({
      ...formData,
      is_active: formData?.is_active ?? true,
      document: documentFile,
      cnh_digital: cnhFile,
      photo: photoFile,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-w-[95vw]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-primary">
              {initialData ? "Editar Condutor" : "Novo Condutor"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* Foto — barra horizontal compacta */}
            <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/40 px-4 py-3">
              <div className="relative shrink-0">
                {photoFile || (formData.photo && !photoFile) ? (
                  <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-primary/20">
                    <img
                      src={photoFile ? URL.createObjectURL(photoFile) : formData.photo}
                      alt="Foto do condutor"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoFile(null)}
                      className="absolute right-0 top-0 rounded-full bg-destructive p-0.5 text-destructive-foreground hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-border bg-background">
                    <Camera className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Foto do condutor</p>
                <p className="text-xs text-muted-foreground">Opcional · JPG, PNG ou WebP</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => document.getElementById("photo")?.click()}
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                {photoFile ? "Alterar foto" : "Selecionar foto"}
              </Button>
              <Input
                id="photo"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>

            {/* Layout 2 colunas */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* ── COLUNA ESQUERDA ── */}
              <div className="space-y-4">
                {/* Dados Pessoais */}
                <div>
                  <div className="mb-3 flex items-center gap-2 border-b border-border pb-1.5">
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Dados Pessoais
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="grid gap-1.5">
                      <Label htmlFor="name" className="text-xs font-medium">Nome Completo *</Label>
                      <Input id="name" value={formData.name} onChange={handleChange} placeholder="Nome completo do condutor" className="h-8 text-sm" />
                      {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid gap-1.5">
                        <Label htmlFor="cpf" className="text-xs font-medium">CPF *</Label>
                        <Input
                          id="cpf"
                          value={formData.cpf}
                          onChange={handleChange}
                          placeholder="000.000.000-00"
                          maxLength={14}
                          className={cn("h-8 text-sm", warnings.cpf.exists && "border-warning/60 bg-warning/5")}
                        />
                        {errors.cpf && <span className="text-xs text-destructive">{errors.cpf}</span>}
                        <DuplicateWarningInline warning={warnings.cpf} />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="birth_date" className="text-xs font-medium">Data de Nascimento *</Label>
                        <Input
                          type="date"
                          id="birth_date"
                          value={formData.birth_date ? format(formData.birth_date, "yyyy-MM-dd") : ""}
                          onChange={(e) => handleDateChange("birth_date", e.target.value ? new Date(e.target.value) : undefined)}
                          className={cn("h-8 text-sm", !isAgeValid && "border-destructive/50 bg-destructive/5")}
                        />
                        {errors.birth_date && <span className="text-xs text-destructive">{errors.birth_date}</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid gap-1.5">
                        <Label htmlFor="gender" className="text-xs font-medium">Gênero *</Label>
                        <Select onValueChange={(v) => handleSelectChange("gender", v)} value={formData.gender}>
                          <SelectTrigger id="gender" className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Masculino</SelectItem>
                            <SelectItem value="F">Feminino</SelectItem>
                            <SelectItem value="O">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.gender && <span className="text-xs text-destructive">{errors.gender}</span>}
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="nationality" className="text-xs font-medium">Nacionalidade *</Label>
                        <Input id="nationality" value={formData.nationality} onChange={handleChange} placeholder="Brasileira" className="h-8 text-sm" />
                        {errors.nationality && <span className="text-xs text-destructive">{errors.nationality}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contato */}
                <div>
                  <div className="mb-3 flex items-center gap-2 border-b border-border pb-1.5">
                    <Phone className="h-3.5 w-3.5 text-success" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Contato
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid gap-1.5">
                        <Label htmlFor="email" className="text-xs font-medium">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="email@exemplo.com"
                          className={cn("h-8 text-sm", warnings.email.exists && "border-warning/60 bg-warning/5")}
                        />
                        {errors.email && <span className="text-xs text-destructive">{errors.email}</span>}
                        <DuplicateWarningInline warning={warnings.email} />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="phone" className="text-xs font-medium">Telefone *</Label>
                        <Input id="phone" value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000" maxLength={15} className="h-8 text-sm" />
                        {errors.phone && <span className="text-xs text-destructive">{errors.phone}</span>}
                      </div>
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="whatsapp" className="text-xs font-medium">WhatsApp</Label>
                      <Input id="whatsapp" value={formData.whatsapp || ""} onChange={handleChange} placeholder="(00) 00000-0000" maxLength={15} className="h-8 text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── COLUNA DIREITA ── */}
              <div className="space-y-4">
                {/* Endereço */}
                <div>
                  <div className="mb-3 flex items-center gap-2 border-b border-border pb-1.5">
                    <MapPin className="h-3.5 w-3.5 text-info" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Endereço
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-4 gap-2">
                      <div className="col-span-3 grid gap-1.5">
                        <Label htmlFor="street" className="text-xs font-medium">Rua / Avenida *</Label>
                        <Input id="street" value={formData.street} onChange={handleChange} placeholder="Nome da rua" className="h-8 text-sm" />
                        {errors.street && <span className="text-xs text-destructive">{errors.street}</span>}
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="number" className="text-xs font-medium">Nº *</Label>
                        <Input id="number" value={formData.number} onChange={handleChange} placeholder="123" className="h-8 text-sm" />
                        {errors.number && <span className="text-xs text-destructive">{errors.number}</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid gap-1.5">
                        <Label htmlFor="neighborhood" className="text-xs font-medium">Bairro *</Label>
                        <Input id="neighborhood" value={formData.neighborhood} onChange={handleChange} className="h-8 text-sm" />
                        {errors.neighborhood && <span className="text-xs text-destructive">{errors.neighborhood}</span>}
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="city" className="text-xs font-medium">Cidade *</Label>
                        <Input id="city" value={formData.city} onChange={handleChange} className="h-8 text-sm" />
                        {errors.city && <span className="text-xs text-destructive">{errors.city}</span>}
                      </div>
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="reference_point" className="text-xs font-medium">Ponto de referência</Label>
                      <Input id="reference_point" value={formData.reference_point} onChange={handleChange} placeholder="Opcional" className="h-8 text-sm" />
                    </div>
                  </div>
                </div>

                {/* CNH */}
                <div>
                  <div className="mb-3 flex items-center gap-2 border-b border-border pb-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-warning" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Detalhes da CNH
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="license_number" className="text-xs font-medium">Número da CNH *</Label>
                      <Input
                        id="license_number"
                        value={formData.license_number}
                        onChange={handleChange}
                        placeholder="12345678901"
                        maxLength={20}
                        className={cn("h-8 text-sm", warnings.license_number.exists && "border-warning/60 bg-warning/5")}
                      />
                      {errors.license_number && <span className="text-xs text-destructive">{errors.license_number}</span>}
                      <DuplicateWarningInline warning={warnings.license_number} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs font-medium">Categoria *</Label>
                      <Select onValueChange={(v) => handleSelectChange("license_category", v)} value={formData.license_category}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {LICENSE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.license_category && <span className="text-xs text-destructive">{errors.license_category}</span>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="license_expiry_date" className="text-xs font-medium">Validade *</Label>
                      <Input
                        type="date"
                        id="license_expiry_date"
                        value={formData.license_expiry_date ? format(formData.license_expiry_date, "yyyy-MM-dd") : ""}
                        onChange={(e) => handleDateChange("license_expiry_date", e.target.value ? new Date(e.target.value) : undefined)}
                        className="h-8 text-sm"
                      />
                      {errors.license_expiry_date && <span className="text-xs text-destructive">{errors.license_expiry_date}</span>}
                    </div>
                  </div>
                </div>

                {/* Documentos */}
                <div>
                  <div className="mb-3 flex items-center gap-2 border-b border-border pb-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Documentos <span className="font-normal normal-case text-muted-foreground/60">(opcional)</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1.5">
                      <Label className="text-xs font-medium">Documento do Condutor (PDF)</Label>
                      <Input type="file" accept=".pdf" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} className="h-8 text-xs" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs font-medium">CNH Digital (PDF)</Label>
                      <Input type="file" accept=".pdf" onChange={(e) => setCnhFile(e.target.files?.[0] || null)} className="h-8 text-xs" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !isAgeValid}>
              {isSubmitting ? "Salvando..." : initialData ? "Salvar alterações" : "Cadastrar condutor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
