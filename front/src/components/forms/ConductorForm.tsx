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
  AlertTriangle,
  Upload,
  FileText,
  X,
  Phone,
  MapPin,
  Settings,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDuplicateWarnings } from "@/hooks/useDuplicateWarnings";
import { DuplicateWarningInline } from "@/components/ui/duplicate-warning";

// ... (interfaces and helper functions remain the same)
interface ConductorFormProps {
  open: boolean;
  handleClose: () => void;
  initialData: any | null;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

const licenseCategories = [
  { value: "A", label: "Categoria A" },
  { value: "B", label: "Categoria B" },
  { value: "C", label: "Categoria C" },
  { value: "D", label: "Categoria D" },
  { value: "E", label: "Categoria E" },
  { value: "AB", label: "Categoria AB" },
  { value: "AC", label: "Categoria AC" },
  { value: "AD", label: "Categoria AD" },
  { value: "AE", label: "Categoria AE" },
];

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
  let sum = 0, remainder;
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
  const [isAgeValid, setIsAgeValid] = useState<boolean>(true);
  const [showAdvanced, setShowAdvanced] = useState(false); // State for advanced fields

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
      });
      setErrors({});
      setDocumentFile(null);
      setCnhFile(null);
      clearAllWarnings();
      setShowAdvanced(false); // Reset advanced view on open
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
    if (field === 'birth_date') setIsAgeValid(!date || isValidAge(date));
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
    if (!formData.license_number.trim()) newErrors.license_number = "Número da CNH é obrigatório";
    if (!formData.license_category) newErrors.license_category = "Categoria da CNH é obrigatória";

    if (showAdvanced) {
        if (!formData.birth_date) newErrors.birth_date = "Data de nascimento é obrigatória";
        else if (!isAgeValid) newErrors.birth_date = "Condutor deve ter pelo menos 18 anos";
        if (!formData.license_expiry_date) newErrors.license_expiry_date = "Validade da CNH é obrigatória";
        if (!formData.street.trim()) newErrors.street = "Rua é obrigatória";
        if (!formData.number.trim()) newErrors.number = "Número é obrigatório";
        if (!formData.neighborhood.trim()) newErrors.neighborhood = "Bairro é obrigatório";
        if (!formData.city.trim()) newErrors.city = "Cidade é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit({ ...formData, document: documentFile, cnh_digital: cnhFile });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="flex flex-row justify-between items-center">
            <DialogTitle className="text-lg font-semibold text-primary">
              {initialData ? "Editar Condutor" : "Novo Condutor"}
            </DialogTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
              <Settings className="h-4 w-4 mr-2" />
              {showAdvanced ? "Menos Opções" : "Mais Opções"}
              {showAdvanced ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </Button>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            {/* --- CAMPOS PADRÃO --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input id="name" value={formData.name} onChange={handleChange} placeholder="Digite o nome completo" />
                {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input id="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" maxLength={14} className={cn(warnings.cpf.exists && "border-amber-300 bg-amber-50")} />
                {errors.cpf && <span className="text-sm text-red-500">{errors.cpf}</span>}
                <DuplicateWarningInline warning={warnings.cpf} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@exemplo.com" className={cn(warnings.email.exists && "border-amber-300 bg-amber-50")} />
                {errors.email && <span className="text-sm text-red-500">{errors.email}</span>}
                <DuplicateWarningInline warning={warnings.email} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone/Celular *</Label>
                <Input id="phone" value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000" maxLength={15} />
                {errors.phone && <span className="text-sm text-red-500">{errors.phone}</span>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="license_number">Número da CNH *</Label>
                <Input id="license_number" value={formData.license_number} onChange={handleChange} placeholder="12345678901" maxLength={20} className={cn(warnings.license_number.exists && "border-amber-300 bg-amber-50")} />
                {errors.license_number && <span className="text-sm text-red-500">{errors.license_number}</span>}
                <DuplicateWarningInline warning={warnings.license_number} />
              </div>
              <div className="grid gap-2 md:col-span-2">
                  <Label>Categoria CNH *</Label>
                  <Select onValueChange={(value) => handleSelectChange("license_category", value)} value={formData.license_category}>
                    <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                    <SelectContent>
                      {licenseCategories.map((cat) => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.license_category && <span className="text-sm text-red-500">{errors.license_category}</span>}
              </div>
            </div>

            {/* --- CAMPOS AVANÇADOS --- */}
            {showAdvanced && (
              <div className="space-y-6 pt-6 border-t">
                {/* Dados Pessoais Avançado */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2"><User className="h-5 w-5 text-blue-600" /><h3 className="text-md font-semibold text-gray-700">Dados Pessoais Adicionais</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="birth_date">Data de Nascimento *</Label>
                            <Input type="date" id="birth_date" value={formData.birth_date ? format(formData.birth_date, "yyyy-MM-dd") : ""} onChange={(e) => handleDateChange("birth_date", e.target.value ? new Date(e.target.value) : undefined)} className={cn(!isAgeValid && "border-red-300 bg-red-50")} />
                            {errors.birth_date && <span className="text-sm text-red-500">{errors.birth_date}</span>}
                        </div>
                        <div className="grid gap-2">
                            <Label>Gênero *</Label>
                            <Select onValueChange={(value) => handleSelectChange("gender", value)} value={formData.gender}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="M">Masculino</SelectItem><SelectItem value="F">Feminino</SelectItem><SelectItem value="O">Outro</SelectItem></SelectContent></Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="nationality">Nacionalidade</Label>
                            <Input id="nationality" value={formData.nationality} onChange={handleChange} placeholder="Brasileira" />
                        </div>
                    </div>
                </div>

                {/* Contato Avançado */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2"><Phone className="h-5 w-5 text-green-600" /><h3 className="text-md font-semibold text-gray-700">Contato Adicional</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="whatsapp">WhatsApp</Label>
                            <Input id="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="(00) 00000-0000" maxLength={15} />
                        </div>
                    </div>
                </div>

                {/* Endereço */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-purple-600" /><h3 className="text-md font-semibold text-gray-700">Endereço</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="grid gap-2 md:col-span-2"><Label htmlFor="street">Rua/Avenida *</Label><Input id="street" value={formData.street} onChange={handleChange} />{errors.street && <span className="text-sm text-red-500">{errors.street}</span>}</div>
                        <div className="grid gap-2"><Label htmlFor="number">Número *</Label><Input id="number" value={formData.number} onChange={handleChange} />{errors.number && <span className="text-sm text-red-500">{errors.number}</span>}</div>
                        <div className="grid gap-2"><Label htmlFor="neighborhood">Bairro *</Label><Input id="neighborhood" value={formData.neighborhood} onChange={handleChange} />{errors.neighborhood && <span className="text-sm text-red-500">{errors.neighborhood}</span>}</div>
                        <div className="grid gap-2 md:col-span-2"><Label htmlFor="city">Cidade *</Label><Input id="city" value={formData.city} onChange={handleChange} />{errors.city && <span className="text-sm text-red-500">{errors.city}</span>}</div>
                        <div className="grid gap-2 md:col-span-2"><Label htmlFor="reference_point">Ponto de Referência</Label><Input id="reference_point" value={formData.reference_point} onChange={handleChange} /></div>
                    </div>
                </div>

                {/* CNH Avançado */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-amber-600" /><h3 className="text-md font-semibold text-gray-700">Detalhes da CNH</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="license_expiry_date">Validade da CNH *</Label>
                            <Input type="date" id="license_expiry_date" value={formData.license_expiry_date ? format(formData.license_expiry_date, "yyyy-MM-dd") : ""} onChange={(e) => handleDateChange("license_expiry_date", e.target.value ? new Date(e.target.value) : undefined)} />
                            {errors.license_expiry_date && <span className="text-sm text-red-500">{errors.license_expiry_date}</span>}
                        </div>
                    </div>
                </div>

                {/* Documentos */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-indigo-600" /><h3 className="text-md font-semibold text-gray-700">Documentos (Opcional)</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Documento do Condutor (PDF)</Label>
                            <Input type="file" accept=".pdf" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} />
                        </div>
                        <div className="space-y-2">
                            <Label>CNH Digital (PDF)</Label>
                            <Input type="file" accept=".pdf" onChange={(e) => setCnhFile(e.target.files?.[0] || null)} />
                        </div>
                    </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting || !isAgeValid}>{isSubmitting ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
