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
import {
  User,
  CreditCard,
  FileText,
  Phone,
  MapPin,
  UserCheck,
  Camera,
  Upload,
  X,
} from "lucide-react";
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

  const handleBooleanChange = (field: string, value: boolean) => {
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
    onSubmit({ ...formData, document: documentFile, cnh_digital: cnhFile, photo: photoFile });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="flex flex-row justify-between items-center">
            <DialogTitle className="text-lg font-semibold text-primary">
              {initialData ? "Editar Condutor" : "Novo Condutor"}
            </DialogTitle>
          </DialogHeader>

          {/* Seção de Foto */}
          <div className="flex flex-col items-center gap-3 py-4 border-b">
            <div className="relative">
              {photoFile || (formData.photo && !photoFile) ? (
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100">
                  <img
                    src={photoFile ? URL.createObjectURL(photoFile) : formData.photo}
                    alt="Foto do condutor"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoFile(null)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <Camera className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            <Label htmlFor="photo" className="cursor-pointer">
              <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('photo')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                {photoFile ? "Alterar Foto" : "Adicionar Foto"}
              </Button>
            </Label>
            <Input
              id="photo"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <p className="text-xs text-gray-500">Foto do condutor (opcional)</p>
          </div>

          <div className="grid gap-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-700">Dados Pessoais</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5 col-span-2">
                  <Label htmlFor="name" className="text-xs font-medium text-gray-700">Nome Completo *</Label>
                  <Input id="name" value={formData.name} onChange={handleChange} placeholder="Digite o nome completo" className="h-9" />
                  {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="cpf" className="text-xs font-medium text-gray-700">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={cn("h-9", warnings.cpf.exists && "border-amber-300 bg-amber-50")}
                  />
                  {errors.cpf && <span className="text-xs text-red-500">{errors.cpf}</span>}
                  <DuplicateWarningInline warning={warnings.cpf} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="birth_date" className="text-xs font-medium text-gray-700">Data de Nascimento *</Label>
                  <Input
                    type="date"
                    id="birth_date"
                    value={formData.birth_date ? format(formData.birth_date, "yyyy-MM-dd") : ""}
                    onChange={(e) => handleDateChange("birth_date", e.target.value ? new Date(e.target.value) : undefined)}
                    className={cn("h-9", !isAgeValid && "border-red-300 bg-red-50")}
                  />
                  {errors.birth_date && <span className="text-xs text-red-500">{errors.birth_date}</span>}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="gender" className="text-xs font-medium text-gray-700">Gênero *</Label>
                  <Select onValueChange={(value) => handleSelectChange("gender", value)} value={formData.gender}>
                    <SelectTrigger id="gender" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                      <SelectItem value="O">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <span className="text-xs text-red-500">{errors.gender}</span>}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="nationality" className="text-xs font-medium text-gray-700">Nacionalidade *</Label>
                  <Input id="nationality" value={formData.nationality} onChange={handleChange} placeholder="Brasileira" className="h-9" />
                  {errors.nationality && <span className="text-xs text-red-500">{errors.nationality}</span>}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-green-600" />
                <h3 className="text-sm font-semibold text-gray-700">Contato</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-gray-700">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@exemplo.com"
                    className={cn("h-9", warnings.email.exists && "border-amber-300 bg-amber-50")}
                  />
                  {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                  <DuplicateWarningInline warning={warnings.email} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="phone" className="text-xs font-medium text-gray-700">Telefone/Celular *</Label>
                  <Input id="phone" value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000" maxLength={15} className="h-9" />
                  {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
                </div>
                {formData.whatsapp && (
                  <div className="grid gap-1.5 col-span-2">
                    <Label htmlFor="whatsapp" className="text-xs font-medium text-gray-700">WhatsApp</Label>
                    <Input id="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="(00) 00000-0000" maxLength={15} className="h-9" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-700">Endereço</h3>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="grid gap-1.5 col-span-3">
                  <Label htmlFor="street" className="text-xs font-medium text-gray-700">Rua/Avenida *</Label>
                  <Input id="street" value={formData.street} onChange={handleChange} className="h-9" />
                  {errors.street && <span className="text-xs text-red-500">{errors.street}</span>}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="number" className="text-xs font-medium text-gray-700">Número *</Label>
                  <Input id="number" value={formData.number} onChange={handleChange} className="h-9" />
                  {errors.number && <span className="text-xs text-red-500">{errors.number}</span>}
                </div>
                <div className="grid gap-1.5 col-span-2">
                  <Label htmlFor="neighborhood" className="text-xs font-medium text-gray-700">Bairro *</Label>
                  <Input id="neighborhood" value={formData.neighborhood} onChange={handleChange} className="h-9" />
                  {errors.neighborhood && <span className="text-xs text-red-500">{errors.neighborhood}</span>}
                </div>
                <div className="grid gap-1.5 col-span-2">
                  <Label htmlFor="city" className="text-xs font-medium text-gray-700">Cidade *</Label>
                  <Input id="city" value={formData.city} onChange={handleChange} className="h-9" />
                  {errors.city && <span className="text-xs text-red-500">{errors.city}</span>}
                </div>
                <div className="grid gap-1.5 col-span-4">
                  <Label htmlFor="reference_point" className="text-xs font-medium text-gray-700">Ponto de referência</Label>
                  <Input id="reference_point" value={formData.reference_point} onChange={handleChange} placeholder="Opcional" className="h-9" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-gray-700">Detalhes da CNH</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="license_number" className="text-xs font-medium text-gray-700">Número da CNH *</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    placeholder="12345678901"
                    maxLength={20}
                    className={cn("h-9", warnings.license_number.exists && "border-amber-300 bg-amber-50")}
                  />
                  {errors.license_number && <span className="text-xs text-red-500">{errors.license_number}</span>}
                  <DuplicateWarningInline warning={warnings.license_number} />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium text-gray-700">Categoria CNH *</Label>
                  <Select onValueChange={(value) => handleSelectChange("license_category", value)} value={formData.license_category}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {LICENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.license_category && <span className="text-xs text-red-500">{errors.license_category}</span>}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="license_expiry_date" className="text-xs font-medium text-gray-700">Validade da CNH *</Label>
                  <Input
                    type="date"
                    id="license_expiry_date"
                    value={formData.license_expiry_date ? format(formData.license_expiry_date, "yyyy-MM-dd") : ""}
                    onChange={(e) => handleDateChange("license_expiry_date", e.target.value ? new Date(e.target.value) : undefined)}
                    className="h-9"
                  />
                  {errors.license_expiry_date && <span className="text-xs text-red-500">{errors.license_expiry_date}</span>}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-700">Documentos (Opcional)</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Documento do Condutor (PDF)</Label>
                  <Input type="file" accept=".pdf" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">CNH Digital (PDF)</Label>
                  <Input type="file" accept=".pdf" onChange={(e) => setCnhFile(e.target.files?.[0] || null)} className="h-9" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !isAgeValid}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
