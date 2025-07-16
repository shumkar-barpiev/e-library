"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredPermissions?: string[];
  fallback?: ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requiredPermissions = [],
  fallback,
}) => {
  const { user, isAuthenticated, loading, hasPermission } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated) {
      // Redirect to login with the current path as redirect parameter
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
    }
  }, [isAuthenticated, loading, requireAuth, router, pathname]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      fallback || (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="200px"
          gap={2}
        >
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Verifying authentication...
          </Typography>
        </Box>
      )
    );
  }

  // If authentication is required but user is not authenticated, show nothing
  // (middleware should handle the redirect, but this is a backup)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Check permissions if required
  if (requiredPermissions.length > 0 && user) {
    const hasAllPermissions = requiredPermissions.every((permission) => hasPermission(permission));

    if (!hasAllPermissions) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="200px"
          gap={2}
          p={3}
        >
          <Typography variant="h6" color="error">
            Access Denied
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            You don&apos;t have the required permissions to access this page.
          </Typography>
        </Box>
      );
    }
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};

export default AuthGuard;
