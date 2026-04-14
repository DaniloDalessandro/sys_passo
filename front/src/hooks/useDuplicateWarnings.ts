"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useConductors } from "./useConductors";

export interface DuplicateWarning {
  exists: boolean;
  message?: string;
  isLoading: boolean;
  duplicateConductor?: {
    id: number;
    name: string;
    cpf: string;
    email: string;
    license_number: string;
    is_active: boolean;
  };
}

export interface DuplicateWarnings {
  cpf: DuplicateWarning;
  email: DuplicateWarning;
  license_number: DuplicateWarning;
}

const DEBOUNCE_DELAY = 500; // 500ms

export function useDuplicateWarnings(excludeId?: number) {
  const { checkDuplicateField } = useConductors();

  const [warnings, setWarnings] = useState<DuplicateWarnings>({
    cpf: { exists: false, isLoading: false },
    email: { exists: false, isLoading: false },
    license_number: { exists: false, isLoading: false },
  });

  const timeoutRefs = useRef<{
    cpf?: NodeJS.Timeout;
    email?: NodeJS.Timeout;
    license_number?: NodeJS.Timeout;
  }>({});

  const clearTimeouts = useCallback(() => {
    Object.values(timeoutRefs.current).forEach(timeout => {
      if (timeout) clearTimeout(timeout);
    });
    timeoutRefs.current = {};
  }, []);

  const checkDuplicate = useCallback(
    (field: 'cpf' | 'email' | 'license_number', value: string) => {
      if (timeoutRefs.current[field]) {
        clearTimeout(timeoutRefs.current[field]);
      }

      setWarnings(prev => ({
        ...prev,
        [field]: { exists: false, isLoading: false }
      }));

      if (!value || value.trim().length < 3) {
        return;
      }

      setWarnings(prev => ({
        ...prev,
        [field]: { exists: false, isLoading: true }
      }));

      timeoutRefs.current[field] = setTimeout(async () => {
        try {
          const result = await checkDuplicateField(field, value, excludeId);

          setWarnings(prev => ({
            ...prev,
            [field]: {
              exists: result.exists,
              message: result.message,
              duplicateConductor: result.duplicateConductor,
              isLoading: false
            }
          }));
        } catch {
          setWarnings(prev => ({
            ...prev,
            [field]: { exists: false, isLoading: false }
          }));
        }
      }, DEBOUNCE_DELAY);
    },
    [checkDuplicateField, excludeId]
  );

  const clearWarning = useCallback((field: 'cpf' | 'email' | 'license_number') => {
    if (timeoutRefs.current[field]) {
      clearTimeout(timeoutRefs.current[field]);
      delete timeoutRefs.current[field];
    }

    setWarnings(prev => ({
      ...prev,
      [field]: { exists: false, isLoading: false }
    }));
  }, []);

  const clearAllWarnings = useCallback(() => {
    clearTimeouts();
    setWarnings({
      cpf: { exists: false, isLoading: false },
      email: { exists: false, isLoading: false },
      license_number: { exists: false, isLoading: false },
    });
  }, [clearTimeouts]);

  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  return {
    warnings,
    checkDuplicate,
    clearWarning,
    clearAllWarnings,
  };
}