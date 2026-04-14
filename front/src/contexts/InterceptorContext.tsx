"use client";

import { useEffect, useRef } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { buildApiUrl } from "@/lib/api-client";

// Flag global para serializar tentativas de refresh simultâneas; evita múltiplas chamadas paralelas ao endpoint de refresh
let isRefreshing = false;
// Fila de requisições que falharam com 401 aguardando o novo token ser obtido
let failedQueue: any[] = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

export function InterceptorProvider({ children }: { children: React.ReactNode }) {
  const authContext = useAuthContext();
  const originalFetch = useRef<typeof window.fetch | null>(null);
  const interceptorSetup = useRef(false);

  // Ref mantém referência estável ao contexto sem recriar o interceptor quando os callbacks mudam
  const authContextRef = useRef(authContext);

  useEffect(() => {
    authContextRef.current = authContext;
  }, [authContext]);

  useEffect(() => {
    if (interceptorSetup.current) {
      return;
    }
    interceptorSetup.current = true;

    if (originalFetch.current === null) {
      originalFetch.current = window.fetch;
    }

    const newFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const fetcher = originalFetch.current;
      if (!fetcher) {
        throw new Error("Função fetch original não encontrada.");
      }

      const { refreshAccessToken, logout } = authContextRef.current;

      // Tokens HttpOnly são enviados automaticamente pelo navegador;
      // credentials='include' é obrigatório para que os cookies sejam encaminhados
      const newInit: RequestInit = {
        ...init,
        credentials: init?.credentials ?? 'include',
      };

      let response = await fetcher(input, newInit);

      const url = typeof input === 'string' ? input : input.toString();
      const isRefreshRequest = url.includes('/api/auth/refresh/');
      const isAuthRequest = url.includes('/api/auth/login/') || url.includes('/api/auth/register/');

      if (response.status === 401 && !isRefreshRequest && !isAuthRequest) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: () => resolve(fetcher(input, newInit)),
              reject,
            });
          });
        }

        isRefreshing = true;

        try {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            processQueue(null);
            return await fetcher(input, newInit);
          } else {
            const error = new Error("Sessão expirada. Por favor, faça login novamente.");
            processQueue(error);
            logout();
            return Promise.reject(error);
          }
        } catch (error: any) {
          processQueue(error);
          logout();
          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      }

      return response;
    };

    window.fetch = newFetch;

    return () => {
      if (originalFetch.current) {
        window.fetch = originalFetch.current;
      }
      interceptorSetup.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
