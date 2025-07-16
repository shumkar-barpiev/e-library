import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthService, AuthResponse } from "@/services/auth-service";
import { User, UserRole } from "@/types/dms";
import { getUserRoleFromNextcloudGroups } from "@/config/nextcloud";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  credentials: {
    server: string;
    loginName: string;
    appPassword: string;
  } | null;
}

interface AuthActions {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  hasPermission: (permission: string) => boolean;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  credentials: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response: AuthResponse = await AuthService.login(username, password);

          if (response.success && response.userInfo && response.credentials) {
            const userRole = getUserRoleFromNextcloudGroups(response.userInfo.groups || []);

            const user: User = {
              id: parseInt(response.userInfo.id) || Math.floor(Math.random() * 1000),
              username: response.userInfo.userid,
              email: response.userInfo.email || response.userInfo.emailAddress,
              firstName: response.userInfo.displayname.split(" ")[0] || response.userInfo.displayname,
              lastName: response.userInfo.displayname.split(" ").slice(1).join(" ") || "",
              displayName: response.userInfo.displayname,
              role: userRole,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              credentials: response.credentials,
            });
          } else {
            throw new Error(response.error || "Authentication failed");
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Authentication failed";
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
            credentials: null,
          });
          throw error;
        }
      },

      logout: async () => {
        const { credentials } = get();

        try {
          if (credentials) {
            await AuthService.logout(credentials.loginName, credentials.appPassword);
          }
        } catch (error) {
          console.warn("Logout cleanup failed:", error);
        } finally {
          // Clear state regardless of API success
          set({
            ...initialState,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      hasPermission: (permission: string): boolean => {
        const { user } = get();
        if (!user) return false;

        const rolePermissions: Record<UserRole, string[]> = {
          admin: ["read", "write", "delete", "manage_users", "manage_system"],
          editors: ["read", "write", "delete", "approve"],
          users: ["read", "write"],
          guest: ["read"],
        };

        return rolePermissions[user.role]?.includes(permission) || false;
      },
    }),
    {
      name: "auth-storage", // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        credentials: state.credentials,
        // Don't persist loading and error states
      }),
    }
  )
);

// Export types for convenience
export type { AuthState, AuthActions, AuthStore };
