"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { managementCenterSchema, ManagementCenterFormData } from "@/lib/schemas/center-schemas";

export default function DemoValidationPage() {
  const [submittedData, setSubmittedData] = useState<ManagementCenterFormData | null>(null);
  
  // Mock de nomes existentes para testar duplicação
  const existingNames = ["CENTRO GESTOR A", "CENTRO GESTOR B", "MINERVA", "TESTE"];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    watch,
  } = useForm<ManagementCenterFormData>({
    resolver: zodResolver(managementCenterSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const watchedName = watch("name");

  // Simula a validação de duplicatas (sem API)
  const checkDuplicate = (name: string) => {
    if (!name.trim() || name.trim().length < 2) {
      clearErrors("name");
      return;
    }

    const isDuplicate = existingNames.some(
      existing => existing.toLowerCase() === name.trim().toLowerCase()
    );

    if (isDuplicate) {
      setError("name", {
        type: "manual",
        message: "Este nome já está sendo usado por outro centro gestor",
      });
    } else {
      clearErrors("name");
    }
  };

  // Debounce para validação
  React.useEffect(() => {
    if (!watchedName) return;

    const timeoutId = setTimeout(() => {
      checkDuplicate(watchedName);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedName]);

  const onSubmit = (data: ManagementCenterFormData) => {
    // Final validation
    const isDuplicate = existingNames.some(
      existing => existing.toLowerCase() === data.name.trim().toLowerCase()
    );

    if (isDuplicate) {
      setError("name", {
        type: "manual",
        message: "Este nome já está sendo usado por outro centro gestor",
      });
      return;
    }

    setSubmittedData(data);
    alert(`✅ Centro Gestor criado: ${data.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-indigo-800">
            🧪 Demo de Validação Zod
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Teste a validação em tempo real com mensagens vermelhas
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-amber-800 mb-2">📝 Nomes já existentes (para testar duplicação):</h3>
            <div className="flex flex-wrap gap-2">
              {existingNames.map((name) => (
                <span key={name} className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm font-medium">
                  {name}
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Centro Gestor *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Digite o nome (será convertido para maiúsculo)"
                className={errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                style={{ textTransform: 'uppercase' }}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                  register("name").onChange(e);
                }}
              />
              {errors.name && (
                <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                  <div className="flex items-center">
                    <span className="text-red-500 text-lg mr-2">⚠️</span>
                    <p className="text-sm text-red-700 font-medium">
                      {errors.name.message}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                {...register("description")}
                placeholder="Descrição do centro gestor"
                className={errors.description ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.description && (
                <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                  <div className="flex items-center">
                    <span className="text-red-500 text-lg mr-2">⚠️</span>
                    <p className="text-sm text-red-700 font-medium">
                      {errors.description.message}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-lg"
            >
              ✅ Criar Centro Gestor
            </Button>
          </form>

          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-3">🧪 Cenários de Teste:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-red-500">❌</span>
                <span><strong>Digite "A"</strong> → Erro: muito pequeno</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500">❌</span>
                <span><strong>Digite "123"</strong> → Erro: sem letras suficientes</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500">❌</span>
                <span><strong>Digite "MINERVA"</strong> → Erro: nome duplicado</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✅</span>
                <span><strong>Digite "NOVO CENTRO"</strong> → Sucesso</span>
              </div>
            </div>
          </div>

          {submittedData && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ Dados Enviados com Sucesso:</h3>
              <pre className="text-sm text-green-700 bg-green-100 p-2 rounded">
                {JSON.stringify(submittedData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}