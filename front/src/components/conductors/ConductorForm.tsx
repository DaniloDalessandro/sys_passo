"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  CalendarIcon,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Upload,
  FileText,
  Image,
  X,
  Users,
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
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

const conductorSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(150, "Nome deve ter no máximo 150 caracteres"),
  cpf: z.string().min(11, "CPF é obrigatório").refine((cpf) => {
    const numbers = cpf.replace(/\D/g, "")
    return numbers.length === 11
  }, "CPF deve ter 11 dígitos"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Telefone/Celular é obrigatório"),
  birth_date: z.date({
    required_error: "Data de nascimento é obrigatória",
  }),
  license_number: z.string().min(1, "Número da CNH é obrigatório"),
  license_category: z.string().min(1, "Categoria da CNH é obrigatória"),
  license_expiry_date: z.date({
    required_error: "Data de validade da CNH é obrigatória",
  }),
  address: z.string().min(1, "Endereço Completo é obrigatório"),
  gender: z.enum(["M", "F", "O"], {
    required_error: "Gênero é obrigatório",
  }),
  nationality: z.string().min(1, "Nacionalidade é obrigatória").default("Brasileira"),
  whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
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
    <div className="w-full max-w-none">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20 py-3 mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-semibold text-sm">Erro no cadastro</AlertTitle>
          <AlertDescription className="mt-1 text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 lg:space-y-6">
          <div className="space-y-4 lg:space-y-6">
            {/* Seção: Dados Pessoais */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-3 lg:pb-4">
                <CardTitle className="text-base lg:text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <User className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 flex-shrink-0" />
                  Dados Pessoais
                </CardTitle>
                <CardDescription className="text-xs lg:text-sm text-gray-600">
                  Informações básicas do condutor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5 lg:space-y-2">
                        <Label className="text-sm font-medium text-gray-700 block">Nome Completo *</Label>
                        <FormControl>
                          <Input
                            placeholder="Digite o nome completo"
                            className="h-9 lg:h-10 text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5 lg:space-y-2">
                        <Label className="text-sm font-medium text-gray-700 block">CPF *</Label>
                        <FormControl>
                          <Input
                            placeholder="000.000.000-00"
                            className="h-9 lg:h-10 text-sm"
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
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5 lg:space-y-2">
                        <Label className="text-sm font-medium text-gray-700 block">Email *</Label>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@exemplo.com"
                            className="h-9 lg:h-10 text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5 lg:space-y-2">
                        <Label className="text-sm font-medium text-gray-700 block">Telefone/Celular *</Label>
                        <FormControl>
                          <Input
                            placeholder="(00) 00000-0000"
                            className="h-9 lg:h-10 text-sm"
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
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  <FormField
                    control={form.control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5 lg:space-y-2">
                        <Label className="text-sm font-medium text-gray-700 block text-xs lg:text-sm">Data de Nascimento *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-9 lg:h-10 text-sm",
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
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5 lg:space-y-2">
                        <Label className="text-sm font-medium text-gray-700 block">Gênero *</Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9 lg:h-10 text-sm">
                              <SelectValue placeholder="Selecione o gênero" />
                            </SelectTrigger>
                          </FormControl>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Feminino</SelectItem>
                          <SelectItem value="O">Outro</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5 lg:space-y-2">
                        <Label className="text-sm font-medium text-gray-700 block">WhatsApp *</Label>
                      <FormControl>
                        <Input
                          placeholder="(00) 00000-0000"
                          className="h-9 lg:h-10 text-sm"
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
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5 lg:space-y-2">
                        <Label className="text-sm font-medium text-gray-700 block">Nacionalidade *</Label>
                        <FormControl>
                          <Input
                            placeholder="Brasileira"
                            className="h-9 lg:h-10 text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 block">Endereço Completo *</Label>
                      <FormControl>
                        <Textarea
                          placeholder="Digite o endereço completo"
                          className="resize-none min-h-[60px] lg:min-h-[80px] text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Seção: Dados da CNH */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-3 lg:pb-4">
                <CardTitle className="text-base lg:text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 lg:h-5 lg:w-5 text-green-600 flex-shrink-0" />
                  <span className="truncate">Carteira Nacional de Habilitação</span>
                </CardTitle>
                <CardDescription className="text-xs lg:text-sm text-gray-600">
                  Informações da CNH do condutor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  <FormField
                    control={form.control}
                    name="license_number"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5 lg:space-y-2">
                        <Label className="text-sm font-medium text-gray-700 block">Número da CNH *</Label>
                        <FormControl>
                          <Input
                            placeholder="12345678901"
                            className="h-9 lg:h-10 text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="license_category"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5 lg:space-y-2">
                        <Label className="text-sm font-medium text-gray-700 block">Categoria *</Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9 lg:h-10 text-sm">
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
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="license_expiry_date"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5 lg:space-y-2">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-gray-700 block">
                            Validade da CNH *
                          </Label>
                          <div className="flex flex-wrap gap-1">
                            {field.value && isLicenseExpired(field.value) && (
                              <Badge variant="destructive" className="text-xs px-2 py-0.5">
                                Vencida
                              </Badge>
                            )}
                            {field.value && isLicenseExpiringSoon(field.value) && (
                              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-700">
                                Vence em breve
                              </Badge>
                            )}
                          </div>
                        </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-9 lg:h-10 text-sm",
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
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

              {/* License Status Info */}
              {form.watch("license_expiry_date") && (
                <div>
                  {isLicenseExpired(form.watch("license_expiry_date")) ? (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>CNH Vencida</AlertTitle>
                      <AlertDescription>
                        Esta CNH está vencida e o condutor não pode dirigir legalmente.
                      </AlertDescription>
                    </Alert>
                  ) : isLicenseExpiringSoon(form.watch("license_expiry_date")) ? (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <AlertTitle className="text-yellow-800">
                        CNH Vencendo em Breve
                      </AlertTitle>
                      <AlertDescription className="text-yellow-700">
                        Esta CNH vence em menos de 30 dias.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="border-emerald-200 bg-emerald-50">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <AlertTitle className="text-emerald-800">
                        CNH Válida
                      </AlertTitle>
                      <AlertDescription className="text-emerald-700">
                        Esta CNH está dentro da validade.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
              </CardContent>
            </Card>

            {/* Seção: Documentos */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-3 lg:pb-4">
                <CardTitle className="text-base lg:text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600 flex-shrink-0" />
                  Documentos
                </CardTitle>
                <CardDescription className="text-xs lg:text-sm text-gray-600">
                  Upload de documentos do condutor (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {/* Photo Upload */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 block">Foto da Pessoa</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 lg:p-6 text-center hover:border-gray-400 transition-colors">
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
                          <div>
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
                            className="ml-2 h-6 w-6 p-0 text-red-500 hover:text-red-700"
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
                    <Label className="text-sm font-medium text-gray-700 block">CNH Digital</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 lg:p-6 text-center hover:border-gray-400 transition-colors">
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
                          <div>
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
                            className="ml-2 h-6 w-6 p-0 text-red-500 hover:text-red-700"
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
              </CardContent>
            </Card>
          </div>

          {/* Submit Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 lg:gap-4 pt-4 lg:pt-6 border-t border-gray-200">
            <div className="text-xs lg:text-sm text-gray-600">
              <span className="text-red-500">*</span> Campos obrigatórios
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="px-6 lg:px-8 py-2 h-10 lg:h-11 min-w-[140px] lg:min-w-[160px] text-sm lg:text-base"
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