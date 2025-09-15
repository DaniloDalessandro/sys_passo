"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ManagementCenterForm from "@/components/forms/ManagementCenterForm";
import RequestingCenterForm from "@/components/forms/RequestingCenterForm";
import { ManagementCenterFormData, RequestingCenterFormData } from "@/lib/schemas/center-schemas";

export default function TestValidationPage() {
  const [showManagementForm, setShowManagementForm] = useState(false);
  const [showRequestingForm, setShowRequestingForm] = useState(false);

  // Mock de dados existentes para teste de duplicação
  const existingManagementNames = ["CENTRO GESTOR A", "CENTRO GESTOR B", "MINERVA"];
  const existingRequestingNames = ["CENTRO SOLICITANTE A", "CENTRO SOLICITANTE B"];

  const handleManagementSubmit = (data: ManagementCenterFormData & { id?: number }) => {
    console.log("✅ Centro Gestor válido:", data);
    alert(`✅ Centro Gestor criado: ${data.name}`);
    setShowManagementForm(false);
  };

  const handleRequestingSubmit = (data: RequestingCenterFormData & { id?: number }) => {
    console.log("✅ Centro Solicitante válido:", data);
    alert(`✅ Centro Solicitante criado: ${data.name}`);
    setShowRequestingForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">
            🧪 Teste de Validação Zod
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-700">
                📋 Validações Implementadas
              </h2>
              
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Nome obrigatório (mínimo 2 caracteres)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Deve conter <strong>pelo menos 2 letras</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Máximo 100 caracteres para nome</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Máximo 500 caracteres para descrição</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">🚫</span>
                  <span><strong>Nomes duplicados não permitidos</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">🔴</span>
                  <span><strong>Mensagens de erro em vermelho</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">🔤</span>
                  <span>Conversão automática para maiúsculo</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-yellow-700">
                🧪 Cenários de Teste
              </h2>
              
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="font-medium text-red-600">❌ Casos que devem dar erro:</h3>
                  <ul className="mt-1 ml-4 space-y-1">
                    <li>• Digite apenas "A" (muito pequeno)</li>
                    <li>• Digite apenas "123" (sem letras suficientes)</li>
                    <li>• Digite "CENTRO GESTOR A" (duplicado)</li>
                    <li>• Digite "MINERVA" (duplicado)</li>
                    <li>• Deixe o campo vazio (obrigatório)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-green-600">✅ Casos que devem funcionar:</h3>
                  <ul className="mt-1 ml-4 space-y-1">
                    <li>• Digite "NOVO CENTRO AB"</li>
                    <li>• Digite "CENTRO XY"</li>
                    <li>• Digite "VALIDACAO 123 OK"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowManagementForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              size="lg"
            >
              🏢 Testar Centro Gestor
            </Button>
            
            <Button 
              onClick={() => setShowRequestingForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              size="lg"
            >
              📋 Testar Centro Solicitante
            </Button>
          </div>

          <div className="mt-6 bg-gray-100 p-4 rounded-lg">
            <p className="text-center text-gray-600">
              💡 <strong>Dica:</strong> Abra o Console (F12) para ver os logs detalhados das validações
            </p>
          </div>
        </div>
      </div>

      {/* Formulários */}
      <ManagementCenterForm
        open={showManagementForm}
        handleClose={() => setShowManagementForm(false)}
        initialData={null}
        onSubmit={handleManagementSubmit}
        existingNames={existingManagementNames}
      />

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