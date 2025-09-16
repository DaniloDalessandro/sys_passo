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
  whatsapp: z.string().optional(),
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
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader className="pb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Cadastro de Condutor
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
                Preencha os dados pessoais e informações da CNH para cadastrar um novo condutor no sistema.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-semibold">Erro no cadastro</AlertTitle>
          <AlertDescription className="mt-1">{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

          {/* Personal Information Section */}
          <Card className="shadow-sm border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Dados Pessoais</CardTitle>
                    <CardDescription className="text-sm">
                      Informações básicas do condutor
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
                  Obrigatório
                </Badge>
              </div>
              <Separator />
            </CardHeader>

            <CardContent className="space-y-6">
              {/* First Row - Name and CPF */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        Nome Completo <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome completo do condutor"
                          className="h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        CPF <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000.000.000-00"
                          className="h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
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
              </div>

              {/* Second Row - Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        Email <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@exemplo.com"
                          className="h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-500">
                        Será usado para comunicações importantes
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        Telefone/Celular <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(00) 00000-0000"
                          className="h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
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
                      <FormDescription className="text-xs text-gray-500">
                        Número principal para contato
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Third Row - Birth Date and Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="birth_date"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                        Data de Nascimento <span className="text-red-500">*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "h-11 w-full pl-3 text-left font-normal justify-start focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy", { locale: ptBR })
                              ) : (
                                <span>Selecione a data de nascimento</span>
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
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        Gênero <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
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
              </div>

              {/* Fourth Row - Nationality and WhatsApp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        Nacionalidade <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brasileira"
                          className="h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-500">
                        Nacionalidade do condutor
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        WhatsApp
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(00) 00000-0000"
                          className="h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
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
                      <FormDescription className="text-xs text-gray-500">
                        Opcional - para contato via WhatsApp
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      Endereço Completo <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Digite o endereço completo (rua, número, bairro, cidade, CEP)"
                        className="resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      Endereço completo para correspondência
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* File Uploads Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mt-8">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Documentos</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Anexe a foto da pessoa e CNH digital
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Photo Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Image className="w-4 h-4 text-gray-500" />
                      Foto da Pessoa
                    </label>
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
                            <Image className="w-8 h-8 text-green-600" />
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
                            <Image className="w-12 h-12 text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
                    <label className="text-sm font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      CNH Digital
                    </label>
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
                            <FileText className="w-8 h-8 text-green-600" />
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
                            <FileText className="w-12 h-12 text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Clique para selecionar PDF da CNH
                            </p>
                            <p className="text-xs text-gray-500">
                              Apenas PDF até 10MB
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Opcional - CNH digital em formato PDF
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* License Information Section */}
          <Card className="shadow-sm border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Carteira Nacional de Habilitação</CardTitle>
                    <CardDescription className="text-sm">
                      Dados da CNH do condutor
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
                  Obrigatório
                </Badge>
              </div>
              <Separator />
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="license_number"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        Número da CNH <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="12345678901"
                          className="h-11 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
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
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-gray-500" />
                        Categoria <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all">
                            <SelectValue placeholder="Selecione a categoria da CNH" />
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
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        Validade da CNH <span className="text-red-500">*</span>
                        {field.value && isLicenseExpired(field.value) && (
                          <Badge variant="destructive" className="ml-2 text-xs px-2 py-0">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Vencida
                          </Badge>
                        )}
                        {field.value && isLicenseExpiringSoon(field.value) && (
                          <Badge variant="secondary" className="ml-2 text-xs px-2 py-0 bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Clock className="w-3 h-3 mr-1" />
                            Vence em breve
                          </Badge>
                        )}
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "h-11 w-full pl-3 text-left font-normal justify-start focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all",
                                !field.value && "text-muted-foreground",
                                field.value && isLicenseExpired(field.value) && "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy", { locale: ptBR })
                              ) : (
                                <span>Selecione a data de validade</span>
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
                      <FormDescription className="text-xs text-gray-500">
                        A CNH deve ter validade futura para ser válida
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* License Status Info */}
              {form.watch("license_expiry_date") && (
                <div className="mt-4">
                  {isLicenseExpired(form.watch("license_expiry_date")) ? (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="text-sm font-medium">CNH Vencida</AlertTitle>
                      <AlertDescription className="text-xs mt-1">
                        Esta CNH está vencida e o condutor não pode dirigir legalmente.
                        É necessário renovar a habilitação antes do cadastro.
                      </AlertDescription>
                    </Alert>
                  ) : isLicenseExpiringSoon(form.watch("license_expiry_date")) ? (
                    <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <AlertTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        CNH Vencendo em Breve
                      </AlertTitle>
                      <AlertDescription className="text-xs mt-1 text-yellow-700 dark:text-yellow-300">
                        Esta CNH vence em menos de 30 dias. Recomenda-se agendar a renovação.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <AlertTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                        CNH Válida
                      </AlertTitle>
                      <AlertDescription className="text-xs mt-1 text-emerald-700 dark:text-emerald-300">
                        Esta CNH está dentro da validade e o condutor pode dirigir legalmente.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Section */}
          <Card className="shadow-sm border-gray-200 dark:border-gray-800">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-red-500 font-medium">*</span> Campos obrigatórios devem ser preenchidos
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 px-6 h-11 min-w-[140px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {submitButtonText}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}