import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { StorageService } from '../services/storageService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password?: string, preferredRole?: UserRole) => { success: boolean; message: string; user?: User };
  quickLogin: (userId: string) => void;
  logout: () => void;
  updateCurrentUser: (userData: Partial<User>) => void;
  allUsers: User[];
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(() => StorageService.getUsers());

  useEffect(() => {
    // If no user is logged in, default to initial admin or remember last user
    if (!currentUser) {
      const saved = StorageService.getCurrentUser();
      if (saved) {
        setCurrentUser(saved);
      }
    }
  }, [currentUser]);

  const refreshUsers = () => {
    const users = StorageService.getUsers();
    setAllUsers(users);
  };

  const login = (username: string, password?: string, preferredRole?: UserRole): { success: boolean; message: string; user?: User } => {
    const users = StorageService.getUsers();
    const cleanUsername = username.trim().toLowerCase();

    // Match by username or NIS/NIP
    let found = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername ||
        u.nisOrNip.toLowerCase() === cleanUsername ||
        (u.email && u.email.toLowerCase() === cleanUsername)
    );

    if (!found && preferredRole) {
      // If user typed role directly like "admin", "guru", "siswa"
      found = users.find((u) => u.role === preferredRole);
    }

    if (!found) {
      return {
        success: false,
        message: 'Username, NIS, atau NIP tidak ditemukan. Silakan periksa kembali.',
      };
    }

    // If password provided and matches, or if demo without password
    if (password && found.password && found.password !== password) {
      return {
        success: false,
        message: 'Kata sandi yang Anda masukkan salah.',
      };
    }

    setCurrentUser(found);
    StorageService.saveCurrentUser(found);
    return {
      success: true,
      message: `Selamat datang, ${found.nama}!`,
      user: found,
    };
  };

  const quickLogin = (userId: string) => {
    const users = StorageService.getUsers();
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      StorageService.saveCurrentUser(found);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    StorageService.saveCurrentUser(null);
  };

  const updateCurrentUser = (userData: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...userData };
    setCurrentUser(updated);
    StorageService.saveCurrentUser(updated);

    const users = StorageService.getUsers().map((u) => (u.id === updated.id ? updated : u));
    StorageService.saveUsers(users);
    setAllUsers(users);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        quickLogin,
        logout,
        updateCurrentUser,
        allUsers,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
