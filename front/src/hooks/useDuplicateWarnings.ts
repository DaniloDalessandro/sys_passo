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

  // Refs to store timeout IDs for debouncing
  const timeoutRefs = useRef<{
    cpf?: NodeJS.Timeout;
    email?: NodeJS.Timeout;
    license_number?: NodeJS.Timeout;
  }>({});

  // Function to clear all timeouts
  const clearTimeouts = useCallback(() => {
    Object.values(timeoutRefs.current).forEach(timeout => {
      if (timeout) clearTimeout(timeout);
    });
    timeoutRefs.current = {};
  }, []);

  // Function to check for duplicates with debouncing
  const checkDuplicate = useCallback(
    (field: 'cpf' | 'email' | 'license_number', value: string) => {
      // Clear existing timeout for this field
      if (timeoutRefs.current[field]) {
        clearTimeout(timeoutRefs.current[field]);
      }

      // Reset warning state for this field
      setWarnings(prev => ({
        ...prev,
        [field]: { exists: false, isLoading: false }
      }));

      // Skip validation if value is empty or too short
      if (!value || value.trim().length < 3) {
        return;
      }

      // Set loading state
      setWarnings(prev => ({
        ...prev,
        [field]: { exists: false, isLoading: true }
      }));

      // Set new timeout for debounced API call
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
        } catch (error) {
          console.error(`Error checking duplicate for ${field}:`, error);
          setWarnings(prev => ({
            ...prev,
            [field]: { exists: false, isLoading: false }
          }));
        }
      }, DEBOUNCE_DELAY);
    },
    [checkDuplicateField, excludeId]
  );

  // Function to clear warnings for a specific field
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

  // Function to clear all warnings
  const clearAllWarnings = useCallback(() => {
    clearTimeouts();
    setWarnings({
      cpf: { exists: false, isLoading: false },
      email: { exists: false, isLoading: false },
      license_number: { exists: false, isLoading: false },
    });
  }, [clearTimeouts]);

  // Cleanup timeouts on unmount
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