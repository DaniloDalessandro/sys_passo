"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Conductor } from "@/types/conductor";
import { LICENSE_CATEGORIES } from "@/constants/license-categories";
import { Camera, Upload } from "lucide-react";

const conductorSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  cpf: z.string().min(11, "O CPF deve ter 11 dígitos.").max(14, "O CPF deve ter no máximo 14 caracteres."),
  birth_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data de nascimento inválida.",
  }),
  gender: z.enum(["M", "F", "O"]),
  nationality: z.string().min(3, "A nacionalidade deve ter pelo menos 3 caracteres."),
  street: z.string().min(3, "A rua deve ter pelo menos 3 caracteres."),
  number: z.string().min(1, "O número é obrigatório."),
  neighborhood: z.string().min(3, "O bairro deve ter pelo menos 3 caracteres."),
  city: z.string().min(3, "A cidade deve ter pelo menos 3 caracteres."),
  reference_point: z.string().optional(),
  phone: z.string().min(10, "O telefone deve ter pelo menos 10 dígitos."),
  email: z.string().email("Email inválido."),
  whatsapp: z.string().optional(),
  license_number: z.string().min(5, "O número da CNH deve ter pelo menos 5 caracteres."),
  license_category: z.string(),
  license_expiry_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data de validade da CNH inválida.",
  }),
  document: z.any().optional(),
  cnh_digital: z.any().optional(),
  photo: z.any().optional(),
});

type ConductorFormData = z.infer<typeof conductorSchema>;

interface ConductorFormProps {
  onSubmit: (data: ConductorFormData) => void;
  conductor?: Conductor;
  className?: string;
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
  optional,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {optional && <span className="text-gray-400 font-normal ml-1">(opcional)</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function FileUploadField({
  id,
  accept,
  label,
  optional,
  error,
  registerProps,
}: {
  id: string;
  accept: string;
  label: string;
  optional?: boolean;
  error?: string;
  registerProps: object;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {optional && <span className="text-gray-400 font-normal ml-1">(opcional)</span>}
      </Label>
      <label
        htmlFor={id}
        className="relative flex flex-col items-center justify-center gap-1.5 px-4 py-5 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
      >
        <Upload className="w-5 h-5 text-gray-400" />
        <span className="text-xs text-gray-500">Clique ou arraste o arquivo</span>
        <input id={id} type="file" accept={accept} className="sr-only" {...registerProps} />
      </label>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function ConductorForm({
  onSubmit,
  conductor,
  className,
  showPhotoPreview = false,
  submitButtonText = "Salvar",
  ...props
}: ConductorFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ConductorFormData>({
    resolver: zodResolver(conductorSchema),
    defaultValues: {
      ...conductor,
      birth_date: conductor?.birth_date
        ? new Date(conductor.birth_date).toISOString().split("T")[0]
        : "",
      license_expiry_date: conductor?.license_expiry_date
        ? new Date(conductor.license_expiry_date).toISOString().split("T")[0]
        : "",
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("space-y-6", className)}
      {...props}
    >
      {showPhotoPreview && (
        <div className="flex items-center gap-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-8 h-8 text-gray-300" />
              )}
            </div>
            <label
              htmlFor="photo-input"
              className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 cursor-pointer shadow-md transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
            </label>
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              className="sr-only"
              {...register("photo")}
              onChange={(e) => {
                register("photo").onChange(e);
                handlePhotoChange(e);
              }}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Foto do Motorista</p>
            <p className="text-xs text-gray-400 mt-0.5">JPG ou PNG, máx. 5 MB</p>
          </div>
        </div>
      )}

      <div>
        <SectionHeader>Dados Pessoais</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-4">
            <Field label="Nome Completo" error={errors.name?.message}>
              <Input placeholder="Nome completo do motorista" {...register("name")} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="CPF" error={errors.cpf?.message}>
              <Input placeholder="000.000.000-00" {...register("cpf")} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Data de Nascimento" error={errors.birth_date?.message}>
              <Input type="date" {...register("birth_date")} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Sexo" error={errors.gender?.message}>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                      <SelectItem value="O">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Nacionalidade" error={errors.nationality?.message}>
              <Input placeholder="Brasileira" {...register("nationality")} />
            </Field>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <SectionHeader>Endereço</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-4">
            <Field label="Rua / Avenida" error={errors.street?.message}>
              <Input placeholder="Ex: Rua das Flores" {...register("street")} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Número" error={errors.number?.message}>
              <Input placeholder="Ex: 123" {...register("number")} />
            </Field>
          </div>
          <div className="md:col-span-3">
            <Field label="Bairro" error={errors.neighborhood?.message}>
              <Input placeholder="Ex: Centro" {...register("neighborhood")} />
            </Field>
          </div>
          <div className="md:col-span-3">
            <Field label="Cidade" error={errors.city?.message}>
              <Input placeholder="Ex: São Paulo" {...register("city")} />
            </Field>
          </div>
          <div className="md:col-span-6">
            <Field label="Ponto de Referência" optional>
              <Input placeholder="Ex: Próximo ao mercado" {...register("reference_point")} />
            </Field>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <SectionHeader>Contato</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Telefone / Celular" error={errors.phone?.message}>
            <Input placeholder="(00) 00000-0000" {...register("phone")} />
          </Field>
          <Field label="E-mail" error={errors.email?.message}>
            <Input type="email" placeholder="email@exemplo.com" {...register("email")} />
          </Field>
          <Field label="WhatsApp" optional>
            <Input placeholder="(00) 00000-0000" {...register("whatsapp")} />
          </Field>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <SectionHeader>Carteira Nacional de Habilitação (CNH)</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Número da CNH" error={errors.license_number?.message}>
            <Input placeholder="00000000000" {...register("license_number")} />
          </Field>
          <Field label="Categoria" error={errors.license_category?.message}>
            <Controller
              name="license_category"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {LICENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Validade" error={errors.license_expiry_date?.message}>
            <Input type="date" {...register("license_expiry_date")} />
          </Field>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <SectionHeader>Documentos</SectionHeader>
        <div className={cn(
          "grid grid-cols-1 gap-4",
          showPhotoPreview ? "md:grid-cols-2" : "md:grid-cols-3"
        )}>
          <FileUploadField
            id="document"
            accept=".pdf"
            label="Documento (PDF)"
            optional
            registerProps={register("document")}
          />
          <FileUploadField
            id="cnh_digital"
            accept=".pdf"
            label="CNH Digital (PDF)"
            optional
            registerProps={register("cnh_digital")}
          />
          {!showPhotoPreview && (
            <FileUploadField
              id="photo-doc"
              accept="image/*"
              label="Foto (JPG/PNG)"
              optional
              registerProps={register("photo")}
            />
          )}
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium"
        >
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
}
