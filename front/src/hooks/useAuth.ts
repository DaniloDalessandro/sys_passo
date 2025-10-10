/**
 * DEPRECATED: Este hook está mantido apenas para compatibilidade com código legado.
 * Use useAuthContext() do @/context/AuthContext ao invés.
 *
 * Este hook agora apenas redireciona para o AuthContext centralizado
 * para evitar conflitos e loops infinitos.
 */

import { useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";

interface UserProfile {
  is_email_verified: boolean;
  email_verified_at: string | null;
}

interface UserData {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  last_login: string | null;
  is_active: boolean;
  profile?: UserProfile;
}

interface UseAuthReturn {
  isAuthenticated: boolean;
  user: UserData | null;
  accessToken: string | null;
  login: (token: string, userData: UserData) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
}

export function useAuth(): UseAuthReturn {
  // Redireciona para o AuthContext centralizado
  const authContext = useAuthContext();

  // Adapter para manter compatibilidade com a interface antiga
  const login = useCallback((token: string, userData: UserData) => {
    authContext.login({
      access: token,
      refresh: localStorage.getItem("refresh") || "",
      user: userData
    });
  }, [authContext]);

  return {
    isAuthenticated: authContext.isAuthenticated,
    user: authContext.user,
    accessToken: authContext.accessToken,
    login,
    logout: authContext.logout,
    refreshAccessToken: authContext.refreshAccessToken,
  };
}