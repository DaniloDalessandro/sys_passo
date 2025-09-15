"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { 
  directionSchema, 
  managementSchema, 
  coordinationSchema, 
  DirectionFormData,
  ManagementFormData,
  CoordinationFormData
} from "@/lib/schemas/sector-schemas";

export default function DemoSectorValidationPage() {
  const [activeForm, setActiveForm] = useState<"direction" | "management" | "coordination">("direction");
  const [submittedData, setSubmittedData] = useState<any>(null);
  
  // Mock de dados existentes para testar duplicação
  const existingDirections = ["DIREÇÃO A", "DIREÇÃO B", "DIREÇÃO TÉCNICA"];
  const existingManagements = ["GERÊNCIA A", "GERÊNCIA B", "GERÊNCIA OPERACIONAL"];
  const existingCoordinations = ["COORDENAÇÃO A", "COORDENAÇÃO B", "COORDENAÇÃO FINANCEIRA"];
  
  // Mock de opções para selects
  const mockDirections = [
    { id: 1, name: "DIREÇÃO TÉCNICA" },
    { id: 2, name: "DIREÇÃO ADMINISTRATIVA" },
    { id: 3, name: "DIREÇÃO COMERCIAL" },
  ];
  
  const mockManagements = [
    { id: 1, name: "GERÊNCIA OPERACIONAL" },
    { id: 2, name: "GERÊNCIA ADMINISTRATIVA" },
    { id: 3, name: "GERÊNCIA COMERCIAL" },
  ];

  // Configuração dos formulários
  const directionForm = useForm<DirectionFormData>({
    resolver: zodResolver(directionSchema),
    defaultValues: { name: "" },
  });

  const managementForm = useForm<ManagementFormData>({
    resolver: zodResolver(managementSchema),
    defaultValues: { name: "", direction_id: 0 },
  });

  const coordinationForm = useForm<CoordinationFormData>({
    resolver: zodResolver(coordinationSchema),
    defaultValues: { name: "", management_id: 0 },
  });

  // Validação de duplicatas
  const checkDuplicateDirection = (name: string) => {
    const isDuplicate = existingDirections.some(
      existing => existing.toLowerCase() === name.trim().toLowerCase()
    );
    if (isDuplicate) {
      directionForm.setError("name", {
        type: "manual",
        message: "Este nome já está sendo usado por outra direção",
      });
    } else {
      directionForm.clearErrors("name");
    }
  };

  const checkDuplicateManagement = (name: string) => {
    const isDuplicate = existingManagements.some(
      existing => existing.toLowerCase() === name.trim().toLowerCase()
    );
    if (isDuplicate) {
      managementForm.setError("name", {
        type: "manual",
        message: "Este nome já está sendo usado por outra gerência nesta direção",
      });
    } else {
      managementForm.clearErrors("name");
    }
  };

  const checkDuplicateCoordination = (name: string) => {
    const isDuplicate = existingCoordinations.some(
      existing => existing.toLowerCase() === name.trim().toLowerCase()
    );
    if (isDuplicate) {
      coordinationForm.setError("name", {
        type: "manual",
        message: "Este nome já está sendo usado por outra coordenação nesta gerência",
      });
    } else {
      coordinationForm.clearErrors("name");
    }
  };

  // Debounce para validação
  const handleNameChange = (name: string, type: "direction" | "management" | "coordination") => {
    setTimeout(() => {
      if (type === "direction") checkDuplicateDirection(name);
      if (type === "management") checkDuplicateManagement(name);
      if (type === "coordination") checkDuplicateCoordination(name);
    }, 500);
  };

  const onDirectionSubmit = (data: DirectionFormData) => {
    checkDuplicateDirection(data.name);
    if (!directionForm.formState.errors.name) {
      setSubmittedData({ type: "Direção", data });
      alert(`✅ Direção criada: ${data.name}`);
    }
  };

  const onManagementSubmit = (data: ManagementFormData) => {
    checkDuplicateManagement(data.name);
    if (!managementForm.formState.errors.name) {
      setSubmittedData({ type: "Gerência", data });
      alert(`✅ Gerência criada: ${data.name}`);
    }
  };

  const onCoordinationSubmit = (data: CoordinationFormData) => {
    checkDuplicateCoordination(data.name);
    if (!coordinationForm.formState.errors.name) {
      setSubmittedData({ type: "Coordenação", data });
      alert(`✅ Coordenação criada: ${data.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-indigo-800">
            🏢 Demo de Validação Sector (Zod)
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Teste a validação hierárquica: Direções → Gerências → Coordenações
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-medium text-amber-800 mb-2">📋 Dados Existentes:</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Direções:</strong> {existingDirections.join(", ")}
                </div>
                <div>
                  <strong>Gerências:</strong> {existingManagements.join(", ")}
                </div>
                <div>
                  <strong>Coordenações:</strong> {existingCoordinations.join(", ")}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">🧪 Cenários de Teste:</h3>
              <div className="space-y-1 text-sm">
                <div>❌ Digite "A" (muito pequeno)</div>
                <div>❌ Digite "123" (sem letras suficientes)</div>
                <div>❌ Digite "DIREÇÃO A" (duplicado)</div>
                <div>✅ Digite "NOVA DIREÇÃO" (válido)</div>
              </div>
            </div>
          </div>

          {/* Seletor de formulário */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
              <button
                onClick={() => setActiveForm("direction")}
                className={`px-4 py-2 rounded-md transition-all ${
                  activeForm === "direction"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                Direções
              </button>
              <button
                onClick={() => setActiveForm("management")}
                className={`px-4 py-2 rounded-md transition-all ${
                  activeForm === "management"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                Gerências
              </button>
              <button
                onClick={() => setActiveForm("coordination")}
                className={`px-4 py-2 rounded-md transition-all ${
                  activeForm === "coordination"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                Coordenações
              </button>
            </div>
          </div>

          {/* Formulário de Direção */}
          {activeForm === "direction" && (
            <form onSubmit={directionForm.handleSubmit(onDirectionSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="direction-name">Nome da Direção *</Label>
                <Input
                  id="direction-name"
                  {...directionForm.register("name")}
                  placeholder="Digite o nome da direção"
                  className={directionForm.formState.errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  style={{ textTransform: 'uppercase' }}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                    directionForm.register("name").onChange(e);
                    handleNameChange(e.target.value, "direction");
                  }}
                />
                {directionForm.formState.errors.name && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                    <div className="flex items-center">
                      <span className="text-red-500 text-lg mr-2">⚠️</span>
                      <p className="text-sm text-red-700 font-medium">
                        {directionForm.formState.errors.name.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                ✅ Criar Direção
              </Button>
            </form>
          )}

          {/* Formulário de Gerência */}
          {activeForm === "management" && (
            <form onSubmit={managementForm.handleSubmit(onManagementSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="management-name">Nome da Gerência *</Label>
                <Input
                  id="management-name"
                  {...managementForm.register("name")}
                  placeholder="Digite o nome da gerência"
                  className={managementForm.formState.errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  style={{ textTransform: 'uppercase' }}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                    managementForm.register("name").onChange(e);
                    handleNameChange(e.target.value, "management");
                  }}
                />
                {managementForm.formState.errors.name && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                    <div className="flex items-center">
                      <span className="text-red-500 text-lg mr-2">⚠️</span>
                      <p className="text-sm text-red-700 font-medium">
                        {managementForm.formState.errors.name.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="direction">Direção *</Label>
                <Controller
                  name="direction_id"
                  control={managementForm.control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value.toString()}
                    >
                      <SelectTrigger className={managementForm.formState.errors.direction_id ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione uma direção" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDirections.map((direction) => (
                          <SelectItem key={direction.id} value={direction.id.toString()}>
                            {direction.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {managementForm.formState.errors.direction_id && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                    <div className="flex items-center">
                      <span className="text-red-500 text-lg mr-2">⚠️</span>
                      <p className="text-sm text-red-700 font-medium">
                        {managementForm.formState.errors.direction_id.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                ✅ Criar Gerência
              </Button>
            </form>
          )}

          {/* Formulário de Coordenação */}
          {activeForm === "coordination" && (
            <form onSubmit={coordinationForm.handleSubmit(onCoordinationSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="coordination-name">Nome da Coordenação *</Label>
                <Input
                  id="coordination-name"
                  {...coordinationForm.register("name")}
                  placeholder="Digite o nome da coordenação"
                  className={coordinationForm.formState.errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  style={{ textTransform: 'uppercase' }}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                    coordinationForm.register("name").onChange(e);
                    handleNameChange(e.target.value, "coordination");
                  }}
                />
                {coordinationForm.formState.errors.name && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                    <div className="flex items-center">
                      <span className="text-red-500 text-lg mr-2">⚠️</span>
                      <p className="text-sm text-red-700 font-medium">
                        {coordinationForm.formState.errors.name.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="management">Gerência *</Label>
                <Controller
                  name="management_id"
                  control={coordinationForm.control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value.toString()}
                    >
                      <SelectTrigger className={coordinationForm.formState.errors.management_id ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione uma gerência" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockManagements.map((management) => (
                          <SelectItem key={management.id} value={management.id.toString()}>
                            {management.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {coordinationForm.formState.errors.management_id && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                    <div className="flex items-center">
                      <span className="text-red-500 text-lg mr-2">⚠️</span>
                      <p className="text-sm text-red-700 font-medium">
                        {coordinationForm.formState.errors.management_id.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                ✅ Criar Coordenação
              </Button>
            </form>
          )}

          {submittedData && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ {submittedData.type} Criada com Sucesso:</h3>
              <pre className="text-sm text-green-700 bg-green-100 p-2 rounded">
                {JSON.stringify(submittedData.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}