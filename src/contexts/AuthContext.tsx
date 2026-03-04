"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { User, Role } from "@/lib/types";
import { MOCK_USERS } from "@/lib/mock-data";

interface AuthContextType {
  user: User;
  setRole: (role: Role) => void;
  isAuthorized: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<Role>("patron");

  const user = MOCK_USERS.find((u) => u.role === currentRole) || MOCK_USERS[0];

  const setRole = (role: Role) => {
    setCurrentRole(role);
  };

  const isAuthorized = (roles: Role[]) => roles.includes(currentRole);

  return (
    <AuthContext.Provider value={{ user, setRole, isAuthorized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
