import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  fullName: string;
  email: string;
  sex: string;
  stateOfOrigin: string;
  mobileNumber: string;
  role: "user" | "doctor" | "admin";
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  sex: string;
  stateOfOrigin: string;
  mobileNumber: string;
  role: "user" | "doctor" | "admin";
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = "swiftcare_users";
const CURRENT_USER_KEY = "swiftcare_current_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const stored = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(USERS_KEY);
      const users: (User & { password: string })[] = stored
        ? JSON.parse(stored)
        : [];
      const found = users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password
      );
      if (!found) return false;
      const { password: _, ...userData } = found;
      setUser(userData);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
      return true;
    } catch {
      return false;
    }
  }

  async function register(data: RegisterData): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(USERS_KEY);
      const users: (User & { password: string })[] = stored
        ? JSON.parse(stored)
        : [];
      const exists = users.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase()
      );
      if (exists) return false;

      const newUser: User & { password: string } = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        sex: data.sex,
        stateOfOrigin: data.stateOfOrigin,
        mobileNumber: data.mobileNumber,
        role: data.role,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

      const { password: _, ...userData } = newUser;
      setUser(userData);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
      return true;
    } catch {
      return false;
    }
  }

  async function logout() {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
