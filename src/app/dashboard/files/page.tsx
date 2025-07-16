"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Breadcrumbs,
  Link,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Fab,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
} from "@mui/material";
import {
  MoreVert,
  Folder,
  InsertDriveFile,
  Download,
  Edit,
  Delete,
  Share,
  CreateNewFolder,
  CloudUpload,
  GridView,
  ViewList,
  Home,
} from "@mui/icons-material";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { FileMetadata, Folder as FolderType } from "@/types/dms";

export default function FileBrowserPage() {
  const { user, hasPermission } = useAuth();
  const [currentFolder, setCurrentFolder] = useState<FolderType | null>(null);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<{ type: "file" | "folder"; id: number } | null>(null);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState<FolderType[]>([]);

  useEffect(() => {
    loadFolderContents();
  }, [currentFolder]);

  const loadFolderContents = async () => {
    // Mock data - replace with actual API calls
    const mockFolders: FolderType[] = [
      {
        id: 1,
        name: "Documents",
        parentId: currentFolder?.id || undefined,
        path: "/documents",
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
        description: "General documents folder",
      },
      {
        id: 2,
        name: "Images",
        parentId: currentFolder?.id || undefined,
        path: "/images",
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: true,
        description: "Image files",
      },
      {
        id: 3,
        name: "Reports",
        parentId: currentFolder?.id || undefined,
        path: "/reports",
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
        description: "Company reports",
      },
    ];

    const mockFiles: FileMetadata[] = [
      {
        id: 1,
        name: "annual_report.pdf",
        originalName: "Annual Report 2024.pdf",
        mimeType: "application/pdf",
        size: 2048000,
        path: "/documents/",
        folderId: currentFolder?.id,
        uploadedBy: 1,
        uploadedAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
        downloadCount: 15,
        tags: ["report", "annual", "financial"],
      },
      {
        id: 2,
        name: "company_logo.png",
        originalName: "Company Logo.png",
        mimeType: "image/png",
        size: 256000,
        path: "/images/",
        folderId: currentFolder?.id,
        uploadedBy: 2,
        uploadedAt: new Date(),
        updatedAt: new Date(),
        isPublic: true,
        downloadCount: 89,
        tags: ["logo", "branding"],
      },
    ];

    setFolders(mockFolders);
    setFiles(mockFiles);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, type: "file" | "folder", id: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem({ type, id });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleFolderClick = (folder: FolderType) => {
    setCurrentFolder(folder);
    setBreadcrumbs([...breadcrumbs, folder]);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      // Root folder
      setCurrentFolder(null);
      setBreadcrumbs([]);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1]);
    }
  };

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      // TODO: Implement actual folder creation
      console.log("Creating folder:", folderName);
      setFolderName("");
      setCreateFolderOpen(false);
      loadFolderContents();
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("image")) return "🖼️";
    if (mimeType.includes("video")) return "🎥";
    if (mimeType.includes("audio")) return "🎵";
    if (mimeType.includes("document")) return "📝";
    return "📁";
  };

  const speedDialActions = [
    {
      icon: <CreateNewFolder />,
      name: "Create Folder",
      action: () => setCreateFolderOpen(true),
      show: hasPermission("write"),
    },
    {
      icon: <CloudUpload />,
      name: "Upload Files",
      action: () => console.log("Upload files"),
      show: hasPermission("write"),
    },
  ].filter((action) => action.show);

  return (
    <DashboardLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4">File Browser</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton onClick={() => setViewMode("grid")} color={viewMode === "grid" ? "primary" : "default"}>
              <GridView />
            </IconButton>
            <IconButton onClick={() => setViewMode("list")} color={viewMode === "list" ? "primary" : "default"}>
              <ViewList />
            </IconButton>
          </Box>
        </Box>

        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            component="button"
            variant="body1"
            onClick={() => handleBreadcrumbClick(-1)}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Root
          </Link>
          {breadcrumbs.map((folder, index) => (
            <Link key={folder.id} component="button" variant="body1" onClick={() => handleBreadcrumbClick(index)}>
              {folder.name}
            </Link>
          ))}
        </Breadcrumbs>

        {/* Content */}
        {viewMode === "grid" ? (
          <Grid container spacing={2}>
            {/* Folders */}
            {folders.map((folder) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={`folder-${folder.id}`}>
                <Card sx={{ cursor: "pointer" }} onClick={() => handleFolderClick(folder)}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
                        <Folder sx={{ fontSize: 40, color: "warning.main", mr: 2 }} />
                        <Box>
                          <Typography variant="h6" noWrap>
                            {folder.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Folder
                          </Typography>
                          {folder.isPublic && <Chip label="Public" size="small" color="success" sx={{ mt: 1 }} />}
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, "folder", folder.id);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {/* Files */}
            {files.map((file) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={`file-${file.id}`}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
                        <Box sx={{ fontSize: "40px", mr: 2 }}>{getFileIcon(file.mimeType)}</Box>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="h6" noWrap title={file.originalName}>
                            {file.originalName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatFileSize(file.size)}
                          </Typography>
                          {file.isPublic && <Chip label="Public" size="small" color="success" sx={{ mt: 1 }} />}
                          {file.tags && file.tags.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {file.tags.slice(0, 2).map((tag) => (
                                <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                              ))}
                              {file.tags.length > 2 && <Chip label={`+${file.tags.length - 2}`} size="small" />}
                            </Box>
                          )}
                        </Box>
                      </Box>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, "file", file.id)}>
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <List>
            {/* Folders in list view */}
            {folders.map((folder) => (
              <ListItem key={`folder-${folder.id}`} disablePadding>
                <ListItemButton onClick={() => handleFolderClick(folder)}>
                  <ListItemIcon>
                    <Folder sx={{ color: "warning.main" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={folder.name}
                    secondary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2">Folder</Typography>
                        {folder.isPublic && <Chip label="Public" size="small" color="success" />}
                      </Box>
                    }
                  />
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, "folder", folder.id);
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                </ListItemButton>
              </ListItem>
            ))}

            {/* Files in list view */}
            {files.map((file) => (
              <ListItem key={`file-${file.id}`} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <span style={{ fontSize: "24px" }}>{getFileIcon(file.mimeType)}</span>
                  </ListItemIcon>
                  <ListItemText
                    primary={file.originalName}
                    secondary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2">{formatFileSize(file.size)}</Typography>
                        {file.isPublic && <Chip label="Public" size="small" color="success" />}
                        {file.tags && file.tags.slice(0, 3).map((tag) => <Chip key={tag} label={tag} size="small" />)}
                      </Box>
                    }
                  />
                  <IconButton onClick={(e) => handleMenuOpen(e, "file", file.id)}>
                    <MoreVert />
                  </IconButton>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}

        {/* Context Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <Download fontSize="small" />
            </ListItemIcon>
            Download
          </MenuItem>
          {hasPermission("write") && (
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              Rename
            </MenuItem>
          )}
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <Share fontSize="small" />
            </ListItemIcon>
            Share
          </MenuItem>
          {hasPermission("delete") && (
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <Delete fontSize="small" />
              </ListItemIcon>
              Delete
            </MenuItem>
          )}
        </Menu>

        {/* Speed Dial for Actions */}
        {speedDialActions.length > 0 && (
          <SpeedDial
            ariaLabel="SpeedDial basic example"
            sx={{ position: "fixed", bottom: 16, right: 16 }}
            icon={<SpeedDialIcon />}
          >
            {speedDialActions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                onClick={action.action}
              />
            ))}
          </SpeedDial>
        )}

        {/* Create Folder Dialog */}
        <Dialog open={createFolderOpen} onClose={() => setCreateFolderOpen(false)}>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Folder Name"
              fullWidth
              variant="outlined"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateFolderOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
