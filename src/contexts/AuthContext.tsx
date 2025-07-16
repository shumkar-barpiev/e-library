"use client";

import React, { createContext, useContext } from "react";
import { useAuth as useAuthHook } from "@/hooks/useAuth";

// Create context type based on the useAuth hook
type AuthContextType = ReturnType<typeof useAuthHook>;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuthHook();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
