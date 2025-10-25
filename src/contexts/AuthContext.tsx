import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo - in production this would be handled by a backend
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@lisenielsen.dk',
    name: 'Lise Nielsen',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  },
  {
    id: '2',
    email: 'editor@lisenielsen.dk',
    name: 'Maria Hansen',
    role: 'editor',
    createdAt: new Date('2024-02-01'),
    lastLogin: new Date()
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check for stored auth token
    const storedUser = localStorage.getItem('backoffice_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const user = {
          ...parsedUser,
          createdAt: new Date(parsedUser.createdAt),
          lastLogin: new Date(parsedUser.lastLogin)
        };
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } catch {
        localStorage.removeItem('backoffice_user');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in production this would call your API
    const user = mockUsers.find(u => u.email === email);
    
    if (user && password === 'admin123') { // Mock password check
      const updatedUser = { ...user, lastLogin: new Date() };
      setAuthState({
        user: updatedUser,
        isAuthenticated: true,
        isLoading: false
      });
      localStorage.setItem('backoffice_user', JSON.stringify(updatedUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    localStorage.removeItem('backoffice_user');
  };

  const updateUser = (user: User) => {
    setAuthState(prev => ({ ...prev, user }));
    localStorage.setItem('backoffice_user', JSON.stringify(user));
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