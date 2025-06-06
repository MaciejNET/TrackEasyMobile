import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import authApi from '@/services/auth';
import { setAuthToken } from '@/services/baseApi';
import { UserDto } from '@/schemas/auth';
import * as SecureStore from 'expo-secure-store';

// Define the shape of our auth context
interface AuthContextType {
  user: UserDto | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string, dateOfBirth: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create the auth context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token storage key
const TOKEN_KEY = 'auth_token';

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from storage on mount
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

  // Fetch user data with token
  const fetchUserData = async (authToken: string) => {
    try {
      const userData = await authApi.getCurrentUser(authToken);
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // If we can't get user data, the token might be invalid
      await logout();
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const authToken = await authApi.login({ email, password });

      // Save token to secure storage
      await SecureStore.setItemAsync(TOKEN_KEY, authToken);

      // Set token in state and axios defaults
      setToken(authToken);
      setAuthToken(authToken);

      // Fetch user data
      await fetchUserData(authToken);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
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

      // After registration, log the user in
      await login(email, password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      // Remove token from storage
      await SecureStore.deleteItemAsync(TOKEN_KEY);

      // Clear auth state
      setToken(null);
      setUser(null);
      setAuthToken(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data
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
