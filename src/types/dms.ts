export type UserRole = "admin" | "editors" | "users" | "guest";

export interface User {
  id: number;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  organization?: string;
  isActive?: boolean; // Add active status
  avatar?: string | null; // Add avatar field
  username?: string; // Add username field for Nextcloud
  displayName?: string; // Add displayName for Nextcloud
  nextcloudCredentials?: any; // Add Nextcloud credentials storage
  createdAt: Date;
  updatedAt: Date;
}

export interface FileMetadata {
  id: number;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  folderId?: number;
  uploadedBy: number;
  uploadedAt: Date;
  updatedAt: Date;
  tags?: string[];
  description?: string;
  isPublic: boolean;
  downloadCount: number;
}

export interface Folder {
  id: number;
  name: string;
  parentId?: number;
  path: string;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  description?: string;
}

export interface Permission {
  id: number;
  userId: number;
  resourceType: "file" | "folder";
  resourceId: number;
  permission: "read" | "write" | "delete" | "admin";
  grantedBy: number;
  grantedAt: Date;
}

export interface SearchResult {
  files: FileMetadata[];
  folders: Folder[];
  totalCount: number;
  query: string;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
}

export interface ActivityLog {
  id: number;
  userId: number;
  action: "upload" | "download" | "delete" | "move" | "rename" | "share";
  resourceType: "file" | "folder";
  resourceId: number;
  resourceName: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface DashboardStats {
  totalFiles: number;
  totalFolders: number;
  totalStorage: number;
  recentUploads: FileMetadata[];
  popularFiles: FileMetadata[];
  activityLog: ActivityLog[];
}
