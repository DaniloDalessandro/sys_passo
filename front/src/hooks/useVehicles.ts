import { useState, useEffect } from 'react';

export interface Vehicle {
  id: number;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  cor: string;
  chassi: string;
  renavam: string;
  categoria: string;
  combustivel: string;
  status: string;
  kmRodados: number;
  proximaManutencao: string;
  ultimaManutencao: string;
  capacidade: string;
  proprietario: string;
  created_at: string;
  updated_at: string;
  created_by_username: string;
  updated_by_username: string;
  condutores?: Array<{
    id: number;
    nome: string;
    cpf: string;
    license_category: string;
  }>;
}

export interface VehicleFormData {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  chassi: string;
  renavam: string;
  categoria: string;
  combustivel: string;
  capacidade: string;
  proprietario: string;
  status: string;
}

const mockVehicles: Vehicle[] = [
  {
    id: 1,
    placa: "ABC-1234",
    modelo: "Sprinter",
    marca: "Mercedes-Benz",
    ano: 2020,
    cor: "Branco",
    chassi: "9BW123456789ABC01",
    renavam: "12345678901",
    categoria: "Van",
    combustivel: "Diesel",
    status: "ativo",
    kmRodados: 45000,
    proximaManutencao: "2024-10-15",
    ultimaManutencao: "2024-08-15",
    capacidade: "16 lugares",
    proprietario: "Empresa XYZ Ltda",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-09-18T15:45:00Z",
    created_by_username: "admin",
    updated_by_username: "admin",
    condutores: [
      {
        id: 1,
        nome: "João Silva Santos",
        cpf: "123.456.789-00",
        license_category: "AB"
      },
      {
        id: 2,
        nome: "Maria Oliveira",
        cpf: "987.654.321-00",
        license_category: "D"
      }
    ]
  },
  {
    id: 2,
    placa: "DEF-5678",
    modelo: "Constellation",
    marca: "Volkswagen",
    ano: 2019,
    cor: "Azul",
    chassi: "9BW123456789ABC02",
    renavam: "12345678902",
    categoria: "Caminhão",
    combustivel: "Diesel",
    status: "manutencao",
    kmRodados: 98000,
    proximaManutencao: "2024-09-20",
    ultimaManutencao: "2024-07-20",
    capacidade: "5 toneladas",
    proprietario: "Transportes ABC Ltda",
    created_at: "2024-02-10T14:20:00Z",
    updated_at: "2024-09-15T09:30:00Z",
    created_by_username: "admin",
    updated_by_username: "operador",
    condutores: [
      {
        id: 3,
        nome: "Pedro Santos",
        cpf: "456.789.123-00",
        license_category: "C"
      }
    ]
  },
  {
    id: 3,
    placa: "GHI-9012",
    modelo: "Daily",
    marca: "Iveco",
    ano: 2021,
    cor: "Prata",
    chassi: "9BW123456789ABC03",
    renavam: "12345678903",
    categoria: "Van",
    combustivel: "Diesel",
    status: "ativo",
    kmRodados: 32000,
    proximaManutencao: "2024-11-30",
    ultimaManutencao: "2024-06-30",
    capacidade: "12 lugares",
    proprietario: "Logística Silva Ltda",
    created_at: "2024-03-05T11:15:00Z",
    updated_at: "2024-09-10T16:45:00Z",
    created_by_username: "admin",
    updated_by_username: "admin",
    condutores: []
  }
];

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading vehicles
    setIsLoading(true);
    setTimeout(() => {
      setVehicles(mockVehicles);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getVehicle = async (id: number): Promise<Vehicle> => {
    setIsLoading(true);
    setError(null);

    try {
      // Find vehicle in mock data
      const vehicle = mockVehicles.find(v => v.id === id);
      if (!vehicle) {
        throw new Error('Veículo não encontrado');
      }

      return vehicle;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar veículo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createVehicle = async (data: VehicleFormData): Promise<Vehicle> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newVehicle: Vehicle = {
        id: Math.max(...vehicles.map(v => v.id)) + 1,
        ...data,
        kmRodados: 0,
        proximaManutencao: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ultimaManutencao: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by_username: "admin",
        updated_by_username: "admin",
        condutores: []
      };

      setVehicles(prev => [...prev, newVehicle]);
      return newVehicle;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar veículo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateVehicle = async (id: number, data: VehicleFormData): Promise<Vehicle> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedVehicle: Vehicle = {
        ...vehicles.find(v => v.id === id)!,
        ...data,
        updated_at: new Date().toISOString(),
        updated_by_username: "admin"
      };

      setVehicles(prev => prev.map(v => v.id === id ? updatedVehicle : v));
      return updatedVehicle;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar veículo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVehicle = async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir veículo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    vehicles,
    getVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    isLoading,
    error
  };
};