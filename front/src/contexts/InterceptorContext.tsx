"use client";

import { useEffect, useRef } from "react";
import { useAuthContext } from "@/context/AuthContext";

// Flag global para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false;
// Fila de requisições que falharam e estão aguardando o novo token
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

// O provider do contexto agora é mais simples e foca em configurar o interceptor
export function InterceptorProvider({ children }: { children: React.ReactNode }) {
  // USA AuthContext ao invés de useAuth para consistência
  const authContext = useAuthContext();
  const originalFetch = useRef<typeof window.fetch | null>(null);
  const interceptorSetup = useRef(false);

  // CRITICAL FIX: Usar ref para sempre ter a versão mais recente das funções
  const authContextRef = useRef(authContext);

  // Atualiza a ref sempre que o contexto mudar
  useEffect(() => {
    authContextRef.current = authContext;
  }, [authContext]);

  useEffect(() => {
    // CRÍTICO: Configura o interceptor APENAS UMA VEZ
    if (interceptorSetup.current) {
      return;
    }
    interceptorSetup.current = true;

    // Armazena a função fetch original do navegador uma única vez
    if (originalFetch.current === null) {
      originalFetch.current = window.fetch;
    }

    const newFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const fetcher = originalFetch.current;
      if (!fetcher) {
        throw new Error("Função fetch original não encontrada.");
      }

      // FIX: Usar a versão mais recente do contexto através da ref
      const { refreshAccessToken, logout } = authContextRef.current;

      // Adiciona o token de autorização a cada requisição
      const token = localStorage.getItem('access_token');
      const headers = new Headers(init?.headers);

      // FIX: Apenas adiciona o header se houver token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const newInit = { ...init, headers };

      // Faz a requisição original
      let response = await fetcher(input, newInit);

      const url = typeof input === 'string' ? input : input.toString();
      const isRefreshRequest = url.includes('/api/auth/refresh/');

      // Se a requisição falhou com 401 (Não Autorizado) e não é uma requisição de refresh
      if (response.status === 401 && !isRefreshRequest) {
        if (isRefreshing) {
          // Se já existe um refresh em andamento, coloca a requisição na fila de espera
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (newToken: string) => {
                // FIX: Criar novos headers para evitar mutação
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

            // FIX: Criar novos headers para evitar mutação
            const newHeaders = new Headers(init?.headers);
            if (newToken) {
              newHeaders.set('Authorization', `Bearer ${newToken}`);
            }

            // Tenta novamente a requisição original com o novo token
            return await fetcher(input, { ...init, headers: newHeaders });
          } else {
            // Se o refresh falhar, rejeita a fila e desloga
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

    // Sobrescreve a função fetch global APENAS UMA VEZ
    window.fetch = newFetch;

    // Função de limpeza para restaurar o fetch original ao desmontar
    return () => {
      if (originalFetch.current) {
        window.fetch = originalFetch.current;
      }
      interceptorSetup.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ARRAY VAZIO - configura apenas uma vez na montagem

  return <>{children}</>;
}
