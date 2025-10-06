import { useState, useEffect } from 'react';

export interface Vehicle {
  id: number;
  plate: string;
  model: string;
  brand: string;
  year: number;
  color: string;
  chassis_number: string;
  renavam: string;
  fuel_type: string;
  passenger_capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
  status: 'ativo' | 'inativo' | 'manutencao';
  kmRodados: number;
  proximaManutencao: string;
}

export interface VehicleFormData {
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  chassis_number: string;
  renavam: string;
  fuel_type: string;
  passenger_capacity: number;
  is_active: boolean;
}

const mockVehicles: Vehicle[] = [
  {
    id: 1,
    plate: "ABC-1234",
    model: "Sprinter",
    brand: "Mercedes-Benz",
    year: 2020,
    color: "Branco",
    chassis_number: "9BW123456789ABC01",
    renavam: "12345678901",
    fuel_type: "Diesel",
    passenger_capacity: 16,
    is_active: true,
    status: "ativo",
    kmRodados: 45000,
    proximaManutencao: "2024-10-15",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-09-18T15:45:00Z",
    created_by: 1,
    updated_by: 1,
  },
  {
    id: 2,
    plate: "DEF-5678",
    model: "Constellation",
    brand: "Volkswagen",
    year: 2019,
    color: "Azul",
    chassis_number: "9BW123456789ABC02",
    renavam: "12345678902",
    fuel_type: "Diesel",
    passenger_capacity: 5,
    is_active: false,
    status: "manutencao",
    kmRodados: 98000,
    proximaManutencao: "2024-09-20",
    created_at: "2024-02-10T14:20:00Z",
    updated_at: "2024-09-15T09:30:00Z",
    created_by: 1,
    updated_by: 2,
  },
  {
    id: 3,
    plate: "GHI-9012",
    model: "Daily",
    brand: "Iveco",
    year: 2021,
    color: "Prata",
    chassis_number: "9BW123456789ABC03",
    renavam: "12345678903",
    fuel_type: "Diesel",
    passenger_capacity: 12,
    is_active: true,
    status: "ativo",
    kmRodados: 32000,
    proximaManutencao: "2024-11-30",
    created_at: "2024-03-05T11:15:00Z",
    updated_at: "2024-09-10T16:45:00Z",
    created_by: 1,
    updated_by: 1,
  }
];

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVehicles(mockVehicles);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const getVehicle = async (id: number): Promise<Vehicle> => {
    setIsLoading(true);
    setError(null);

    try {
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

  return {
    vehicles,
    getVehicle,
    isLoading,
    error,
    fetchVehicles,
  };
};
