"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { User, UserRole } from "@/types/dms";
import { useTranslation } from "react-i18next";
import { AuthService } from "@/services/auth-service";
import { getUserRoleFromNextcloudGroups, nextcloudConfig } from "@/config/nextcloud";

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
  const { t } = useTranslation();

  const login = async (username: string, password: string) => {
    dispatch({ type: "AUTH_START" });

    try {
      // Check if Nextcloud authentication is enabled
      if (nextcloudConfig.enabled) {
        await authenticateWithNextcloud(username, password);
      } else {
        // Fall back to mock authentication for development
        await authenticateWithMock(username, password);
      }
    } catch (error) {
      console.error("Login error:", error);
      dispatch({ type: "AUTH_ERROR", payload: t("auth.invalidCredentials") });
      throw error;
    }
  };

  const authenticateWithNextcloud = async (username: string, password: string) => {
    try {
      // Use the API route for authentication
      const authResponse = await AuthService.login(username, password);

      if (!authResponse.success || !authResponse.credentials || !authResponse.userInfo) {
        throw new Error("Authentication failed");
      }

      const { credentials, userInfo } = authResponse;

      // Create user object from Nextcloud user info
      const userRole = getUserRoleFromNextcloudGroups(userInfo.groups || []);

      const user: User = {
        id: Number(userInfo.id || userInfo.userid) || 1,
        username: credentials.loginName,
        email: userInfo.email || userInfo.emailAddress || `${credentials.loginName}@nextcloud`,
        firstName: userInfo.displayname?.split(" ")[0] || credentials.loginName,
        lastName: userInfo.displayname?.split(" ").slice(1).join(" ") || "",
        displayName: userInfo.displayname || credentials.loginName,
        role: userRole,
        avatar: userInfo.avatar || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        nextcloudCredentials: credentials,
      };

      // Store user data and credentials
      localStorage.setItem("auth_user", JSON.stringify(user));
      localStorage.setItem("nextcloud_credentials", JSON.stringify(credentials));

      dispatch({ type: "AUTH_SUCCESS", payload: user });
    } catch (error) {
      throw new Error(t("auth.invalidCredentials"));
    }
  };

  const authenticateWithMock = async (username: string, password: string) => {
    // Mock authentication for development/testing
    let role: UserRole = "users";

    if (username.toLowerCase().includes("admin")) {
      role = "admin";
    } else if (username.toLowerCase().includes("editor")) {
      role = "editors";
    }

    const user: User = {
      id: Math.floor(Math.random() * 1000),
      username,
      email: `${username}@example.com`,
      firstName: username,
      lastName: "User",
      displayName: username,
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    localStorage.setItem("auth_user", JSON.stringify(user));
    dispatch({ type: "AUTH_SUCCESS", payload: user });
  };

  const logout = () => {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("nextcloud_credentials");
    dispatch({ type: "LOGOUT" });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;

    const rolePermissions = {
      admin: ["read", "write", "delete", "manage_users", "manage_system"],
      editors: ["read", "write", "delete", "approve"],
      users: ["read", "write"],
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
          dispatch({ type: "AUTH_ERROR", payload: t("auth.noAuthFound") });
        }
      } catch (error) {
        dispatch({ type: "AUTH_ERROR", payload: t("auth.invalidAuthData") });
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
