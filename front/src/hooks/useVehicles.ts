import { useState, useEffect } from 'react';

export interface Vehicle {
  id: number;
  plate: string;
  placa: string;
  model: string;
  modelo: string;
  brand: string;
  marca: string;
  year: number;
  ano: number;
  color: string;
  cor: string;
  chassis_number: string;
  chassi: string;
  renavam: string;
  fuel_type: string;
  combustivel: string;
  passenger_capacity: number;
  capacidade: number;
  category: string;
  categoria: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
  created_by_username?: string;
  updated_by_username?: string;
  status: 'ativo' | 'inativo';
  kmRodados?: number;
  proximaManutencao?: string;
  ultimaManutencao?: string;
  condutores?: any[];
  photo_1?: string | null;
  photo_2?: string | null;
  photo_3?: string | null;
  photo_4?: string | null;
  photo_5?: string | null;
}

export interface VehicleFormData {
  placa?: string;
  marca?: string;
  modelo?: string;
  ano?: number;
  cor?: string;
  chassi?: string;
  renavam?: string;
  combustivel?: string;
  capacidade?: number;
  categoria?: string;
  status?: string;
  conductors?: string[];
  photo_1?: File | null;
  photo_2?: File | null;
  photo_3?: File | null;
  photo_4?: File | null;
  photo_5?: File | null;
}

const mockVehicles: Vehicle[] = [
  {
    id: 1,
    plate: "ABC-1234",
    placa: "ABC-1234",
    model: "Sprinter",
    modelo: "Sprinter",
    brand: "Mercedes-Benz",
    marca: "Mercedes-Benz",
    year: 2020,
    ano: 2020,
    color: "Branco",
    cor: "Branco",
    chassis_number: "9BW123456789ABC01",
    chassi: "9BW123456789ABC01",
    renavam: "12345678901",
    fuel_type: "Diesel",
    combustivel: "Diesel",
    passenger_capacity: 16,
    capacidade: 16,
    category: "Van",
    categoria: "Van",
    is_active: true,
    status: "ativo",
    kmRodados: 45000,
    proximaManutencao: "2024-10-15",
    ultimaManutencao: "2024-08-15",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-09-18T15:45:00Z",
    created_by: 1,
    updated_by: 1,
  },
  {
    id: 2,
    plate: "DEF-5678",
    placa: "DEF-5678",
    model: "Constellation",
    modelo: "Constellation",
    brand: "Volkswagen",
    marca: "Volkswagen",
    year: 2019,
    ano: 2019,
    color: "Azul",
    cor: "Azul",
    chassis_number: "9BW123456789ABC02",
    chassi: "9BW123456789ABC02",
    renavam: "12345678902",
    fuel_type: "Diesel",
    combustivel: "Diesel",
    passenger_capacity: 5,
    capacidade: 5,
    category: "Caminhão",
    categoria: "Caminhão",
    is_active: false,
    status: "inativo",
    kmRodados: 98000,
    proximaManutencao: "2024-09-20",
    ultimaManutencao: "2024-07-20",
    created_at: "2024-02-10T14:20:00Z",
    updated_at: "2024-09-15T09:30:00Z",
    created_by: 1,
    updated_by: 2,
  },
  {
    id: 3,
    plate: "GHI-9012",
    placa: "GHI-9012",
    model: "Daily",
    modelo: "Daily",
    brand: "Iveco",
    marca: "Iveco",
    year: 2021,
    ano: 2021,
    color: "Prata",
    cor: "Prata",
    chassis_number: "9BW123456789ABC03",
    chassi: "9BW123456789ABC03",
    renavam: "12345678903",
    fuel_type: "Diesel",
    combustivel: "Diesel",
    passenger_capacity: 12,
    capacidade: 12,
    category: "Van",
    categoria: "Van",
    is_active: true,
    status: "ativo",
    kmRodados: 32000,
    proximaManutencao: "2024-11-30",
    ultimaManutencao: "2024-08-30",
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
