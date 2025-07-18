export interface PublicFile {
  filename: string;
  basename: string;
  lastmod: string;
  size: number;
  etag: string;
  mime: string;
  type: "file" | "directory";
}

export class NextcloudPublicFilesService {
  /**
   * Fetch public files from Nextcloud public share via API
   * @param shareToken The public share token from Nextcloud (example: "6Xq9d8TpPbcLMnf")
   */
  async getPublicFiles(): Promise<PublicFile[]> {
    const shareToken = process.env.NEXT_PUBLIC_NEXTCLOUD_PUBLIC_FOLDER_TOKEN;
    if (!shareToken) {
      console.error("Share token is required to fetch public files.");
      return [];
    }

    try {
      const response = await fetch("/api/nextcloud/public-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shareToken }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch public files.");
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error("Error fetching public files:", error);
      return [];
    }
  }
}

export const nextcloudPublicFilesService = new NextcloudPublicFilesService();
