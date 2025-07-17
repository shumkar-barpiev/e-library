import { useState, useEffect, useCallback } from "react";
import type { DashboardStats } from "@/types/dms";
import { nextcloudFilesService } from "@/services/nextcloud-files";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthStore } from "@/stores/auth-store";

interface UseDashboardDataResult {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  isNextcloudConnected: boolean;
  refreshData: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataResult {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNextcloudConnected, setIsNextcloudConnected] = useState(false);
  const { user } = useAuth();
  const { credentials } = useAuthStore();

  // Mock data fallback
  const getMockData = (): DashboardStats => ({
    totalFiles: 1245,
    totalFolders: 89,
    totalStorage: 15728640000, // 15GB in bytes
    recentUploads: [
      {
        id: 1,
        name: "annual_report_2024.pdf",
        originalName: "Annual Report 2024.pdf",
        mimeType: "application/pdf",
        size: 2048000,
        path: "/documents/reports/",
        uploadedBy: 1,
        uploadedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        updatedAt: new Date(),
        isPublic: false,
        downloadCount: 5,
      },
      {
        id: 2,
        name: "product_catalog.pdf",
        originalName: "Product Catalog.pdf",
        mimeType: "application/pdf",
        size: 5120000,
        path: "/documents/marketing/",
        uploadedBy: 2,
        uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        updatedAt: new Date(),
        isPublic: true,
        downloadCount: 23,
      },
      {
        id: 3,
        name: "meeting_notes.docx",
        originalName: "Meeting Notes.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 256000,
        path: "/documents/meetings/",
        uploadedBy: 1,
        uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        updatedAt: new Date(),
        isPublic: false,
        downloadCount: 1,
      },
    ],
    popularFiles: [
      {
        id: 4,
        name: "employee_handbook.pdf",
        originalName: "Employee Handbook.pdf",
        mimeType: "application/pdf",
        size: 1024000,
        path: "/documents/hr/",
        uploadedBy: 1,
        uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
        updatedAt: new Date(),
        isPublic: true,
        downloadCount: 156,
      },
      {
        id: 5,
        name: "company_policies.pdf",
        originalName: "Company Policies.pdf",
        mimeType: "application/pdf",
        size: 512000,
        path: "/documents/policies/",
        uploadedBy: 1,
        uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 2 weeks ago
        updatedAt: new Date(),
        isPublic: true,
        downloadCount: 89,
      },
    ],
    activityLog: [
      {
        id: 1,
        userId: 1,
        action: "upload",
        resourceType: "file",
        resourceId: 1,
        resourceName: "annual_report_2024.pdf",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: 2,
        userId: 2,
        action: "download",
        resourceType: "file",
        resourceId: 4,
        resourceName: "employee_handbook.pdf",
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
      },
      {
        id: 3,
        userId: 1,
        action: "move",
        resourceType: "file",
        resourceId: 3,
        resourceName: "meeting_notes.docx",
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
      },
    ],
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let dashboardData: DashboardStats;

      if (user && credentials) {
        try {
          // Set credentials for the WebDAV service
          nextcloudFilesService.setCredentials(credentials.loginName, credentials.appPassword);

          // Test Nextcloud connection
          const connectionTest = await nextcloudFilesService.testConnection();
          setIsNextcloudConnected(connectionTest);

          if (connectionTest) {
            // Get recent files from Nextcloud WebDAV (last 24 hours)
            const recentFiles = await nextcloudFilesService.getRecentFiles(5, 24);
            console.log("Fetched recent files from Nextcloud WebDAV:", recentFiles);

            // Create dashboard stats with Nextcloud data
            dashboardData = {
              ...getMockData(),
              recentUploads: recentFiles,
            };
          } else {
            console.warn("Cannot connect to Nextcloud server with provided credentials");
            setError("Cannot connect to Nextcloud server");
            setIsNextcloudConnected(false);
            dashboardData = getMockData();
          }
        } catch (nextcloudError) {
          console.warn("Failed to fetch from Nextcloud WebDAV, using mock data:", nextcloudError);
          setError(nextcloudError instanceof Error ? nextcloudError.message : "Nextcloud WebDAV error");
          setIsNextcloudConnected(false);
          dashboardData = getMockData();
        }
      } else {
        // Use mock data when user or credentials are missing
        setIsNextcloudConnected(false);
        if (!user) {
          setError("User not authenticated");
        } else if (!credentials) {
          setError("No Nextcloud credentials found. Please log in again.");
        }
        dashboardData = getMockData();
      }

      setStats(dashboardData);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      setStats(getMockData()); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  }, [user, credentials]);

  const refreshData = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return {
    stats,
    loading,
    error,
    isNextcloudConnected,
    refreshData,
  };
}
