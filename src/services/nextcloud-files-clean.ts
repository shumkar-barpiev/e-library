import { nextcloudConfig } from "@/config/nextcloud";

interface RecentFile {
  id: number;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  downloadCount: number;
  uploadedBy: number;
}

export class NextcloudFilesService {
  private credentials: { username: string; password: string } | null = null;

  /**
   * Set authentication credentials
   */
  setCredentials(username: string, password: string) {
    this.credentials = { username, password };
  }

  /**
   * Check if credentials are set
   */
  hasCredentials(): boolean {
    return this.credentials !== null;
  }

  /**
   * Get authorization header
   */
  private getAuthHeader(): string {
    if (!this.credentials) {
      throw new Error("No authentication credentials set. Please call setCredentials() first.");
    }

    const auth = btoa(`${this.credentials.username}:${this.credentials.password}`);
    return `Basic ${auth}`;
  }

  /**
   * Get recent files using Nextcloud Activity API
   */
  async getRecentFiles(limit: number = 10): Promise<RecentFile[]> {
    try {
      const response = await fetch(`/api/nextcloud/recent?limit=${limit}`, {
        method: "GET",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch recent files: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      // Transform activity data to our internal format
      return this.transformActivityFiles(data.files || []);
    } catch (error) {
      console.error("Error fetching recent files from Nextcloud Activity API:", error);
      throw error;
    }
  }

  /**
   * Transform Nextcloud activity data to our internal format
   */
  private transformActivityFiles(activityFiles: any[]): RecentFile[] {
    return activityFiles.map((file, index) => ({
      id: file.id ? parseInt(file.id, 10) : index + 1,
      name: file.name || file.basename || `file-${index}`,
      originalName: file.basename || file.name || `file-${index}`,
      mimeType: file.mime || this.guessMimeType(file.name || file.basename || ""),
      size: file.size || 0,
      path: file.dirname || "/",
      uploadedAt: new Date(file.mtime * 1000), // Convert Unix timestamp to Date
      updatedAt: new Date(file.mtime * 1000),
      isPublic: false, // Activity API doesn't provide share info
      downloadCount: 0, // Activity API doesn't provide download count
      uploadedBy: 1, // We don't have user ID from activity API
    }));
  }

  /**
   * Guess MIME type from file extension
   */
  private guessMimeType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();

    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      txt: "text/plain",
      zip: "application/zip",
      mp4: "video/mp4",
      mp3: "audio/mpeg",
    };

    return mimeTypes[ext || ""] || "application/octet-stream";
  }

  /**
   * Test connection to Nextcloud server
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${nextcloudConfig.defaultServerUrl}/status.php`, {
        method: "GET",
        headers: {
          "User-Agent": nextcloudConfig.userAgent,
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.installed === true;
    } catch (error) {
      console.error("Error testing Nextcloud connection:", error);
      return false;
    }
  }

  /**
   * Run diagnostics to help debug connection issues
   */
  async runDiagnostics(): Promise<any> {
    try {
      const response = await fetch("/api/nextcloud/diagnostics", {
        method: "GET",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Diagnostics failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error running diagnostics:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const nextcloudFilesService = new NextcloudFilesService();
