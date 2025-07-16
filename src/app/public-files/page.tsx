"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Container,
  AppBar,
  Toolbar,
  Button,
} from "@mui/material";
import { Search, Download, Share, MoreVert, InsertDriveFile, Folder, Public, Home } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { FileMetadata, Folder as FolderType } from "@/types/dms";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

export default function PublicFilesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<{ type: "file" | "folder"; id: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicContent();
  }, []);

  const loadPublicContent = async () => {
    setLoading(true);
    try {
      // Mock public files and folders
      const mockPublicFiles: FileMetadata[] = [
        {
          id: 1,
          name: "company_brochure.pdf",
          originalName: "Company Brochure 2024.pdf",
          mimeType: "application/pdf",
          size: 2048000,
          path: "/public/marketing/",
          uploadedBy: 1,
          uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
          updatedAt: new Date(),
          isPublic: true,
          downloadCount: 245,
          tags: ["brochure", "marketing", "company"],
          description: "Official company brochure with product information",
        },
        {
          id: 2,
          name: "employee_handbook.pdf",
          originalName: "Employee Handbook.pdf",
          mimeType: "application/pdf",
          size: 1536000,
          path: "/public/hr/",
          uploadedBy: 1,
          uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
          updatedAt: new Date(),
          isPublic: true,
          downloadCount: 156,
          tags: ["handbook", "hr", "policies"],
          description: "Employee handbook and company policies",
        },
        {
          id: 3,
          name: "product_catalog.pdf",
          originalName: "Product Catalog 2024.pdf",
          mimeType: "application/pdf",
          size: 5120000,
          path: "/public/products/",
          uploadedBy: 2,
          uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
          updatedAt: new Date(),
          isPublic: true,
          downloadCount: 89,
          tags: ["catalog", "products", "pricing"],
          description: "Complete product catalog with pricing",
        },
        {
          id: 4,
          name: "company_logo.png",
          originalName: "Company Logo High Resolution.png",
          mimeType: "image/png",
          size: 512000,
          path: "/public/brand/",
          uploadedBy: 1,
          uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
          updatedAt: new Date(),
          isPublic: true,
          downloadCount: 324,
          tags: ["logo", "brand", "image"],
          description: "High resolution company logo for media use",
        },
      ];

      const mockPublicFolders: FolderType[] = [
        {
          id: 1,
          name: "Marketing Materials",
          path: "/public/marketing",
          parentId: undefined,
          createdBy: 1,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
          updatedAt: new Date(),
          isPublic: true,
          description: "Public marketing materials and brochures",
        },
        {
          id: 2,
          name: "Brand Assets",
          path: "/public/brand",
          parentId: undefined,
          createdBy: 1,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
          updatedAt: new Date(),
          isPublic: true,
          description: "Company logos, fonts, and brand guidelines",
        },
        {
          id: 3,
          name: "Product Information",
          path: "/public/products",
          parentId: undefined,
          createdBy: 2,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
          updatedAt: new Date(),
          isPublic: true,
          description: "Product catalogs and specifications",
        },
      ];

      setFiles(mockPublicFiles);
      setFolders(mockPublicFolders);
    } catch (error) {
      console.error("Failed to load public content:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(
    (file) =>
      file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredFolders = folders.filter(
    (folder) =>
      folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      folder.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, type: "file" | "folder", id: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem({ type, id });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleDownload = (file: FileMetadata) => {
    // TODO: Implement actual download functionality
    console.log("Downloading file:", file.originalName);
    // Update download count
    setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, downloadCount: f.downloadCount + 1 } : f)));
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      return `${Math.floor(diffInDays / 7)} weeks ago`;
    } else {
      return `${Math.floor(diffInDays / 30)} months ago`;
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("image")) return "🖼️";
    if (mimeType.includes("video")) return "🎥";
    if (mimeType.includes("audio")) return "🎵";
    if (mimeType.includes("document")) return "📝";
    if (mimeType.includes("presentation")) return "📈";
    if (mimeType.includes("spreadsheet")) return "📊";
    return "📁";
  };

  const handleNavigateToHome = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "grey.50" }}>
      {/* Header */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Public sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: "white" }}>
            {t("landing.title")}
          </Typography>
          <Button color="inherit" startIcon={<Home />} onClick={handleNavigateToHome}>
            {isAuthenticated ? t("navigation.dashboard") : t("navigation.home")}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h3" gutterBottom>
            {t("publicFiles.title")}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("publicFiles.description")}
          </Typography>
        </Box>

        {/* Search Bar */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={t("files.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </CardContent>
        </Card>

        {/* Statistics */}
        <Box sx={{ display: "flex", gap: 2, mb: 4, justifyContent: "center" }}>
          <Card sx={{ textAlign: "center", minWidth: 120 }}>
            <CardContent>
              <Typography variant="h4" color="primary">
                {filteredFiles.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("navigation.publicFiles")}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ textAlign: "center", minWidth: 120 }}>
            <CardContent>
              <Typography variant="h4" color="warning.main">
                {filteredFolders.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("files.fileName")}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ textAlign: "center", minWidth: 120 }}>
            <CardContent>
              <Typography variant="h4" color="success.main">
                {files.reduce((sum, file) => sum + file.downloadCount, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("dashboard.fileInfo.downloads")}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Content Grid */}
        <Grid container spacing={3}>
          {/* Folders */}
          {filteredFolders.map((folder) => (
            <Grid item xs={12} sm={6} md={4} key={`folder-${folder.id}`}>
              <Card sx={{ cursor: "pointer", height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                    <Folder sx={{ fontSize: 40, color: "warning.main" }} />
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
                  <Typography variant="h6" gutterBottom noWrap>
                    {folder.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {folder.description}
                  </Typography>
                  <Chip label="Public Folder" size="small" color="success" />
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Files */}
          {filteredFiles.map((file) => (
            <Grid item xs={12} sm={6} md={4} key={`file-${file.id}`}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                    <Box sx={{ fontSize: "40px" }}>{getFileIcon(file.mimeType)}</Box>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, "file", file.id)}>
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography variant="h6" gutterBottom noWrap title={file.originalName}>
                    {file.originalName}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {file.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatFileSize(file.size)} • {formatTimeAgo(file.uploadedAt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {file.downloadCount} {t("dashboard.fileInfo.downloads")}
                    </Typography>
                  </Box>

                  {file.tags && file.tags.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      {file.tags.slice(0, 3).map((tag) => (
                        <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                      {file.tags.length > 3 && <Chip label={`+${file.tags.length - 3}`} size="small" />}
                    </Box>
                  )}

                  <Button variant="contained" startIcon={<Download />} fullWidth onClick={() => handleDownload(file)}>
                    {t("common.download")}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* No Results */}
        {filteredFiles.length === 0 && filteredFolders.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {t("publicFiles.noPublicFiles")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {searchQuery ? t("search.tryDifferentSearch") : t("publicFiles.noPublicFilesDescription")}
            </Typography>
          </Box>
        )}

        {/* Context Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem
            onClick={() => {
              if (selectedItem?.type === "file") {
                const file = files.find((f) => f.id === selectedItem.id);
                if (file) handleDownload(file);
              }
              handleMenuClose();
            }}
          >
            <Download sx={{ mr: 1 }} />
            {t("common.download")}
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Share sx={{ mr: 1 }} />
            Share Link
          </MenuItem>
        </Menu>

        {/* Footer */}
        <Box sx={{ mt: 8, py: 4, textAlign: "center", borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="body2" color="text.secondary">
            © 2024 E-Library Document Management System. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
