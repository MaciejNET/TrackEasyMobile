import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import authApi from '@/services/auth';
import { setAuthToken } from '@/services/baseApi';
import { UserDto } from '@/schemas/auth';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  user: UserDto | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string, dateOfBirth: string) => Promise<void>;
  externalLogin: (provider: 'google' | 'microsoft', firstName: string, lastName: string, dateOfBirth: string) => Promise<void>;
  handleExternalLoginCallback: (provider: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';

interface AuthProviderProps {
  children: ReactNode;
}
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);

        if (storedToken) {
          setToken(storedToken);
          setAuthToken(storedToken);
          await fetchUserData(storedToken);
        }
      } catch (error) {
        console.error('Failed to load auth token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  const fetchUserData = async (authToken: string) => {
    try {
      const userData = await authApi.getCurrentUser(authToken);
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      await logout();
    }
  };
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const authToken = await authApi.login({ email, password });

      await SecureStore.setItemAsync(TOKEN_KEY, authToken);

      setToken(authToken);
      setAuthToken(authToken);

      await fetchUserData(authToken);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string, dateOfBirth: string) => {
    setIsLoading(true);
    try {
      await authApi.register({
        firstName,
        lastName,
        email,
        password,
        dateOfBirth,
      });

      await login(email, password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);

      setToken(null);
      setUser(null);
      setAuthToken(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const refreshUser = async () => {
    if (token) {
      setIsLoading(true);
      try {
        await fetchUserData(token);
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const externalLogin = async (provider: 'google' | 'microsoft', firstName: string, lastName: string, dateOfBirth: string) => {
    setIsLoading(true);
    try {
      await authApi.externalLogin({
        provider,
        firstName,
        lastName,
        dateOfBirth,
      });
    } catch (error) {
      console.error('External login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  const handleExternalLoginCallback = async (provider: string) => {
    setIsLoading(true);
    try {
      // Handle the callback from the external provider
      const authToken = await authApi.handleExternalLoginCallback(provider);

      // Save token to secure storage
      await SecureStore.setItemAsync(TOKEN_KEY, authToken);

      // Set token in state and axios defaults
      setToken(authToken);
      setAuthToken(authToken);

      // Fetch user data
      await fetchUserData(authToken);
    } catch (error) {
      console.error('External login callback failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Provide the auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        externalLogin,
        handleExternalLoginCallback,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
