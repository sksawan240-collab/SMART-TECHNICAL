import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  pendingEmailForOtp: string | null;
  setPendingEmailForOtp: (email: string | null) => void;
  devOtpCode: string | null;
  setDevOtpCode: (code: string | null) => void;
  latestWelcomeTicket: any | null;
  setLatestWelcomeTicket: (ticket: any | null) => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingEmailForOtp, setPendingEmailForOtp] = useState<string | null>(null);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [latestWelcomeTicket, setLatestWelcomeTicket] = useState<any | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    // Check saved session in localStorage
    const savedUser = localStorage.getItem('stsu_user');
    const savedToken = localStorage.getItem('stsu_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        localStorage.removeItem('stsu_user');
        localStorage.removeItem('stsu_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });
      const data = await res.json();

      if (!res.ok) {
        addToast('ERROR', 'Authentication Failed', data.error || 'Invalid credentials');
        setIsLoading(false);
        return false;
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('stsu_user', JSON.stringify(data.user));
      localStorage.setItem('stsu_token', data.token);

      addToast('SUCCESS', `Welcome Back, ${data.user.fullName}`, `Logged in as ${data.user.role}`);
      setIsLoading(false);
      return true;
    } catch (e: any) {
      addToast('ERROR', 'Connection Error', 'Could not communicate with central authentication server.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('stsu_user');
    localStorage.removeItem('stsu_token');
    addToast('INFO', 'Session Terminated', 'You have been securely signed out.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        pendingEmailForOtp,
        setPendingEmailForOtp,
        devOtpCode,
        setDevOtpCode,
        latestWelcomeTicket,
        setLatestWelcomeTicket,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
