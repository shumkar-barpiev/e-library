import { nextcloudConfig } from "@/config/nextcloud";

interface WebDAVFile {
  href: string;
  displayname: string;
  getcontentlength?: number;
  getcontenttype?: string;
  getlastmodified: string;
  resourcetype?: string;
  getetag?: string;
}

export interface RecentFile {
  id: number;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedBy: number;
  uploadedAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  downloadCount: number;
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
   * Test connection to Nextcloud server using WebDAV via API proxy
   */
  async testConnection(): Promise<boolean> {
    if (!this.credentials) {
      console.warn("No credentials set for connection test");
      return false;
    }

    try {
      const response = await fetch("/api/nextcloud/test-connection", {
        method: "POST",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        console.warn("Authentication failed - invalid credentials");
        return false;
      }

      if (response.status === 404) {
        console.warn("WebDAV endpoint not found");
        return false;
      }

      if (response.status === 403) {
        console.warn("Access forbidden - user may not have file access");
        return false;
      }

      const success = response.ok;
      if (!success) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Connection test error details:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error || "Unknown error",
        });
      }

      return success;
    } catch (error) {
      console.error("WebDAV connection test failed:", error);
      return false;
    }
  }

  /**
   * Get recent files using WebDAV PROPFIND via API proxy
   */
  async getRecentFiles(limit: number = 10, hoursBack: number = 24): Promise<RecentFile[]> {
    if (!this.hasCredentials()) {
      throw new Error("No authentication credentials set");
    }

    try {
      const response = await fetch(`/api/nextcloud/recent-files?limit=${limit}&hours=${hoursBack}`, {
        method: "GET",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${response.status} ${errorData.error || response.statusText}`);
      }

      const xmlText = await response.text();
      const files = this.parseWebDAVResponse(xmlText);

      // Filter for files (not directories) modified within timeframe
      const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

      const recentFiles = files
        .filter((file) => {
          // Skip directories (they have resourcetype collection)
          if (file.resourcetype?.includes("collection")) return false;

          // Check if modified within timeframe
          const lastModified = new Date(file.getlastmodified);
          return lastModified > cutoffTime;
        })
        .sort((a, b) => {
          // Sort by modification date, newest first
          return new Date(b.getlastmodified).getTime() - new Date(a.getlastmodified).getTime();
        })
        .slice(0, limit)
        .map(
          (file, index): RecentFile => ({
            id: parseInt(file.href.split("/").pop() || "") || index + 1,
            name: file.displayname,
            originalName: file.displayname,
            mimeType: file.getcontenttype || this.guessMimeType(file.displayname),
            size: file.getcontentlength || 0,
            path: this.extractPath(file.href),
            uploadedBy: 1, // Default - would need additional API for actual user info
            uploadedAt: new Date(file.getlastmodified),
            updatedAt: new Date(file.getlastmodified),
            isPublic: false, // Would need sharing API to determine this
            downloadCount: 0, // Not available from WebDAV
          })
        );

      return recentFiles;
    } catch (error) {
      console.error("Error fetching recent files:", error);
      throw error;
    }
  }

  private parseWebDAVResponse(xmlText: string): WebDAVFile[] {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const responses = xmlDoc.getElementsByTagName("d:response");

      const files: WebDAVFile[] = [];

      for (let i = 0; i < responses.length; i++) {
        const response = responses[i];

        const href = response.getElementsByTagName("d:href")[0]?.textContent || "";
        const props = response.getElementsByTagName("d:prop")[0];

        if (!props) continue;

        const displayname = props.getElementsByTagName("d:displayname")[0]?.textContent || "";
        const getcontentlength = parseInt(props.getElementsByTagName("d:getcontentlength")[0]?.textContent || "0");
        const getcontenttype = props.getElementsByTagName("d:getcontenttype")[0]?.textContent || "";
        const getlastmodified = props.getElementsByTagName("d:getlastmodified")[0]?.textContent || "";
        const resourcetype = props.getElementsByTagName("d:resourcetype")[0]?.innerHTML || "";
        const getetag = props.getElementsByTagName("d:getetag")[0]?.textContent || "";

        if (displayname && getlastmodified) {
          files.push({
            href,
            displayname,
            getcontentlength: getcontentlength || undefined,
            getcontenttype: getcontenttype || undefined,
            getlastmodified,
            resourcetype,
            getetag,
          });
        }
      }

      return files;
    } catch (error) {
      console.error("Error parsing WebDAV XML response:", error);
      return [];
    }
  }

  private extractPath(href: string): string {
    try {
      const url = new URL(href);
      const pathParts = url.pathname.split("/");
      // Remove filename to get directory path
      pathParts.pop();
      return pathParts.join("/") + "/";
    } catch {
      return "/";
    }
  }

  private guessMimeType(filename: string): string {
    const ext = filename.toLowerCase().split(".").pop();
    const mimeTypes: { [key: string]: string } = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      txt: "text/plain",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      mp4: "video/mp4",
      mp3: "audio/mpeg",
      zip: "application/zip",
    };
    return mimeTypes[ext || ""] || "application/octet-stream";
  }
}

// Export singleton instance
export const nextcloudFilesService = new NextcloudFilesService();
