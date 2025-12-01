import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ error: any }>;
  register: (email: string, pass: string, name: string) => Promise<{ error: any }>;
  logout: () => void;
  user: User | null;
  userName: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Verificar sessão atual ao carregar
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          handleSession(session);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkSession();

    // Ouvir mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        handleSession(session);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSession = (session: Session | null) => {
    setUser(session?.user ?? null);
    // Prioritize metadata name, fallback to null
    if (session?.user?.user_metadata?.name) {
      setUserName(session.user.user_metadata.name);
    } else if (session?.user?.user_metadata?.full_name) {
      setUserName(session.user.user_metadata.full_name);
    } else {
      setUserName(null);
    }
  };

  const login = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    
    if (data.session) {
      handleSession(data.session);
    }
    
    return { error };
  };

  const register = async (email: string, pass: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          name: name,
        },
      },
    });
    
    if (data.session) {
      handleSession(data.session);
    }
    
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!user, 
      login, 
      register, 
      logout, 
      user, 
      userName,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};