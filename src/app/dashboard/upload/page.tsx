"use client";

import React, { useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Autocomplete,
} from "@mui/material";
import { CloudUpload, Delete, CheckCircle, Error, Cancel, InsertDriveFile } from "@mui/icons-material";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { UploadProgress, Folder } from "@/types/dms";
import { useMetaFileStore } from "@/stores/metafile/metafile";
import { useTranslation } from "react-i18next";

interface UploadItem extends UploadProgress {
  file: File;
  folderId?: number;
  isPublic: boolean;
  tags: string[];
  description: string;
}

export default function UploadPage() {
  const { user, hasPermission } = useAuth();
  const { t } = useTranslation();
  const { saveFile, loading, error } = useMetaFileStore();
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<number | undefined>();
  const [globalTags, setGlobalTags] = useState<string[]>([]);
  const [globalIsPublic, setGlobalIsPublic] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Mock folders data
  const folders: Folder[] = [
    {
      id: 1,
      name: "Documents",
      path: "/documents",
      parentId: undefined,
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
    },
    {
      id: 2,
      name: "Images",
      path: "/images",
      parentId: undefined,
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: true,
    },
    {
      id: 3,
      name: "Reports",
      path: "/reports",
      parentId: undefined,
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
    },
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const newUploadItems: UploadItem[] = files.map((file) => ({
      fileId: Math.random().toString(36).substring(7),
      fileName: file.name,
      progress: 0,
      status: "uploading" as const,
      file,
      folderId: selectedFolder,
      isPublic: globalIsPublic,
      tags: [...globalTags],
      description: "",
    }));

    setUploadItems((prev) => [...prev, ...newUploadItems]);
  };

  const removeUploadItem = (fileId: string) => {
    setUploadItems((prev) => prev.filter((item) => item.fileId !== fileId));
  };

  const updateUploadItem = (fileId: string, updates: Partial<UploadItem>) => {
    setUploadItems((prev) => prev.map((item) => (item.fileId === fileId ? { ...item, ...updates } : item)));
  };

  const handleUploadAll = async () => {
    setShowUploadDialog(false);

    for (const item of uploadItems) {
      if (item.status === "completed") continue;

      try {
        updateUploadItem(item.fileId, { status: "uploading", progress: 0 });

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadItems((prev) =>
            prev.map((prevItem) =>
              prevItem.fileId === item.fileId
                ? { ...prevItem, progress: Math.min(100, prevItem.progress + 10) }
                : prevItem
            )
          );
        }, 200);

        const request = {
          data: {
            fileName: item.file.name,
            isPublic: item.isPublic,
            tags: item.tags,
            description: item.description,
            folderId: item.folderId,
          },
        };

        const result = await saveFile(item.file, request);

        clearInterval(progressInterval);

        if (result) {
          updateUploadItem(item.fileId, {
            status: "completed",
            progress: 100,
          });
        } else {
          updateUploadItem(item.fileId, {
            status: "error",
            error: "Upload failed",
          });
        }
      } catch (error) {
        updateUploadItem(item.fileId, {
          status: "error",
          error: error && typeof error === "object" && "message" in error ? (error as Error).message : "Upload failed",
        });
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "xls":
      case "xlsx":
        return "📊";
      case "ppt":
      case "pptx":
        return "📈";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "🖼️";
      case "mp4":
      case "avi":
      case "mov":
        return "🎥";
      case "mp3":
      case "wav":
        return "🎵";
      default:
        return "📁";
    }
  };

  const availableTags = ["document", "image", "report", "presentation", "financial", "hr", "marketing", "legal"];

  if (!hasPermission("write")) {
    return (
      <DashboardLayout>
        <Alert severity="error">{t("upload.uploadError")}</Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom>
          {t("upload.title")}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Upload Settings */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t("upload.description")}
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>{t("files.folderName")}</InputLabel>
                <Select
                  value={selectedFolder || ""}
                  onChange={(e) => setSelectedFolder((e.target.value as number) || undefined)}
                  label={t("files.folderName")}
                >
                  <MenuItem value="">{t("files.rootFolder")}</MenuItem>
                  {folders.map((folder) => (
                    <MenuItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={<Switch checked={globalIsPublic} onChange={(e) => setGlobalIsPublic(e.target.checked)} />}
                label={t("upload.makePublic")}
              />
            </Box>

            <Autocomplete
              multiple
              options={availableTags}
              value={globalTags}
              onChange={(_, newValue) => setGlobalTags(newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label={t("upload.defaultTags")} placeholder={t("upload.addTags")} />
              )}
            />
          </CardContent>
        </Card>

        {/* Drop Zone */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              sx={{
                border: `2px dashed ${dragActive ? "primary.main" : "grey.300"}`,
                borderRadius: 1,
                p: 4,
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: dragActive ? "action.hover" : "transparent",
                transition: "all 0.2s ease",
              }}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {t("upload.dragDrop")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("upload.supportedFormats")}
              </Typography>
              <input
                id="file-input"
                type="file"
                multiple
                hidden
                onChange={handleFileInput}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mp3,.wav"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Upload Queue */}
        {uploadItems.length > 0 && (
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">
                  {t("upload.selectedFiles")} ({uploadItems.length} {t("common.files")})
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setShowUploadDialog(true)}
                  disabled={loading || uploadItems.every((item) => item.status === "completed")}
                >
                  Upload All
                </Button>
              </Box>

              <List>
                {uploadItems.map((item) => (
                  <ListItem key={item.fileId}>
                    <ListItemIcon>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "24px", marginRight: "8px" }}>{getFileIcon(item.fileName)}</span>
                        {item.status === "completed" && <CheckCircle color="success" />}
                        {item.status === "error" && <Error color="error" />}
                      </Box>
                    </ListItemIcon>

                    <ListItemText
                      primary={item.fileName}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatFileSize(item.file.size)}
                            {item.folderId && ` • ${folders.find((f) => f.id === item.folderId)?.name}`}
                            {item.isPublic && " • Public"}
                          </Typography>

                          {item.tags.length > 0 && (
                            <Box sx={{ mt: 0.5 }}>
                              {item.tags.map((tag) => (
                                <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                              ))}
                            </Box>
                          )}

                          {item.status === "uploading" && (
                            <Box sx={{ mt: 1 }}>
                              <LinearProgress variant="determinate" value={item.progress} />
                              <Typography variant="caption">{item.progress}%</Typography>
                            </Box>
                          )}

                          {item.status === "error" && (
                            <Typography variant="body2" color="error">
                              {item.error}
                            </Typography>
                          )}
                        </Box>
                      }
                    />

                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => removeUploadItem(item.fileId)}
                        disabled={item.status === "uploading"}
                      >
                        {item.status === "uploading" ? <Cancel /> : <Delete />}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {/* Upload Confirmation Dialog */}
        <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)}>
          <DialogTitle>Confirm Upload</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to upload {uploadItems.filter((item) => item.status !== "completed").length} files?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Files will be uploaded to:{" "}
              {selectedFolder ? folders.find((f) => f.id === selectedFolder)?.name : "Root Folder"}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowUploadDialog(false)}>Cancel</Button>
            <Button onClick={handleUploadAll} variant="contained">
              Upload
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
