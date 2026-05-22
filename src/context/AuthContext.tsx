import { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: Record<string, User> = {
  'alumno@uni.edu': { id: '1', name: 'Carlos García', email: 'alumno@uni.edu', role: 'alumno' },
  'profesor@uni.edu': { id: '2', name: 'Dra. María López', email: 'profesor@uni.edu', role: 'profesor' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string, role: UserRole): boolean => {
    // Demo: accept any credentials
    const demoUser = DEMO_USERS[email];
    if (demoUser) {
      setUser(demoUser);
      return true;
    }
    setUser({
      id: crypto.randomUUID(),
      name: email.split('@')[0],
      email,
      role,
    });
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
