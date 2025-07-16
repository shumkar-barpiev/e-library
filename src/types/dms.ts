export type UserRole = "admin" | "editor" | "user" | "guest";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organization?: string;
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
