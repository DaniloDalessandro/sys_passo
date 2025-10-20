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
import { Camera } from "lucide-react";

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
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("space-y-4", className)}
      {...props}
    >
      {showPhotoPreview && (
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-4 border-gray-200">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <label
              htmlFor="photo-input"
              className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition-colors"
            >
              <Camera className="w-5 h-5" />
            </label>
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              className="hidden"
              {...register("photo")}
              onChange={(e) => {
                register("photo").onChange(e);
                handlePhotoChange(e);
              }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">Foto (JPG/PNG)</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="md:col-span-2 lg:col-span-3">
          <Label htmlFor="name" className="mb-2 block">Nome Completo</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="cpf" className="mb-2 block">CPF</Label>
          <Input id="cpf" {...register("cpf")} />
          {errors.cpf && <p className="text-red-500 text-sm">{errors.cpf.message}</p>}
        </div>
        <div>
          <Label htmlFor="birth_date" className="mb-2 block">Data de Nascimento</Label>
          <Input id="birth_date" type="date" {...register("birth_date")} />
          {errors.birth_date && (
            <p className="text-red-500 text-sm">{errors.birth_date.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="gender" className="mb-2 block">Sexo</Label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Feminino</SelectItem>
                  <SelectItem value="O">Outro</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}
        </div>
        <div>
          <Label htmlFor="nationality" className="mb-2 block">Nacionalidade</Label>
          <Input id="nationality" {...register("nationality")} />
          {errors.nationality && (
            <p className="text-red-500 text-sm">{errors.nationality.message}</p>
          )}
        </div>
        <div className="lg:col-span-2">
          <Label htmlFor="street" className="mb-2 block">Rua/Avenida</Label>
          <Input id="street" {...register("street")} />
          {errors.street && <p className="text-red-500 text-sm">{errors.street.message}</p>}
        </div>
        <div>
          <Label htmlFor="number" className="mb-2 block">Número</Label>
          <Input id="number" {...register("number")} />
          {errors.number && <p className="text-red-500 text-sm">{errors.number.message}</p>}
        </div>
        <div>
          <Label htmlFor="neighborhood" className="mb-2 block">Bairro</Label>
          <Input id="neighborhood" {...register("neighborhood")} />
          {errors.neighborhood && (
            <p className="text-red-500 text-sm">{errors.neighborhood.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="city" className="mb-2 block">Cidade</Label>
          <Input id="city" {...register("city")} />
          {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
        </div>
        <div className="lg:col-span-3">
          <Label htmlFor="reference_point" className="mb-2 block">Ponto de Referência</Label>
          <Input id="reference_point" {...register("reference_point")} />
        </div>
        <div>
          <Label htmlFor="phone" className="mb-2 block">Telefone/Celular</Label>
          <Input id="phone" {...register("phone")} />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <Label htmlFor="email" className="mb-2 block">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="whatsapp" className="mb-2 block">WhatsApp</Label>
          <Input id="whatsapp" {...register("whatsapp")} />
        </div>
        <div>
          <Label htmlFor="license_number" className="mb-2 block">Número da CNH</Label>
          <Input id="license_number" {...register("license_number")} />
          {errors.license_number && (
            <p className="text-red-500 text-sm">{errors.license_number.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="license_category" className="mb-2 block">Categoria da CNH</Label>
          <Controller
            name="license_category"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {LICENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.license_category && (
            <p className="text-red-500 text-sm">{errors.license_category.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="license_expiry_date" className="mb-2 block">Validade da CNH</Label>
          <Input
            id="license_expiry_date"
            type="date"
            {...register("license_expiry_date")}
          />
          {errors.license_expiry_date && (
            <p className="text-red-500 text-sm">
              {errors.license_expiry_date.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="document" className="mb-2 block">Documento (PDF)</Label>
          <Input id="document" type="file" {...register("document")} />
        </div>
        <div>
          <Label htmlFor="cnh_digital" className="mb-2 block">CNH Digital (PDF)</Label>
          <Input id="cnh_digital" type="file" {...register("cnh_digital")} />
        </div>
        {!showPhotoPreview && (
          <div>
            <Label htmlFor="photo" className="mb-2 block">Foto (JPG/PNG)</Label>
            <Input id="photo" type="file" accept="image/*" {...register("photo")} />
          </div>
        )}
      </div>
      <Button type="submit">{submitButtonText}</Button>
    </form>
  );
}
