import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance, { tokenStorage } from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On initial app load, if tokens exist in storage, attempt to
  // restore the session by fetching the current profile. This is
  // what allows a page refresh to keep the user logged in.
  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = tokenStorage.getAccessToken();

      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get('/auth/profile/');
        setUser(response.data);
      } catch (error) {
        // Access token invalid/expired and refresh failed
        // (the axios interceptor already cleared tokens and
        // redirected in that case) — ensure local state matches.
        tokenStorage.clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await axiosInstance.post('/auth/login/', { email, password });
    const { access, refresh, user: userData } = response.data;

    tokenStorage.setTokens(access, refresh);
    setUser(userData);

    return userData;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();

    try {
      if (refreshToken) {
        await axiosInstance.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      // Even if the blacklist call fails (e.g. token already expired),
      // proceed with clearing local state — the user's intent to log
      // out should always succeed from their perspective.
    } finally {
      tokenStorage.clearTokens();
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/auth/profile/');
      setUser(response.data);
      return response.data;
    } catch (error) {
      return null;
    }
  }, []);

  const value = {
    user,
    role: user?.role ?? null,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}