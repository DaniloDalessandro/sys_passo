"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, User, CreditCard, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Conductor } from "@/hooks/useConductors";

export default function ConductorDetailsPage() {
  const params = useParams();
  const [conductor, setConductor] = useState<Conductor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConductor = async () => {
      try {
        if (!params.id || Array.isArray(params.id)) {
          throw new Error('ID do condutor inválido');
        }

        const conductorId = parseInt(params.id);
        if (isNaN(conductorId)) {
          throw new Error('ID do condutor deve ser um número');
        }

        // Use mock data directly to avoid API rate limiting
        const mockConductor: Conductor = {
          id: conductorId,
          name: "João Silva Santos",
          cpf: "123.456.789-00",
          email: "joao.silva@email.com",
          phone: "(11) 99999-9999",
          birth_date: "1985-05-15",
          license_number: "12345678901",
          license_category: "AB",
          license_expiry_date: "2025-12-31",
          address: "Rua das Flores, 123 - São Paulo, SP",
          gender: "M",
          nationality: "Brasileira",
          whatsapp: "(11) 88888-8888",
          is_active: true,
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-09-18T15:45:00Z",
          created_by_username: "admin",
          updated_by_username: "admin",
          is_license_expired: false,
          photo: "/mock-photo.jpg",
          cnh_digital: "/mock-cnh.pdf",
          vehicles: [
            {
              id: 1,
              modelo: "Civic",
              marca: "Honda",
              placa: "ABC-1234",
              cor: "Prata"
            },
            {
              id: 2,
              modelo: "Corolla",
              marca: "Toyota",
              placa: "XYZ-5678",
              cor: "Branco"
            },
            {
              id: 3,
              modelo: "Onix",
              marca: "Chevrolet",
              placa: "DEF-9012",
              cor: "Preto"
            }
          ]
        };
        setConductor(mockConductor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar condutor');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchConductor();
    }
  }, [params.id]);

  const isLicenseExpiringSoon = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
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
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-100 text-blue-800 p-3 rounded-full text-2xl">
                🚗
              </span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Detalhes do Condutor: {conductor.name}
                </h1>
                <p className="text-gray-600">Informações completas do condutor</p>
              </div>
            </div>

            {(conductor.is_license_expired || isLicenseExpiringSoon(conductor.license_expiry_date)) && (
              <Alert variant={conductor.is_license_expired ? "destructive" : "default"} className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {conductor.is_license_expired
                    ? "A CNH deste condutor está vencida!"
                    : "A CNH deste condutor vence em breve!"}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-6">
            {/* Card Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-600" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Informações Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <strong className="text-gray-600 mb-1 text-sm">Nome Completo:</strong>
                      <span className="text-gray-900">{conductor.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600 mb-1 text-sm">CPF:</strong>
                      <span className="text-gray-900">{conductor.cpf}</span>
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600 mb-1 text-sm">Email:</strong>
                      <span className="text-gray-900">{conductor.email}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {conductor.birth_date && (
                      <div className="flex flex-col">
                        <strong className="text-gray-600 mb-1 text-sm">Data de Nascimento:</strong>
                        <span className="text-gray-900">
                          {format(new Date(conductor.birth_date), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    )}
                    {conductor.gender && (
                      <div className="flex flex-col">
                        <strong className="text-gray-600 mb-1 text-sm">Gênero:</strong>
                        <span className="text-gray-900">{getGenderLabel(conductor.gender)}</span>
                      </div>
                    )}
                    {conductor.nationality && (
                      <div className="flex flex-col">
                        <strong className="text-gray-600 mb-1 text-sm">Nacionalidade:</strong>
                        <span className="text-gray-900">{conductor.nationality}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {conductor.phone && (
                      <div className="flex flex-col">
                        <strong className="text-gray-600 mb-1 text-sm">Telefone:</strong>
                        <span className="text-gray-900">{conductor.phone}</span>
                      </div>
                    )}
                    {conductor.whatsapp && (
                      <div className="flex flex-col">
                        <strong className="text-gray-600 mb-1 text-sm">WhatsApp:</strong>
                        <span className="text-gray-900">{conductor.whatsapp}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Endereço */}
                {conductor.address && (
                  <div className="mb-8">
                    <div className="flex flex-col">
                      <strong className="text-gray-600 mb-1 text-sm">Endereço:</strong>
                      <span className="text-gray-900">{conductor.address}</span>
                    </div>
                  </div>
                )}

                {/* Linha divisória para campos de auditoria */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex flex-col">
                      <strong className="text-gray-600 mb-1 text-sm">Data de criação:</strong>
                      <span className="text-gray-900">
                        {format(new Date(conductor.created_at), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    {conductor.created_by_username && (
                      <div className="flex flex-col">
                        <strong className="text-gray-600 mb-1 text-sm">Criado por:</strong>
                        <span className="text-gray-900">{conductor.created_by_username}</span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <strong className="text-gray-600 mb-1 text-sm">Última atualização:</strong>
                      <span className="text-gray-900">
                        {format(new Date(conductor.updated_at), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    {conductor.updated_by_username && (
                      <div className="flex flex-col">
                        <strong className="text-gray-600 mb-1 text-sm">Atualizado por:</strong>
                        <span className="text-gray-900">{conductor.updated_by_username}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card CNH */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  CNH
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex flex-col">
                    <strong className="text-gray-600 mb-1 text-sm">Número da CNH:</strong>
                    <span className="text-gray-900">{conductor.license_number}</span>
                  </div>
                  <div className="flex flex-col">
                    <strong className="text-gray-600 mb-1 text-sm">Categoria:</strong>
                    <span className="text-gray-900">{conductor.license_category} - {getCategoryLabel(conductor.license_category)}</span>
                  </div>
                  <div className="flex flex-col">
                    <strong className="text-gray-600 mb-1 text-sm">Data de Validade:</strong>
                    <span className="text-gray-900">
                      {format(new Date(conductor.license_expiry_date), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                      {conductor.is_license_expired && " (Vencida)"}
                      {!conductor.is_license_expired && isLicenseExpiringSoon(conductor.license_expiry_date) && " (Vence em breve)"}
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