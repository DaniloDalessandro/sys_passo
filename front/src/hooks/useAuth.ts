import { useEffect, useState, useCallback } from "react";

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
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserData | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Centraliza a lógica de recuperação dos dados
  const getAuthData = useCallback((): { token: string | null; userData: UserData | null } => {
    try {
      // Função para ler cookies
      const getCookie = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
      };

      const token = getCookie('access');
      const userData = {
        id: localStorage.getItem("user_id") || '',
        email: localStorage.getItem("user_email") || '',
        username: localStorage.getItem("user_username") || '',
        first_name: localStorage.getItem("user_first_name") || '',
        last_name: localStorage.getItem("user_last_name") || '',
      };

      // Se não tem dados do usuário OU token, não há sessão válida
      return {
        token,
        userData: token && userData.id ? userData : null
      };
    } catch (error) {
      console.error("Error reading auth data", error);
      return { token: null, userData: null };
    }
  }, []);

  const login = useCallback((token: string, userData: UserData) => {
    // REMOVER armazenamento em localStorage por questões de segurança
    // localStorage.setItem("access", token);
    localStorage.setItem("user_id", userData.id);
    localStorage.setItem("user_email", userData.email);
    localStorage.setItem("user_username", userData.username);
    localStorage.setItem("user_first_name", userData.first_name);
    localStorage.setItem("user_last_name", userData.last_name);

    // Definir APENAS cookie seguro (8 horas)
    document.cookie = `access=${token}; path=/; max-age=${8 * 60 * 60}; secure=${window.location.protocol === 'https:'}; samesite=strict`;

    setAccessToken(token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    // Remover do localStorage
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_username");
    localStorage.removeItem("user_first_name");
    localStorage.removeItem("user_last_name");

    // Remover cookie
    document.cookie = 'access=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    setUser(null);
    setAccessToken(null);
  }, []);

  // Sincroniza entre abas - agora monitora localStorage de dados do usuário
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user_id" || e.key === "user_email" || e.key === "user_username" || e.key === "user_first_name" || e.key === "user_last_name") {
        const { token, userData } = getAuthData();
        setAccessToken(token);
        setUser(userData);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [getAuthData]);

  // Inicialização
  useEffect(() => {
    const { token, userData } = getAuthData();
    setAccessToken(token);
    setUser(userData);
  }, [getAuthData]);

  return {
    isAuthenticated: !!accessToken,
    user,
    accessToken,
    login,
    logout,
  };
}