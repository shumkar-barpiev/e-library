import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";

interface UseAuthGuardOptions {
  requireAuth?: boolean;
  requiredPermissions?: string[];
  redirectTo?: string;
}

/**
 * Hook to handle authentication guards in components
 */
export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const { requireAuth = true, requiredPermissions = [], redirectTo = "/login" } = options;

  const { user, isAuthenticated, loading, hasPermission } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthorized = () => {
    if (!requireAuth) return true;
    if (!isAuthenticated) return false;

    if (requiredPermissions.length > 0) {
      return requiredPermissions.every((permission) => hasPermission(permission));
    }

    return true;
  };

  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated) {
      const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
    }
  }, [isAuthenticated, loading, requireAuth, router, pathname, redirectTo]);

  return {
    isAuthenticated,
    isAuthorized: isAuthorized(),
    loading,
    user,
    hasPermission,
  };
};

export default useAuthGuard;
