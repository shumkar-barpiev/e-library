import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Custom hook that provides authentication functionality
 * This hook wraps the Zustand store and provides a clean interface
 */
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error, login, logout, clearError, setLoading, hasPermission } =
    useAuthStore();

  // Initialize authentication state on mount
  useEffect(() => {
    // The Zustand persist middleware will automatically restore state from localStorage
    // No additional initialization needed
  }, []);

  return {
    // State
    user,
    isAuthenticated,
    loading: isLoading,
    error,

    // Actions
    login: async (username: string, password: string) => {
      try {
        await login(username, password);
      } catch (error) {
        // Error is already set in the store
        throw error;
      }
    },
    logout,
    clearError,
    hasPermission,

    // Utility
    setLoading,
  };
};

export default useAuth;
