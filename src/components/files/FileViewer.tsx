"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Close, Download, Share, Edit, Delete, Visibility } from "@mui/icons-material";
import { FileMetadata } from "@/types/dms";
import { useAuth } from "@/contexts/AuthContext";

interface FileViewerProps {
  open: boolean;
  onClose: () => void;
  file: FileMetadata | null;
  onDownload?: (file: FileMetadata) => void;
  onShare?: (file: FileMetadata) => void;
  onEdit?: (file: FileMetadata) => void;
  onDelete?: (file: FileMetadata) => void;
}

export const FileViewer: React.FC<FileViewerProps> = ({
  open,
  onClose,
  file,
  onDownload,
  onShare,
  onEdit,
  onDelete,
}) => {
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!file) return null;

  const formatFileSize = (bytes: number): string => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      );
    }

    const mimeType = file.mimeType.toLowerCase();

    // PDF files
    if (mimeType.includes("pdf")) {
      return (
        <Box sx={{ height: 600, width: "100%" }}>
          <iframe
            src={`/api/files/${file.id}/preview`}
            style={{ width: "100%", height: "100%", border: "none" }}
            title={file.originalName}
            onLoad={() => setLoading(false)}
            onError={() => {
              setError("Failed to load PDF preview");
              setLoading(false);
            }}
          />
        </Box>
      );
    }

    // Image files
    if (mimeType.includes("image")) {
      return (
        <Box sx={{ textAlign: "center", p: 2, position: "relative", height: 500 }}>
          <Image
            src={`/api/files/${file.id}/preview`}
            alt={file.originalName}
            fill
            style={{
              objectFit: "contain",
            }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setError("Failed to load image");
              setLoading(false);
            }}
          />
        </Box>
      );
    }

    // Video files
    if (mimeType.includes("video")) {
      return (
        <Box sx={{ textAlign: "center", p: 2 }}>
          <video
            controls
            style={{ maxWidth: "100%", maxHeight: "500px" }}
            onLoadedData={() => setLoading(false)}
            onError={() => {
              setError("Failed to load video");
              setLoading(false);
            }}
          >
            <source src={`/api/files/${file.id}/preview`} type={file.mimeType} />
            Your browser does not support the video tag.
          </video>
        </Box>
      );
    }

    // Audio files
    if (mimeType.includes("audio")) {
      return (
        <Box sx={{ textAlign: "center", p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">{file.originalName}</Typography>
            <Typography variant="body2" color="text.secondary">
              Audio File
            </Typography>
          </Box>
          <audio
            controls
            style={{ width: "100%" }}
            onLoadedData={() => setLoading(false)}
            onError={() => {
              setError("Failed to load audio");
              setLoading(false);
            }}
          >
            <source src={`/api/files/${file.id}/preview`} type={file.mimeType} />
            Your browser does not support the audio tag.
          </audio>
        </Box>
      );
    }

    // Text files and documents
    if (
      mimeType.includes("text") ||
      mimeType.includes("document") ||
      mimeType.includes("spreadsheet") ||
      mimeType.includes("presentation")
    ) {
      return (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h1" sx={{ opacity: 0.3, mb: 2 }}>
              📄
            </Typography>
            <Typography variant="h6">{file.originalName}</Typography>
            <Typography variant="body2" color="text.secondary">
              Document preview not available
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<Download />} onClick={() => onDownload?.(file)}>
            Download to View
          </Button>
        </Box>
      );
    }

    // Default fallback
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h1" sx={{ opacity: 0.3, mb: 2 }}>
          📁
        </Typography>
        <Typography variant="h6" gutterBottom>
          Preview not available
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          This file type cannot be previewed in the browser
        </Typography>
        <Button variant="outlined" startIcon={<Download />} onClick={() => onDownload?.(file)} sx={{ mt: 2 }}>
          Download File
        </Button>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: "90vh" },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1, minWidth: 0 }}>
            <Visibility />
            <Typography variant="h6" noWrap title={file.originalName}>
              {file.originalName}
            </Typography>
            {file.isPublic && <Chip label="Public" size="small" color="success" />}
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* File Info */}
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Size: {formatFileSize(file.size)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Modified: {formatDate(file.updatedAt)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Downloads: {file.downloadCount}
            </Typography>
          </Box>

          {file.description && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {file.description}
            </Typography>
          )}

          {file.tags && file.tags.length > 0 && (
            <Box sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {file.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" />
              ))}
            </Box>
          )}
        </Box>

        {/* Preview Area */}
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>{renderPreview()}</Box>
      </DialogContent>

      <DialogActions>
        <Button startIcon={<Download />} onClick={() => onDownload?.(file)}>
          Download
        </Button>

        <Button startIcon={<Share />} onClick={() => onShare?.(file)}>
          Share
        </Button>

        {hasPermission("write") && (
          <Button startIcon={<Edit />} onClick={() => onEdit?.(file)}>
            Edit
          </Button>
        )}

        {hasPermission("delete") && (
          <Button startIcon={<Delete />} color="error" onClick={() => onDelete?.(file)}>
            Delete
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
