import { useState, useCallback } from 'react';
import {
  getDriverRequests,
  getVehicleRequests,
  approveDriverRequest,
  rejectDriverRequest,
  approveVehicleRequest,
  rejectVehicleRequest,
  type DriverRequest,
  type VehicleRequest,
  type RequestFilters,
} from '@/services/requests';

export function useDriverRequests() {
  const [requests, setRequests] = useState<DriverRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async (filters?: RequestFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDriverRequests(filters);
      setRequests(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar solicitações';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approve = useCallback(async (id: number) => {
    try {
      await approveDriverRequest(id);
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err: any) {
      throw err;
    }
  }, []);

  const reject = useCallback(async (id: number, reason: string) => {
    try {
      await rejectDriverRequest(id, reason);
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err: any) {
      throw err;
    }
  }, []);

  return {
    requests,
    isLoading,
    error,
    loadRequests,
    approve,
    reject,
  };
}

export function useVehicleRequests() {
  const [requests, setRequests] = useState<VehicleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async (filters?: RequestFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getVehicleRequests(filters);
      setRequests(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar solicitações';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approve = useCallback(async (id: number) => {
    try {
      await approveVehicleRequest(id);
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err: any) {
      throw err;
    }
  }, []);

  const reject = useCallback(async (id: number, reason: string) => {
    try {
      await rejectVehicleRequest(id, reason);
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err: any) {
      throw err;
    }
  }, []);

  return {
    requests,
    isLoading,
    error,
    loadRequests,
    approve,
    reject,
  };
}
