import { useCallback, useRef } from 'react';

// Função para ler cookies
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Hook para debounce de validação
export function useDebounce<T extends any[]>(
  callback: (...args: T) => void,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { debouncedCallback, cleanup };
}

// Hook para validação de nomes duplicados
export function useDuplicateValidation() {
  const checkManagementCenterDuplicate = async (
    name: string,
    excludeId?: number
  ): Promise<boolean> => {
    if (!name.trim()) return false;

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/center/management-centers/?search=${encodeURIComponent(name.trim())}&page_size=1000`,
        {
          headers: {
            'Authorization': `Bearer ${getCookie('access')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const centers = data.results || [];
        
        return centers.some((center: any) => 
          center.name.toLowerCase() === name.toLowerCase() && 
          center.id !== excludeId
        );
      }
    } catch (error) {
      console.error("Erro ao verificar duplicata de centro gestor:", error);
    }
    return false;
  };

  const checkRequestingCenterDuplicate = async (
    name: string,
    managementCenterId: number,
    excludeId?: number
  ): Promise<boolean> => {
    if (!name.trim() || managementCenterId <= 0) return false;

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/center/requesting-centers/?search=${encodeURIComponent(name.trim())}&page_size=1000`,
        {
          headers: {
            'Authorization': `Bearer ${getCookie('access')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const centers = data.results || [];
        
        return centers.some((center: any) => 
          center.name.toLowerCase() === name.toLowerCase() && 
          center.management_center.id === managementCenterId &&
          center.id !== excludeId
        );
      }
    } catch (error) {
      console.error("Erro ao verificar duplicata de centro solicitante:", error);
    }
    return false;
  };

  return {
    checkManagementCenterDuplicate,
    checkRequestingCenterDuplicate,
  };
}