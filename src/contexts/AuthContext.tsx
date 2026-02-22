import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { clearContentAdminToken } from '../lib/contentAuth';
import {
  clearBackofficeSessionToken,
  getBackofficeSessionToken,
  setBackofficeSessionToken
} from '../lib/backofficeSession';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = getBackofficeSessionToken();
      if (!token) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const response = await fetch('/api/backoffice-auth', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        clearBackofficeSessionToken();
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
        return;
      }

      const result = await response.json();
      const user = mapUser(result.user);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      console.error('Error checking session:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const mapUser = (rawUser: any): User => ({
    id: rawUser.id,
    email: rawUser.email,
    name: rawUser.name || rawUser.email,
    role: rawUser.role === 'editor' ? 'editor' : 'admin',
    createdAt: new Date(rawUser.createdAt || Date.now()),
    lastLogin: rawUser.lastLogin ? new Date(rawUser.lastLogin) : new Date()
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/backoffice-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!result.success || !result.token || !result.user) {
        return false;
      }

      setBackofficeSessionToken(result.token);

      setAuthState({
        user: mapUser(result.user),
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    clearBackofficeSessionToken();
    clearContentAdminToken();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const updateUser = (user: User) => {
    setAuthState(prev => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
