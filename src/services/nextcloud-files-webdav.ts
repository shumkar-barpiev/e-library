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
   * Get recent files using WebDAV PROPFIND to query actual file system metadata
   */
  async getRecentFiles(limit: number = 10, hoursBack: number = 24): Promise<RecentFile[]> {
    try {
      // Use our API proxy which implements WebDAV PROPFIND
      const response = await fetch(`/api/nextcloud/recent?limit=${limit}&hours=${hoursBack}`, {
        method: "GET",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `WebDAV PROPFIND failed: ${response.status} ${response.statusText}. ${errorData.details || ""}`
        );
      }

      const data = await response.json();
      console.log("WebDAV PROPFIND response:", data);

      // Transform WebDAV response to RecentFile format
      const files: RecentFile[] = data.files.map((file: any, index: number) => ({
        id: parseInt(file.id) || index + 1,
        name: file.name,
        originalName: file.basename || file.name,
        mimeType: file.mime || this.guessMimeType(file.name),
        size: file.size || 0,
        path: file.dirname || "/",
        uploadedAt: new Date(file.mtime * 1000), // WebDAV uses Unix timestamp
        updatedAt: new Date(file.mtime * 1000),
        isPublic: file.isPublic || false,
        downloadCount: 0, // WebDAV doesn't provide download count
        uploadedBy: 1, // Default user ID
      }));

      console.log(`Successfully fetched ${files.length} recent files from WebDAV`);
      return files;
    } catch (error) {
      console.error("Error fetching recent files from WebDAV:", error);
      throw error;
    }
  }

  /**
   * Test connection to Nextcloud server
   */
  async testConnection(): Promise<boolean> {
    if (!this.credentials) {
      console.warn("No credentials set for connection test");
      return false;
    }

    try {
      // Test WebDAV connection by doing a simple PROPFIND on the user's root directory
      const response = await fetch(`/api/nextcloud/recent?limit=1&hours=8760`, {
        // 1 year to test connection
        method: "GET",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
      });

      console.log("Connection test response status:", response.status);

      if (response.status === 401) {
        console.warn("Authentication failed - invalid credentials");
        return false;
      }

      if (response.status === 404) {
        console.warn("WebDAV endpoint not found");
        return false;
      }

      const success = response.ok;
      console.log("Nextcloud WebDAV connection test:", success ? "SUCCESS" : "FAILED");
      return success;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }

  /**
   * Guess MIME type based on file extension
   */
  private guessMimeType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();

    const mimeTypes: { [key: string]: string } = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      txt: "text/plain",
      csv: "text/csv",
      json: "application/json",
      xml: "application/xml",
      html: "text/html",
      css: "text/css",
      js: "application/javascript",
      ts: "application/typescript",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      svg: "image/svg+xml",
      webp: "image/webp",
      mp4: "video/mp4",
      avi: "video/x-msvideo",
      mov: "video/quicktime",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      zip: "application/zip",
      rar: "application/vnd.rar",
      tar: "application/x-tar",
      gz: "application/gzip",
    };

    return mimeTypes[ext || ""] || "application/octet-stream";
  }
}

// Export singleton instance
export const nextcloudFilesService = new NextcloudFilesService();
