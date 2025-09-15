"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { jwtDecode } from "jwt-decode";

interface AuthGuardProps {
  children: React.ReactNode;
}

interface JWTPayload {
  exp: number;
  user_id: number;
}

// Validação síncrona do token JWT (mesma que no middleware)
function isTokenValidSync(token: string): boolean {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  } catch {
    return false;
  }
}

// Limpar completamente a sessão
function clearSession() {
  // Limpar localStorage
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  
  // Limpar cookies via JavaScript
  document.cookie = "access=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, accessToken, refreshToken, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasValidated, setHasValidated] = useState(false);

  const handleForceLogout = useCallback(async (reason: string) => {
    console.warn(`[AuthGuard] Forçando logout: ${reason}`);
    clearSession();
    await logout();
    router.replace('/login');
  }, [logout, router]);

  useEffect(() => {
    const validateAuth = async () => {
      try {
        console.log(`[AuthGuard] Validando - Auth: ${isAuthenticated}, AccessToken: ${!!accessToken}, RefreshToken: ${!!refreshToken}`);

        // PRIMEIRA VERIFICAÇÃO: Sem tokens = LOGOUT
        if (!accessToken && !refreshToken) {
          await handleForceLogout("Nenhum token encontrado");
          return;
        }

        // SEGUNDA VERIFICAÇÃO: Access token presente mas inválido = LOGOUT
        if (accessToken && !isTokenValidSync(accessToken)) {
          await handleForceLogout("Access token inválido ou expirado");
          return;
        }

        // TERCEIRA VERIFICAÇÃO: Access token válido mas usuário não autenticado no contexto
        if (accessToken && isTokenValidSync(accessToken) && !isAuthenticated) {
          // Dar MAIS tempo para o contexto de auth se atualizar (aumentado de 2s para 10s)
          setTimeout(() => {
            if (!isAuthenticated) {
              console.warn("[AuthGuard] Token válido mas contexto não sincronizou após 10s");
              // Em vez de logout forçado, permitir acesso se o token é válido
              setIsLoading(false);
              setHasValidated(true);
            } else {
              setIsLoading(false);
              setHasValidated(true);
            }
          }, 10000);
          return;
        }

        // QUARTA VERIFICAÇÃO: Tudo OK - access token válido e usuário autenticado
        if (accessToken && isTokenValidSync(accessToken) && isAuthenticated) {
          setIsLoading(false);
          setHasValidated(true);
          return;
        }

        // QUINTA VERIFICAÇÃO: Só tem refresh token, sem access token
        if (!accessToken && refreshToken && !isAuthenticated) {
          // Dar MAIS tempo para o contexto tentar renovar (aumentado de 3s para 15s)
          setTimeout(() => {
            if (!isAuthenticated || !accessToken) {
              console.warn("[AuthGuard] Falha ao renovar após 15s, mas mantendo sessão se refresh válido");
              // Em vez de logout, permitir se refresh ainda é válido
              if (refreshToken && isTokenValidSync(refreshToken)) {
                setIsLoading(false);
                setHasValidated(true);
              } else {
                handleForceLogout("Refresh token também inválido");
              }
            } else if (accessToken && isTokenValidSync(accessToken)) {
              setIsLoading(false);
              setHasValidated(true);
            } else {
              handleForceLogout("Refresh token gerou access token inválido");
            }
          }, 15000);
          return;
        }

        // FALLBACK: Se nenhuma das condições acima se aplicou
        await handleForceLogout("Condição de autenticação não reconhecida");

      } catch (error) {
        console.error('[AuthGuard] Erro na validação:', error);
        await handleForceLogout("Erro durante validação de autenticação");
      }
    };

    const timer = setTimeout(validateAuth, 200);
    return () => clearTimeout(timer);
  }, [isAuthenticated, accessToken, refreshToken, handleForceLogout]);

  // Estado de carregamento
  if (isLoading || !hasValidated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Mostrar conteúdo se passou por validação OU tem token válido (mais permissivo)
  if (hasValidated && (
    (isAuthenticated && accessToken && isTokenValidSync(accessToken)) ||
    (accessToken && isTokenValidSync(accessToken)) // Permitir mesmo sem isAuthenticated se token é válido
  )) {
    return <>{children}</>;
  }

  // Fallback de segurança - não mostrar nada
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecionando para login...</p>
      </div>
    </div>
  );
}