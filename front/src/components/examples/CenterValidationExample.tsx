"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ManagementCenterForm from "@/components/forms/ManagementCenterForm";
import RequestingCenterForm from "@/components/forms/RequestingCenterForm";
import { ManagementCenter, RequestingCenter } from "@/lib/api/centers";
import { ManagementCenterFormData, RequestingCenterFormData } from "@/lib/schemas/center-schemas";

export default function CenterValidationExample() {
  const [showManagementForm, setShowManagementForm] = useState(false);
  const [showRequestingForm, setShowRequestingForm] = useState(false);

  // Mock de dados existentes para demonstração
  const existingManagementNames = ["CENTRO GESTOR A", "CENTRO GESTOR B"];
  const existingRequestingNames = ["CENTRO SOLICITANTE A", "CENTRO SOLICITANTE B"];

  const handleManagementSubmit = (data: ManagementCenterFormData & { id?: number }) => {
    console.log("✅ Dados válidos do Centro Gestor:", data);
    alert(`Centro Gestor criado/atualizado: ${data.name}`);
    setShowManagementForm(false);
  };

  const handleRequestingSubmit = (data: RequestingCenterFormData & { id?: number }) => {
    console.log("✅ Dados válidos do Centro Solicitante:", data);
    alert(`Centro Solicitante criado/atualizado: ${data.name}`);
    setShowRequestingForm(false);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4">Validação com Zod - Exemplo</h2>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">🎯 Validações Implementadas:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Nome obrigatório com no <strong>mínimo 2 caracteres</strong></li>
              <li>Registro deve conter <strong>pelo menos duas letras</strong></li>
              <li>Máximo 100 caracteres para nome</li>
              <li>Máximo 500 caracteres para descrição</li>
              <li><strong>Validação de duplicatas</strong> (nomes únicos)</li>
              <li><strong>Mensagens de erro em vermelho</strong> abaixo dos campos</li>
              <li>Conversão automática para <strong>maiúsculo</strong></li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">🧪 Testes Sugeridos:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Digite apenas 1 letra (erro: "mais de uma letra")</li>
              <li>Digite apenas números (erro: "pelo menos duas letras")</li>
              <li>Digite "CENTRO GESTOR A" (erro: nome duplicado)</li>
              <li>Deixe campo vazio (erro: obrigatório)</li>
              <li>Digite um nome válido e único (sucesso)</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={() => setShowManagementForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Testar Centro Gestor
            </Button>
            
            <Button 
              onClick={() => setShowRequestingForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Testar Centro Solicitante
            </Button>
          </div>
        </div>
      </div>

      {/* Formulário do Centro Gestor */}
      <ManagementCenterForm
        open={showManagementForm}
        handleClose={() => setShowManagementForm(false)}
        initialData={null}
        onSubmit={handleManagementSubmit}
        existingNames={existingManagementNames}
      />

      {/* Formulário do Centro Solicitante */}
      <RequestingCenterForm
        open={showRequestingForm}
        handleClose={() => setShowRequestingForm(false)}
        initialData={null}
        onSubmit={handleRequestingSubmit}
        existingNames={existingRequestingNames}
      />
    </div>
  );
}