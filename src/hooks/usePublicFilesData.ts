import { useAuthStore } from "@/stores/auth-store";
import { useState, useEffect, useCallback } from "react";
import { PublicFile, nextcloudPublicFilesService } from "@/services/nextcloud-public-files";

interface UsePublicFilesDataResult {
  files: PublicFile[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function usePublicFilesData(): UsePublicFilesDataResult {
  const [files, setFiles] = useState<PublicFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { credentials } = useAuthStore();

  const fetchPublicFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!credentials) {
        throw new Error("Missing credentials");
      }

      setFiles(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load public files");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchPublicFiles();
  }, [fetchPublicFiles]);

  useEffect(() => {
    fetchPublicFiles();
    // Optionally auto-refresh every 5 minutes
    const interval = setInterval(fetchPublicFiles, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchPublicFiles]);

  return {
    files,
    loading,
    error,
    refreshData,
  };
}
