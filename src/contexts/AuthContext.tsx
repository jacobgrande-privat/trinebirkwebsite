import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { supabase } from '../lib/supabase';

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserData(session.user.id, session.user.email!);
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserData(session.user.id, session.user.email!);
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadUserData = async (userId: string, email: string) => {
    try {
      const { data: backofficeUser, error } = await supabase
        .from('backoffice_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;

      if (backofficeUser) {
        const user: User = {
          id: backofficeUser.id,
          email: backofficeUser.email,
          name: backofficeUser.name,
          role: 'admin',
          createdAt: new Date(backofficeUser.created_at),
          lastLogin: new Date()
        };

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        await supabase.auth.signOut();
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);

      const { data: backofficeUser, error: dbError } = await supabase
        .from('backoffice_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      console.log('Database check:', { backofficeUser, dbError });

      if (!backofficeUser) {
        console.log('User not found in backoffice_users table');
        return false;
      }

      console.log('Attempting Supabase auth...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Auth response:', { user: data?.user?.email, error: error?.message });

      if (error || !data.user) {
        console.error('Auth failed:', error);
        return false;
      }

      console.log('Loading user data...');
      await loadUserData(data.user.id, data.user.email!);
      console.log('Login successful!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
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
