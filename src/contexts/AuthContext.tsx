import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginResponse } from '@/types';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/api-client';
import { authService } from '@/services/auth.service';
import { profileService } from '@/services/profile.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          // Try to get user profile to validate token
          await refreshAuth();
        } catch (error) {
          // Token invalid, clear it
          clearTokens();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await authService.login(email, password);
      const { accessToken, refreshToken, user: userData } = response.data!;

      // Store tokens
      setTokens(accessToken, refreshToken);

      // Set user
      setUser(userData);
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();
    
    // Try to call the logout API to revoke the refresh token
    // Even if this fails, we should still clear tokens locally
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch (error) {
        // Log error but don't block logout - still clear tokens locally
        console.error('Logout API call failed:', error);
      }
    }
    
    // Always clear tokens and user state, regardless of API call result
    clearTokens();
    setUser(null);
  };

  const refreshAuth = async (): Promise<void> => {
    const token = getAccessToken();
    const refreshTokenValue = getRefreshToken();

    if (!token || !refreshTokenValue) {
      setUser(null);
      return;
    }

    try {
      // Get user profile to validate token and get user data
      const profileResponse = await profileService.getProfile();
      if (profileResponse.data) {
        setUser(profileResponse.data);
      }
    } catch (error) {
      // If profile fetch fails, try to refresh token
      try {
        const refreshResponse = await authService.refreshToken(refreshTokenValue);
        const { accessToken } = refreshResponse.data!;
        const newRefreshToken = getRefreshToken()!;

        // Update tokens
        setTokens(accessToken, newRefreshToken);

        // Get user profile with new token
        const profileResponse = await profileService.getProfile();
        if (profileResponse.data) {
          setUser(profileResponse.data);
        }
      } catch (refreshError) {
        // Refresh failed, clear everything
        clearTokens();
        setUser(null);
        throw refreshError;
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
