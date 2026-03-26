"use client";

import { useEffect, useRef } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

// Flag global para serializar tentativas de refresh simultâneas
let isRefreshing = false;
// Fila de requisições que falharam aguardando o novo token
let failedQueue: any[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export function InterceptorProvider({ children }: { children: React.ReactNode }) {
  const authContext = useAuthContext();
  const originalFetch = useRef<typeof window.fetch | null>(null);
  const interceptorSetup = useRef(false);

  // Ref garante acesso à versão mais recente do contexto dentro do closure do fetch
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

      const token = localStorage.getItem('access_token');
      const headers = new Headers(init?.headers);

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const newInit = { ...init, headers };

      let response = await fetcher(input, newInit);

      const url = typeof input === 'string' ? input : input.toString();
      const isRefreshRequest = url.includes('/api/auth/refresh/');

      if (response.status === 401 && !isRefreshRequest) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (newToken: string) => {
                const newHeaders = new Headers(init?.headers);
                newHeaders.set('Authorization', `Bearer ${newToken}`);
                resolve(fetcher(input, { ...init, headers: newHeaders }));
              },
              reject
            });
          });
        }

        isRefreshing = true;

        try {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            const newToken = localStorage.getItem('access_token');
            processQueue(null, newToken);

            const newHeaders = new Headers(init?.headers);
            if (newToken) {
              newHeaders.set('Authorization', `Bearer ${newToken}`);
            }

            return await fetcher(input, { ...init, headers: newHeaders });
          } else {
            const error = new Error("Sessão expirada. Por favor, faça login novamente.");
            processQueue(error, null);
            logout();
            return Promise.reject(error);
          }
        } catch (error: any) {
          processQueue(error, null);
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
