"use client";

import { createContext, useContext, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface InterceptorContextType {
  setupInterceptors: () => void;
}

const InterceptorContext = createContext<InterceptorContextType | null>(null);

export function InterceptorProvider({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  
  // Contador para retry antes de forçar logout
  let retryCount = new Map<string, number>();

  const setupInterceptors = () => {
    // Interceptar fetch global
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        const response = await originalFetch(input, init);
        
        // Se receber 401, tentar algumas vezes antes de logout forçado
        if (response.status === 401) {
          const url = typeof input === 'string' ? input : input instanceof URL ? input.href : '';
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
          
          // Só processar se for da nossa API
          if (url.includes(baseUrl) || url.includes('/api/v1/')) {
            const currentRetries = retryCount.get(url) || 0;
            
            // Permitir até 5 tentativas antes de logout
            if (currentRetries < 5) {
              console.warn(`Interceptado erro 401 tentativa ${currentRetries + 1}/6 para ${url}`);
              retryCount.set(url, currentRetries + 1);
              
              // Aguardar mais tempo antes de retry
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              // Tentar novamente
              return originalFetch(input, init);
            } else {
              console.warn("Múltiplos erros 401 - Fazendo logout automático");
              retryCount.delete(url); // Limpar contador
              
              await logout();
              setTimeout(() => {
                window.location.href = '/login';
              }, 100);
            }
          }
        } else {
          // Se requisição passou, limpar contador de retry para esta URL
          const url = typeof input === 'string' ? input : input instanceof URL ? input.href : '';
          retryCount.delete(url);
        }
        
        return response;
      } catch (error) {
        console.error("Erro interceptado na requisição:", error);
        throw error;
      }
    };

    // Interceptar XMLHttpRequest também (caso alguma biblioteca use)
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
      this.addEventListener('readystatechange', async function() {
        if (this.readyState === 4 && this.status === 401) {
          const urlStr = typeof url === 'string' ? url : url.toString();
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
          
          if (urlStr.includes(baseUrl) || urlStr.includes('/api/v1/')) {
            const currentRetries = retryCount.get(urlStr) || 0;
            
            if (currentRetries < 2) {
              console.warn(`XMLHttpRequest 401 tentativa ${currentRetries + 1}/3 para ${urlStr}`);
              retryCount.set(urlStr, currentRetries + 1);
              // Para XMLHttpRequest, não podemos fazer retry automático, apenas contar
            } else {
              console.warn("Múltiplos erros 401 via XMLHttpRequest - Fazendo logout");
              retryCount.delete(urlStr);
              
              await logout();
              setTimeout(() => {
                window.location.href = '/login';
              }, 100);
            }
          }
        }
      });
      
      return originalOpen.call(this, method, url, ...args);
    };
  };

  useEffect(() => {
    setupInterceptors();
  }, [logout]);

  return (
    <InterceptorContext.Provider value={{ setupInterceptors }}>
      {children}
    </InterceptorContext.Provider>
  );
}

export function useInterceptor() {
  const context = useContext(InterceptorContext);
  if (!context) {
    throw new Error('useInterceptor deve ser usado dentro de InterceptorProvider');
  }
  return context;
}