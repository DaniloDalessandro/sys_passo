"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, User, CreditCard, Car, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Conductor, Vehicle } from "@/hooks/useConductors";
import { useAuthContext } from "@/contexts/AuthContext";

export default function ConductorDetailsPage() {
  const params = useParams();
  const { accessToken } = useAuthContext();
  const [conductor, setConductor] = useState<Conductor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConductor = async () => {
      try {
        if (!params.id || Array.isArray(params.id)) {
          throw new Error('ID do condutor inválido');
        }

        // Clean the ID string - remove any whitespace or special characters
        const cleanId = String(params.id).trim();

        // More robust ID validation
        const conductorId = parseInt(cleanId, 10);

        if (isNaN(conductorId) || conductorId <= 0 || !Number.isInteger(conductorId)) {
          throw new Error(`ID do condutor deve ser um número válido. Recebido: "${params.id}" (limpo: "${cleanId}")`);
        }

        // Check if user is authenticated
        if (!accessToken) {
          throw new Error('Token de acesso não encontrado');
        }

        const response = await fetch(`http://localhost:8000/api/conductors/${conductorId}/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Condutor não encontrado');
          } else if (response.status === 401) {
            throw new Error('Acesso não autorizado');
          } else {
            throw new Error(`Erro ao carregar condutor: ${response.status}`);
          }
        }

        const conductorData = await response.json();

        // Map backend fields to frontend expected format
        const mappedConductor: Conductor = {
          ...conductorData,
          // Backend already provides combined address field through serializer
          address: conductorData.address || 'Endereço não informado',
          // Ensure required fields have default values
          phone: conductorData.phone || '',
          photo: conductorData.photo || undefined,
          document: conductorData.document || undefined,
          cnh_digital: conductorData.cnh_digital || undefined,
          vehicles: conductorData.vehicles || []
        };

        setConductor(mappedConductor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar condutor');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id && accessToken) {
      fetchConductor();
    }
  }, [params.id, accessToken]);

  const isLicenseExpiringSoon = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return false;

      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    } catch {
      return false;
    }
  };

  const getCategoryBadgeVariant = (category: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      'A': 'default',
      'B': 'secondary',
      'C': 'destructive',
      'D': 'outline',
      'E': 'default'
    };
    return variants[category] || 'outline';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'A': 'Motocicleta',
      'B': 'Carro',
      'C': 'Caminhão',
      'D': 'Ônibus',
      'E': 'Carreta',
      'AB': 'A+B',
      'AC': 'A+C',
      'AD': 'A+D',
      'AE': 'A+E'
    };
    return labels[category] || category;
  };

  const getGenderLabel = (gender: string) => {
    const labels: Record<string, string> = {
      'M': 'Masculino',
      'F': 'Feminino',
      'O': 'Outro'
    };
    return labels[gender] || gender;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando detalhes do condutor...</span>
      </div>
    );
  }

  if (error || !conductor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Erro</h1>
          <p className="text-gray-600">{error || 'Condutor não encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="h-full w-full">
        <div className="min-h-screen w-full p-6">
          <div className="space-y-6">
            {(conductor.is_license_expired || (conductor.license_expiry_date && isLicenseExpiringSoon(conductor.license_expiry_date))) && (
              <Alert variant={conductor.is_license_expired ? "destructive" : "default"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {conductor.is_license_expired
                    ? "A CNH deste condutor está vencida!"
                    : "A CNH deste condutor vence em breve!"}
                </AlertDescription>
              </Alert>
            )}
            {/* Card Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-600" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 flex items-center justify-center">
                  {conductor.photo ? (
                    <img src={conductor.photo} alt={`Foto de ${conductor.name}`} className="rounded-lg object-cover w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  {/* Informações Principais */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col">
                      <strong className="text-gray-600 mb-1 text-sm">Nome Completo:</strong>
                      <span className="text-gray-900">{conductor.name || 'Não informado'}</span>
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600 mb-1 text-sm">CPF:</strong>
                      <span className="text-gray-900">{conductor.cpf || 'Não informado'}</span>
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600 mb-1 text-sm">Email:</strong>
                      <span className="text-gray-900">{conductor.email || 'Não informado'}</span>
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600 mb-1 text-sm">Telefone:</strong>
                      <span className="text-gray-900">{conductor.phone || 'Não informado'}</span>
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600 mb-1 text-sm">Data de Nascimento:</strong>
                      <span className="text-gray-900">
                        {conductor.birth_date ? (() => {
                          try {
                            const date = new Date(conductor.birth_date);
                            return isNaN(date.getTime()) ? 'Data inválida' : format(date, "dd/MM/yyyy", { locale: ptBR });
                          } catch {
                            return 'Data inválida';
                          }
                        })() : 'Não informado'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600 mb-1 text-sm">Gênero:</strong>
                      <span className="text-gray-900">{conductor.gender ? getGenderLabel(conductor.gender) : 'Não informado'}</span>
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600 mb-1 text-sm">Nacionalidade:</strong>
                      <span className="text-gray-900">{conductor.nationality || 'Não informado'}</span>
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600 mb-1 text-sm">WhatsApp:</strong>
                      <span className="text-gray-900">{conductor.whatsapp || 'Não informado'}</span>
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600 mb-1 text-sm">Ponto de Referência:</strong>
                      <span className="text-gray-900">{conductor.reference_point || 'Não informado'}</span>
                    </div>
                  </div>

                  {/* Endereço */}
                  {conductor.address && (
                    <div className="mb-6">
                      <div className="flex flex-col">
                        <strong className="text-gray-600 mb-1 text-sm">Endereço:</strong>
                        <span className="text-gray-900">{conductor.address}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Card CNH, Auditoria & Documentos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    CNH
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                      <strong className="text-gray-600 mb-1 text-sm">Número da CNH:</strong>
                      <span className="text-gray-900">{conductor.license_number || 'Não informado'}</span>
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600 mb-1 text-sm">Categoria:</strong>
                      <span className="text-gray-900">
                        {conductor.license_category ?
                          `${conductor.license_category} - ${getCategoryLabel(conductor.license_category)}` :
                          'Não informado'
                        }
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600 mb-1 text-sm">Data de Validade:</strong>
                      <span className="text-gray-900">
                        {conductor.license_expiry_date ? (
                          <>
                            {(() => {
                              try {
                                const date = new Date(conductor.license_expiry_date);
                                return isNaN(date.getTime()) ? 'Data inválida' : format(date, "dd/MM/yyyy", { locale: ptBR });
                              } catch {
                                return 'Data inválida';
                              }
                            })()}
                            {conductor.is_license_expired && " (Vencida)"}
                            {!conductor.is_license_expired && isLicenseExpiringSoon(conductor.license_expiry_date) && " (Vence em breve)"}
                          </>
                        ) : (
                          'Não informado'
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600 mb-1 text-sm">Status do Condutor:</strong>
                      <span className="text-gray-900">{conductor.is_active ? "Ativo" : "Inativo"}</span>
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600 mb-1 text-sm">Status da CNH:</strong>
                      <span className="text-gray-900">{conductor.is_license_expired ? "Vencida" : "Válida"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <User className="h-5 w-5 text-blue-600" />
                    Auditoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <strong className="text-gray-600 mb-1 text-sm">Data de Criação:</strong>
                        <span className="text-gray-900">
                          {(() => {
                            try {
                              const date = new Date(conductor.created_at);
                              return isNaN(date.getTime()) ? 'Data inválida' : format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
                            } catch {
                              return 'Data inválida';
                            }
                          })()}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <strong className="text-gray-600 mb-1 text-sm">Criado por:</strong>
                        <span className="text-gray-900">{conductor.created_by_username || 'Não informado'}</span>
                      </div>
                      <div className="flex flex-col">
                        <strong className="text-gray-600 mb-1 text-sm">Última Atualização:</strong>
                        <span className="text-gray-900">
                          {(() => {
                            try {
                              const date = new Date(conductor.updated_at);
                              return isNaN(date.getTime()) ? 'Data inválida' : format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
                            } catch {
                              return 'Data inválida';
                            }
                          })()}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <strong className="text-gray-600 mb-1 text-sm">Atualizado por:</strong>
                        <span className="text-gray-900">{conductor.updated_by_username || 'Não informado'}</span>
                      </div>
                    </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Documentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {conductor.document ? (
                      <a href={conductor.document} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                        <FileText className="h-4 w-4" />
                        <span>Documento do Condutor</span>
                      </a>
                    ) : (
                      <p className="text-gray-500">Nenhum documento do condutor informado.</p>
                    )}
                    {conductor.cnh_digital ? (
                      <a href={conductor.cnh_digital} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                        <FileText className="h-4 w-4" />
                        <span>CNH Digital</span>
                      </a>
                    ) : (
                      <p className="text-gray-500">Nenhuma CNH digital informada.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Card Veículos Vinculados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Car className="h-5 w-5 text-blue-600" />
                  Veículos Vinculados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {conductor.vehicles && conductor.vehicles.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Marca</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Modelo</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Cor</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Placa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {conductor.vehicles.map((vehicle, index) => (
                          <tr key={vehicle.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            <td className="py-3 px-4 text-gray-900 text-sm">{vehicle.marca}</td>
                            <td className="py-3 px-4 text-gray-900 text-sm">{vehicle.modelo}</td>
                            <td className="py-3 px-4 text-gray-900 text-sm">{vehicle.cor}</td>
                            <td className="py-3 px-4 text-gray-900 text-sm">{vehicle.placa}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum veículo vinculado a este condutor</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}