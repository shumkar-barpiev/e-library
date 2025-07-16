"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { User, UserRole } from "@/types/dms";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: User }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, loading: true, error: null };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case "AUTH_ERROR":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (username: string, password: string) => {
    dispatch({ type: "AUTH_START" });

    try {
      // TODO: Replace with actual API call
      // Simulate backend determining user role based on username/password
      let role: UserRole = "user"; // default role

      // Mock role assignment based on username (simulate backend logic)
      if (username.toLowerCase().includes("admin")) {
        role = "admin";
      } else if (username.toLowerCase().includes("editor")) {
        role = "editor";
      } else if (username.toLowerCase().includes("guest")) {
        role = "guest";
      }

      const mockUser: User = {
        id: 1,
        email: `${username}@example.com`, // Convert username to email format for display
        firstName: "John",
        lastName: "Doe",
        role,
        organization: "Test Organization",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Store in localStorage for persistence
      localStorage.setItem("auth_user", JSON.stringify(mockUser));

      dispatch({ type: "AUTH_SUCCESS", payload: mockUser });
    } catch (error) {
      dispatch({
        type: "AUTH_ERROR",
        payload: error instanceof Error ? error.message : "Login failed",
      });
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_user");
    dispatch({ type: "LOGOUT" });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;

    const rolePermissions = {
      admin: ["read", "write", "delete", "manage_users", "manage_system"],
      editor: ["read", "write", "delete", "approve"],
      user: ["read", "write"],
      guest: ["read"],
    };

    return rolePermissions[state.user.role]?.includes(permission) || false;
  };

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("auth_user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          dispatch({ type: "AUTH_SUCCESS", payload: user });
        } else {
          dispatch({ type: "AUTH_ERROR", payload: "No authentication found" });
        }
      } catch (error) {
        dispatch({ type: "AUTH_ERROR", payload: "Invalid authentication data" });
      }
    };

    checkAuth();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
