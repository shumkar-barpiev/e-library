/**
 * Nextcloud Configuration
 *
 * Configure your Nextcloud server settings here.
 * You can also use environment variables to set these values.
 */

import { UserRole } from "@/types/dms";

export const nextcloudConfig = {
  // Default Nextcloud server URL - replace with your server URL
  defaultServerUrl: process.env.NEXT_PUBLIC_NEXTCLOUD_SERVER_URL || "https://jk.sanarip.org",

  // User agent string for API requests
  userAgent: process.env.NEXT_PUBLIC_NEXTCLOUD_USER_AGENT || "E-Library-DMS/1.0",

  // Whether Nextcloud authentication is enabled
  enabled: process.env.NEXT_PUBLIC_NEXTCLOUD_ENABLED !== "false",

  // Role mapping: map Nextcloud groups to e-library roles
  roleMapping: {
    admin: "admin",
    editors: "editors",
    user: "users",
    default: "users",
  },
} as const;

/**
 * Get the user role based on Nextcloud groups
 */
export function getUserRoleFromNextcloudGroups(groups: string[]): UserRole {
  if (groups.includes("admin")) return "admin";
  if (groups.includes("editors")) return "editors";
  if (groups.includes("users")) return "users";
  if (groups.includes("guest")) return "guest";
  return "users";
}

export type NextcloudConfig = typeof nextcloudConfig;
