"use client";

import { ComponentType } from "react";
import AuthGuard from "./AuthGuard";

interface WithAuthOptions {
  requireAuth?: boolean;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

/**
 * Higher-order component that wraps a page component with authentication protection
 */
export function withAuth<P extends object>(WrappedComponent: ComponentType<P>, options: WithAuthOptions = {}) {
  const { requireAuth = true, requiredPermissions = [], fallback } = options;

  const AuthenticatedComponent = (props: P) => {
    return (
      <AuthGuard requireAuth={requireAuth} requiredPermissions={requiredPermissions} fallback={fallback}>
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };

  // Set display name for debugging
  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AuthenticatedComponent;
}

export default withAuth;
