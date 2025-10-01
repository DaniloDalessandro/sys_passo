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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  User,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Upload,
  FileText,
  X,
  Phone,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDuplicateWarnings } from "@/hooks/useDuplicateWarnings";
import { DuplicateWarningInline } from "@/components/ui/duplicate-warning";

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

  let sum = 0;
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
  }

  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;

  return remainder === parseInt(numbers.substring(10, 11));
};

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Age calculation utilities
const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

const formatAgeDisplay = (birthDate: Date): string => {
  const age = calculateAge(birthDate);
  return `${age} ano${age !== 1 ? 's' : ''}`;
};

const isValidAge = (birthDate: Date): boolean => {
  return calculateAge(birthDate) >= 18;
};

export default function ConductorForm({
  open,
  handleClose,
  initialData,
  onSubmit,
  isSubmitting = false,
}: ConductorFormProps) {
  const [formData, setFormData] = useState<any>({
    name: "",
    cpf: "",
    birth_date: null,
    gender: "M",
    nationality: "Brasileira",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    reference_point: "",
    phone: "",
    email: "",
    whatsapp: "",
    license_number: "",
    license_category: "B",
    license_expiry_date: null,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [cnhFile, setCnhFile] = useState<File | null>(null);

  // Age validation state
  const [currentAge, setCurrentAge] = useState<number | null>(null);
  const [isAgeValid, setIsAgeValid] = useState<boolean>(true);

  // Duplicate warnings hook
  const { warnings, checkDuplicate, clearWarning, clearAllWarnings } = useDuplicateWarnings(
    initialData?.id
  );

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          cpf: initialData.cpf || "",
          birth_date: initialData.birth_date ? new Date(initialData.birth_date) : null,
          gender: initialData.gender || "M",
          nationality: initialData.nationality || "Brasileira",
          street: initialData.street || "",
          number: initialData.number || "",
          neighborhood: initialData.neighborhood || "",
          city: initialData.city || "",
          reference_point: initialData.reference_point || "",
          phone: initialData.phone || "",
          email: initialData.email || "",
          whatsapp: initialData.whatsapp || "",
          license_number: initialData.license_number || "",
          license_category: initialData.license_category || "B",
          license_expiry_date: initialData.license_expiry_date ? new Date(initialData.license_expiry_date) : null,
          is_active: initialData.is_active ?? true,
        });
      } else {
        setFormData({
          name: "",
          cpf: "",
          birth_date: null,
          gender: "M",
          nationality: "Brasileira",
          street: "",
          number: "",
          neighborhood: "",
          city: "",
          reference_point: "",
          phone: "",
          email: "",
          whatsapp: "",
          license_number: "",
          license_category: "B",
          license_expiry_date: null,
          is_active: true,
        });
      }
      setErrors({});
      setDocumentFile(null);
      setCnhFile(null);
      clearAllWarnings();

      // Initialize age validation for existing data
      if (initialData && initialData.birth_date) {
        const birthDate = new Date(initialData.birth_date);
        const age = calculateAge(birthDate);
        const ageValid = isValidAge(birthDate);
        setCurrentAge(age);
        setIsAgeValid(ageValid);
      } else {
        setCurrentAge(null);
        setIsAgeValid(true);
      }
    }
  }, [open, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    let formattedValue = value;

    if (id === "cpf") {
      formattedValue = formatCPF(value);
      if (formattedValue.replace(/\D/g, "").length > 11) return;
    } else if (id === "phone" || id === "whatsapp") {
      formattedValue = formatPhone(value);
      if (formattedValue.replace(/\D/g, "").length > 11) return;
    }

    setFormData({ ...formData, [id]: formattedValue });

    if (errors[id]) {
      setErrors({ ...errors, [id]: "" });
    }

    // Trigger duplicate checks for relevant fields
    if (id === "cpf" || id === "email" || id === "license_number") {
      if (formattedValue.trim()) {
        checkDuplicate(id as 'cpf' | 'email' | 'license_number', formattedValue);
      } else {
        clearWarning(id as 'cpf' | 'email' | 'license_number');
      }
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });

    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleDateChange = (field: string, date: Date | undefined) => {
    setFormData({ ...formData, [field]: date });

    // Handle age validation for birth_date
    if (field === 'birth_date' && date) {
      const age = calculateAge(date);
      const ageValid = isValidAge(date);
      setCurrentAge(age);
      setIsAgeValid(ageValid);

      // Clear or set age validation error
      if (!ageValid) {
        setErrors({ ...errors, [field]: "Condutor deve ter pelo menos 18 anos de idade" });
      } else if (errors[field]) {
        setErrors({ ...errors, [field]: "" });
      }
    } else {
      if (field === 'birth_date') {
        setCurrentAge(null);
        setIsAgeValid(true);
      }

      if (errors[field]) {
        setErrors({ ...errors, [field]: "" });
      }
    }
  };

  const isLicenseExpiringSoon = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isLicenseExpired = (date: Date) => {
    return date < new Date();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (formData.name.length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres";
    } else if (formData.name.length > 150) {
      newErrors.name = "Nome deve ter no máximo 150 caracteres";
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório";
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = "CPF inválido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório";
    } else if (formData.phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Telefone deve ter pelo menos 10 dígitos";
    } else if (formData.phone.length > 20) {
      newErrors.phone = "Telefone deve ter no máximo 20 caracteres";
    }

    if (formData.whatsapp && formData.whatsapp.trim()) {
      if (formData.whatsapp.replace(/\D/g, "").length < 10) {
        newErrors.whatsapp = "WhatsApp deve ter pelo menos 10 dígitos";
      } else if (formData.whatsapp.length > 20) {
        newErrors.whatsapp = "WhatsApp deve ter no máximo 20 caracteres";
      }
    }

    if (!formData.birth_date) {
      newErrors.birth_date = "Data de nascimento é obrigatória";
    } else if (!isValidAge(formData.birth_date)) {
      newErrors.birth_date = "Condutor deve ter pelo menos 18 anos de idade";
    }

    if (!formData.license_number.trim()) {
      newErrors.license_number = "Número da CNH é obrigatório";
    } else if (formData.license_number.length > 20) {
      newErrors.license_number = "Número da CNH deve ter no máximo 20 caracteres";
    }

    if (!formData.license_category) {
      newErrors.license_category = "Categoria da CNH é obrigatória";
    }

    if (!formData.license_expiry_date) {
      newErrors.license_expiry_date = "Data de validade da CNH é obrigatória";
    }

    // Validação dos campos de endereço
    if (!formData.street.trim()) {
      newErrors.street = "Rua/Avenida é obrigatória";
    } else if (formData.street.length > 200) {
      newErrors.street = "Rua/Avenida deve ter no máximo 200 caracteres";
    }

    if (!formData.number.trim()) {
      newErrors.number = "Número é obrigatório";
    } else if (formData.number.length > 20) {
      newErrors.number = "Número deve ter no máximo 20 caracteres";
    }

    if (!formData.neighborhood.trim()) {
      newErrors.neighborhood = "Bairro é obrigatório";
    } else if (formData.neighborhood.length > 100) {
      newErrors.neighborhood = "Bairro deve ter no máximo 100 caracteres";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Cidade é obrigatória";
    } else if (formData.city.length > 100) {
      newErrors.city = "Cidade deve ter no máximo 100 caracteres";
    }

    // Ponto de referência é opcional
    if (formData.reference_point && formData.reference_point.trim().length > 200) {
      newErrors.reference_point = "Ponto de referência deve ter no máximo 200 caracteres";
    }

    // Nacionalidade tem valor padrão "Brasileira" no modelo, então não precisa ser obrigatória
    if (formData.nationality && formData.nationality.trim().length > 50) {
      newErrors.nationality = "Nacionalidade deve ter no máximo 50 caracteres";
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
      document: documentFile,
      cnh_digital: cnhFile,
    };

    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[900px] max-w-[90vw] max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          // Evita fechar o dialog quando clica no popover
          const target = e.target as Element;
          if (target.closest('[data-radix-popper-content-wrapper]')) {
            e.preventDefault();
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-primary">
              {initialData ? "Editar Condutor" : "Novo Condutor"}
            </DialogTitle>
            <hr className="mt-2 border-b border-gray-200" />
          </DialogHeader>

          <div className="grid gap-6 py-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-md font-semibold text-gray-700 border-b pb-2">Dados Pessoais</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Digite o nome completo"
                  />
                  {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={cn(
                      warnings.cpf.exists && "border-amber-300 bg-amber-50"
                    )}
                  />
                  {errors.cpf && <span className="text-sm text-red-500">{errors.cpf}</span>}
                  <DuplicateWarningInline warning={warnings.cpf} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@exemplo.com"
                    className={cn(
                      warnings.email.exists && "border-amber-300 bg-amber-50"
                    )}
                  />
                  {errors.email && <span className="text-sm text-red-500">{errors.email}</span>}
                  <DuplicateWarningInline warning={warnings.email} />
                </div>

                <div className="grid gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Data de Nascimento *</Label>
                    {formData.birth_date && currentAge !== null && (
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                          isAgeValid
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        )}>
                          <User className="w-3 h-3 mr-1" />
                          {formData.birth_date && formatAgeDisplay(formData.birth_date)}
                        </div>
                        {!isAgeValid && (
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Idade mínima: 18 anos
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Input
                    type="date"
                    id="birth_date"
                    value={formData.birth_date ? format(formData.birth_date, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const dateValue = e.target.value ? new Date(e.target.value) : undefined;
                      handleDateChange("birth_date", dateValue);
                    }}
                    max={format(new Date(), "yyyy-MM-dd")}
                    min="1900-01-01"
                    className={cn(
                      "h-10",
                      formData.birth_date && !isAgeValid && "border-red-300 bg-red-50"
                    )}
                  />
                  {errors.birth_date && <span className="text-sm text-red-500">{errors.birth_date}</span>}
                </div>

                <div className="grid gap-2">
                  <Label>Gênero *</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("gender", value)}
                    value={formData.gender}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o gênero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                      <SelectItem value="O">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="nationality">Nacionalidade</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    placeholder="Brasileira"
                    maxLength={50}
                  />
                  {errors.nationality && <span className="text-sm text-red-500">{errors.nationality}</span>}
                </div>
              </div>
            </div>

            {/* Age Validation Alert */}
            {formData.birth_date && !isAgeValid && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-700">
                  <strong>Idade insuficiente:</strong> O condutor deve ter pelo menos 18 anos de idade para ser cadastrado.
                  Idade atual: {currentAge} ano{currentAge !== 1 ? 's' : ''}.
                  Por favor, selecione uma data de nascimento válida.
                </AlertDescription>
              </Alert>
            )}

            {/* Contato */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="h-5 w-5 text-green-600" />
                <h3 className="text-md font-semibold text-gray-700 border-b pb-2">Contato</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone/Celular *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    maxLength={20}
                  />
                  {errors.phone && <span className="text-sm text-red-500">{errors.phone}</span>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    maxLength={20}
                  />
                  {errors.whatsapp && <span className="text-sm text-red-500">{errors.whatsapp}</span>}
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-purple-600" />
                <h3 className="text-md font-semibold text-gray-700 border-b pb-2">Endereço</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="grid gap-2 lg:col-span-2">
                  <Label htmlFor="street">Rua/Avenida *</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Nome da rua ou avenida"
                    maxLength={200}
                  />
                  {errors.street && <span className="text-sm text-red-500">{errors.street}</span>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="number">Número *</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={handleChange}
                    placeholder="123"
                    maxLength={20}
                  />
                  {errors.number && <span className="text-sm text-red-500">{errors.number}</span>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    placeholder="Nome do bairro"
                    maxLength={100}
                  />
                  {errors.neighborhood && <span className="text-sm text-red-500">{errors.neighborhood}</span>}
                </div>

                <div className="grid gap-2 lg:col-span-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Nome da cidade"
                    maxLength={100}
                  />
                  {errors.city && <span className="text-sm text-red-500">{errors.city}</span>}
                </div>

                <div className="grid gap-2 lg:col-span-2">
                  <Label htmlFor="reference_point">Ponto de Referência</Label>
                  <Input
                    id="reference_point"
                    value={formData.reference_point}
                    onChange={handleChange}
                    placeholder="Próximo ao shopping, escola, etc."
                    maxLength={200}
                  />
                  {errors.reference_point && <span className="text-sm text-red-500">{errors.reference_point}</span>}
                </div>
              </div>
            </div>

            {/* CNH */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-amber-600" />
                <h3 className="text-md font-semibold text-gray-700 border-b pb-2">Carteira Nacional de Habilitação</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="license_number">Número da CNH *</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    placeholder="12345678901"
                    maxLength={20}
                    className={cn(
                      warnings.license_number.exists && "border-amber-300 bg-amber-50"
                    )}
                  />
                  {errors.license_number && <span className="text-sm text-red-500">{errors.license_number}</span>}
                  <DuplicateWarningInline warning={warnings.license_number} />
                </div>

                <div className="grid gap-2">
                  <Label>Categoria *</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("license_category", value)}
                    value={formData.license_category}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {licenseCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.license_category && <span className="text-sm text-red-500">{errors.license_category}</span>}
                </div>

                <div className="grid gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="license_expiry_date">Validade da CNH *</Label>
                    {formData.license_expiry_date && (
                      <div className="flex gap-1">
                        {isLicenseExpired(formData.license_expiry_date) && (
                          <Badge variant="destructive" className="text-xs">
                            Vencida
                          </Badge>
                        )}
                        {isLicenseExpiringSoon(formData.license_expiry_date) && !isLicenseExpired(formData.license_expiry_date) && (
                          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                            Vence em breve
                          </Badge>
                        )}
                        {!isLicenseExpired(formData.license_expiry_date) && !isLicenseExpiringSoon(formData.license_expiry_date) && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            Válida
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <Input
                    type="date"
                    id="license_expiry_date"
                    value={formData.license_expiry_date ? format(formData.license_expiry_date, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const dateValue = e.target.value ? new Date(e.target.value) : undefined;
                      handleDateChange("license_expiry_date", dateValue);
                    }}
                    min={format(new Date(), "yyyy-MM-dd")}
                    className={cn(
                      "h-10",
                      formData.license_expiry_date && isLicenseExpired(formData.license_expiry_date) && "border-red-300 bg-red-50 text-red-700"
                    )}
                  />
                  {errors.license_expiry_date && <span className="text-sm text-red-500">{errors.license_expiry_date}</span>}
                </div>
              </div>

              {/* CNH Status Alert */}
              {formData.license_expiry_date && (
                <div className="mt-4">
                  {isLicenseExpired(formData.license_expiry_date) ? (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        CNH vencida. O condutor não pode dirigir legalmente.
                      </AlertDescription>
                    </Alert>
                  ) : isLicenseExpiringSoon(formData.license_expiry_date) ? (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-700">
                        CNH vence em menos de 30 dias. Renovar o mais breve possível.
                      </AlertDescription>
                    </Alert>
                  ) : null}
                </div>
              )}
            </div>

            {/* Documentos */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-indigo-600" />
                <h3 className="text-md font-semibold text-gray-700 border-b pb-2">Documentos (Opcional)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Document Upload */}
                <div className="space-y-2">
                  <Label>Documento do Condutor</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setDocumentFile(file);
                        }
                      }}
                      className="hidden"
                      id="document-upload"
                    />
                    <label
                      htmlFor="document-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      {documentFile ? (
                        <div className="flex items-center gap-2">
                          <div className="text-center">
                            <p className="text-sm font-medium text-green-600">
                              {documentFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Clique para alterar
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              setDocumentFile(null);
                            }}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm font-medium">
                            Clique para selecionar documento PDF
                          </p>
                          <p className="text-xs text-gray-500">
                            Apenas PDF até 10MB
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* CNH Digital Upload */}
                <div className="space-y-2">
                  <Label>CNH Digital (PDF)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCnhFile(file);
                        }
                      }}
                      className="hidden"
                      id="cnh-upload"
                    />
                    <label
                      htmlFor="cnh-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      {cnhFile ? (
                        <div className="flex items-center gap-2">
                          <div className="text-center">
                            <p className="text-sm font-medium text-green-600">
                              {cnhFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Clique para alterar
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              setCnhFile(null);
                            }}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm font-medium">
                            Clique para selecionar PDF da CNH
                          </p>
                          <p className="text-xs text-gray-500">
                            Apenas PDF até 10MB
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Duplicate Warnings Summary */}
          {(warnings.cpf.exists || warnings.email.exists || warnings.license_number.exists) && (
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-amber-700">
                <div className="font-medium mb-2">Dados duplicados encontrados:</div>
                <div className="space-y-1 text-sm">
                  {warnings.cpf.exists && (
                    <div>• {warnings.cpf.message}</div>
                  )}
                  {warnings.email.exists && (
                    <div>• {warnings.email.message}</div>
                  )}
                  {warnings.license_number.exists && (
                    <div>• {warnings.license_number.message}</div>
                  )}
                </div>
                <div className="mt-2 text-xs opacity-80">
                  Você pode continuar com o cadastro, mas recomendamos verificar se não há duplicatas.
                </div>
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (formData.birth_date && !isAgeValid)}
              className={cn(
                formData.birth_date && !isAgeValid && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {initialData ? "Salvando..." : "Criando..."}
                </>
              ) : (
                initialData ? "Salvar Alterações" : "Criar Condutor"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}