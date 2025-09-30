"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  CalendarIcon,
  User,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Upload,
  FileText,
  X,
  Phone,
  MapPin,
  Globe
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"

const licenseCategories = [
  { value: "A", label: "Categoria A - Motocicleta" },
  { value: "B", label: "Categoria B - Carro" },
  { value: "C", label: "Categoria C - Caminhão" },
  { value: "D", label: "Categoria D - Ônibus" },
  { value: "E", label: "Categoria E - Carreta" },
  { value: "AB", label: "Categoria A+B" },
  { value: "AC", label: "Categoria A+C" },
  { value: "AD", label: "Categoria A+D" },
  { value: "AE", label: "Categoria A+E" },
]

const formatCPF = (value: string) => {
  const numbers = value.replace(/\D/g, "")
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, "")
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }
  return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
}

const validateCPF = (cpf: string) => {
  const numbers = cpf.replace(/\D/g, "")
  if (numbers.length !== 11 || /^(\d)\1+$/.test(numbers)) return false

  let sum = 0
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (11 - i)
  }

  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(numbers.substring(9, 10))) return false

  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (12 - i)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0

  return remainder === parseInt(numbers.substring(10, 11))
}

const conductorSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(150, "Nome deve ter no máximo 150 caracteres"),
  cpf: z.string().min(11, "CPF é obrigatório").refine(validateCPF, "CPF inválido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  birth_date: z.date({
    required_error: "Data de nascimento é obrigatória",
  }),
  license_number: z.string().min(9, "Número da CNH deve ter pelo menos 9 dígitos").max(11, "Número da CNH deve ter no máximo 11 dígitos"),
  license_category: z.string().min(1, "Categoria da CNH é obrigatória"),
  license_expiry_date: z.date({
    required_error: "Data de validade da CNH é obrigatória",
  }),
  address: z.string().min(10, "Endereço deve ser mais detalhado"),
  gender: z.enum(["M", "F", "O"], {
    required_error: "Gênero é obrigatório",
  }),
  nationality: z.string().min(1, "Nacionalidade é obrigatória").default("Brasileira"),
  whatsapp: z.string().min(10, "WhatsApp deve ter pelo menos 10 dígitos"),
  is_active: z.boolean().default(true),
})

type ConductorFormData = z.infer<typeof conductorSchema> & {
  photo?: File | null
  cnh_digital?: File | null
}

interface ConductorFormProps {
  onSubmit: (data: ConductorFormData) => Promise<void>
  initialData?: Partial<ConductorFormData>
  isLoading?: boolean
  submitButtonText?: string
}

export function ConductorForm({
  onSubmit,
  initialData,
  isLoading = false,
  submitButtonText = "Cadastrar Condutor"
}: ConductorFormProps) {
  const [error, setError] = useState<string>("")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [cnhFile, setCnhFile] = useState<File | null>(null)

  const form = useForm<ConductorFormData>({
    resolver: zodResolver(conductorSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      cpf: initialData?.cpf || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      birth_date: initialData?.birth_date || undefined,
      license_number: initialData?.license_number || "",
      license_category: initialData?.license_category || "",
      license_expiry_date: initialData?.license_expiry_date || undefined,
      address: initialData?.address || "",
      gender: initialData?.gender || "M",
      nationality: initialData?.nationality || "Brasileira",
      whatsapp: initialData?.whatsapp || "",
      is_active: initialData?.is_active ?? true,
    },
  })

  const handleSubmit = async (data: ConductorFormData) => {
    try {
      setError("")
      const formDataWithFiles = {
        ...data,
        photo: photoFile,
        cnh_digital: cnhFile
      }
      await onSubmit(formDataWithFiles)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao salvar condutor")
    }
  }

  const isLicenseExpiringSoon = (date: Date) => {
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  const isLicenseExpired = (date: Date) => {
    return date < new Date()
  }

  return (
    <div className="w-full space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

          {/* Dados Pessoais */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Dados Pessoais</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label>Nome Completo *</Label>
                    <FormControl>
                      <Input
                        placeholder="Digite o nome completo"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <Label>CPF *</Label>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        className="h-10"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatCPF(e.target.value)
                          if (formatted.replace(/\D/g, "").length <= 11) {
                            field.onChange(formatted)
                          }
                        }}
                        maxLength={14}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label>Email *</Label>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <Label>Data de Nascimento *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-10",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <Label>Gênero *</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Selecione o gênero" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Feminino</SelectItem>
                        <SelectItem value="O">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <Label>Nacionalidade *</Label>
                    <FormControl>
                      <Input
                        placeholder="Brasileira"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Contato</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <Label>Telefone/Celular *</Label>
                    <FormControl>
                      <Input
                        placeholder="(00) 00000-0000"
                        className="h-10"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value)
                          if (formatted.replace(/\D/g, "").length <= 11) {
                            field.onChange(formatted)
                          }
                        }}
                        maxLength={15}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <Label>WhatsApp *</Label>
                    <FormControl>
                      <Input
                        placeholder="(00) 00000-0000"
                        className="h-10"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value)
                          if (formatted.replace(/\D/g, "").length <= 11) {
                            field.onChange(formatted)
                          }
                        }}
                        maxLength={15}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Endereço</h3>
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <Label>Endereço Completo *</Label>
                  <FormControl>
                    <Textarea
                      placeholder="Digite o endereço completo com rua, número, bairro, cidade e CEP"
                      className="resize-none min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* CNH */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-900">Carteira Nacional de Habilitação</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="license_number"
                render={({ field }) => (
                  <FormItem>
                    <Label>Número da CNH *</Label>
                    <FormControl>
                      <Input
                        placeholder="12345678901"
                        className="h-10"
                        {...field}
                        maxLength={11}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="license_category"
                render={({ field }) => (
                  <FormItem>
                    <Label>Categoria *</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {licenseCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="license_expiry_date"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-2">
                      <Label>Validade da CNH *</Label>
                      {field.value && (
                        <div className="flex gap-1">
                          {isLicenseExpired(field.value) && (
                            <Badge variant="destructive" className="text-xs">
                              Vencida
                            </Badge>
                          )}
                          {isLicenseExpiringSoon(field.value) && !isLicenseExpired(field.value) && (
                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                              Vence em breve
                            </Badge>
                          )}
                          {!isLicenseExpired(field.value) && !isLicenseExpiringSoon(field.value) && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              Válida
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-10",
                              !field.value && "text-muted-foreground",
                              field.value && isLicenseExpired(field.value) && "border-red-300 bg-red-50 text-red-700"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* CNH Status Alert */}
            {form.watch("license_expiry_date") && (
              <div className="mt-4">
                {isLicenseExpired(form.watch("license_expiry_date")) ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      CNH vencida. O condutor não pode dirigir legalmente.
                    </AlertDescription>
                  </Alert>
                ) : isLicenseExpiringSoon(form.watch("license_expiry_date")) ? (
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
              <h3 className="text-lg font-semibold text-gray-900">Documentos (Opcional)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Foto do Condutor</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setPhotoFile(file)
                      }
                    }}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {photoFile ? (
                      <div className="flex items-center gap-2">
                        <div className="text-center">
                          <p className="text-sm font-medium text-green-600">
                            {photoFile.name}
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
                            e.preventDefault()
                            setPhotoFile(null)
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
                          Clique para selecionar uma foto
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG até 10MB
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
                      const file = e.target.files?.[0]
                      if (file) {
                        setCnhFile(file)
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
                            e.preventDefault()
                            setCnhFile(null)
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

          {/* Submit Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Campos obrigatórios
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="px-8 py-2 h-11 min-w-[160px]"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                submitButtonText
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}