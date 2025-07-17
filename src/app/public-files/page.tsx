"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import React, { useState, useEffect } from "react";
import { FileText, ImageIcon, Video, Music, FileArchive } from "lucide-react";
import { Search, Download, Share, MoreVert, Home } from "@mui/icons-material";
import { FileIcon, FileSpreadsheet, Folder, Presentation } from "lucide-react";
import { nextcloudPublicFilesService, PublicFile } from "@/services/nextcloud-public-files";
import { Box, Card, CardContent, Typography, Grid, Button, IconButton, Stack } from "@mui/material";
import { Menu, MenuItem, Container, AppBar, Toolbar, TextField, InputAdornment } from "@mui/material";

export default function PublicFilesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [files, setFiles] = useState<PublicFile[]>([]);
  const [selectedMime, setSelectedMime] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filteredFiles, setFilteredFiles] = useState<PublicFile[]>([]);
  const [selectedItem, setSelectedItem] = useState<{ type: "file" | "folder"; id: number } | null>(null);

  const fetchFiles = async () => {
    // Example: fetch from API and set files
    try {
      const publicFiles = await nextcloudPublicFilesService.getPublicFiles();
      setLoading(false);
      setFiles(publicFiles);
      setFilteredFiles(publicFiles);
    } catch (error) {
      setFiles([]);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, type: "file" | "folder", id: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem({ type, id });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleDownload = (file: any) => {
    window.open(`/api/nextcloud/public-files/download?file=${encodeURIComponent(file.filename)}`, "_blank");
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
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

  const getFileIcon = (mimeType: string): ReactNode => {
    if (!mimeType) return <Folder size={32} />;
    if (mimeType === "application/pdf") return <FileText size={32} />;
    if (mimeType.startsWith("image/")) return <ImageIcon size={32} />;
    if (mimeType.startsWith("video/")) return <Video size={32} />;
    if (mimeType.startsWith("audio/")) return <Music size={32} />;
    if (
      mimeType === "application/msword" ||
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      return <FileText size={32} />;
    if (
      mimeType === "application/vnd.ms-excel" ||
      mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
      return <FileSpreadsheet size={32} />;
    if (
      mimeType === "application/vnd.ms-powerpoint" ||
      mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )
      return <Presentation size={32} />;
    if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("compressed"))
      return <FileArchive size={32} />;
    return <FileIcon size={32} />;
  };

  const handleNavigateToHome = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      let filtered = files;
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (file) => file.basename.toLowerCase().includes(lowerQuery) || file.mime.toLowerCase().includes(lowerQuery)
        );
      }
      if (selectedMime && selectedMime !== t("files.allTypes")) {
        filtered = filtered.filter((file) => file.mime === selectedMime);
      }
      setFilteredFiles(filtered);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, selectedMime, files]);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "grey.50" }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Button color="inherit" startIcon={<Home />} onClick={handleNavigateToHome}>
            {isAuthenticated ? t("navigation.dashboard") : t("navigation.home")}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
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
          <CardContent sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={"center"}
              justifyContent={"center"}
              sx={{ width: 1 }}
              gap={2}
            >
              <TextField
                sx={{ width: "70%" }}
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
              <TextField
                select
                label={t("files.filterByType") || "Type"}
                value={selectedMime}
                onChange={(e) => setSelectedMime(e.target.value)}
                sx={{ width: "30%" }}
                variant="outlined"
              >
                <MenuItem value={t("files.allTypes")}>{t("files.allTypes") || "All Types"}</MenuItem>
                <MenuItem value="application/pdf">PDF</MenuItem>
                <MenuItem value="image/png">PNG</MenuItem>
                <MenuItem value="image/jpeg">JPEG</MenuItem>
                <MenuItem value="image/svg+xml">SVG</MenuItem>
                <MenuItem value="text/plain">Text</MenuItem>
                <MenuItem value="audio/mpeg">MP3</MenuItem>
                <MenuItem value="video/mp4">MP4</MenuItem>
                <MenuItem value="application/msword">Word</MenuItem>
                <MenuItem value="application/vnd.ms-excel">Excel</MenuItem>
                <MenuItem value="application/vnd.ms-powerpoint">PowerPoint</MenuItem>
              </TextField>
            </Stack>
          </CardContent>
        </Card>

        {/* Content Grid */}
        <Grid container spacing={3}>
          {filteredFiles.map((file, index) => (
            <Grid item xs={12} sm={6} md={4} key={`file-${file.filename}`}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                    <Box sx={{ fontSize: "40px" }}>{getFileIcon(file.mime)}</Box>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, "file", index)}>
                      <MoreVert />
                    </IconButton>
                  </Box>
                  <Typography variant="h6" gutterBottom noWrap title={file.basename}>
                    {file.basename}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} component="div">
                    {file.mime}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" component="div">
                      {formatFileSize(file.size)} • {formatTimeAgo(file.lastmod)}
                    </Typography>
                  </Box>
                  <Button variant="contained" startIcon={<Download />} fullWidth onClick={() => handleDownload(file)}>
                    {t("common.download")}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* No Results */}
        {filteredFiles.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h5" color="text.secondary" gutterBottom component="div">
              {t("publicFiles.noPublicFiles")}
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              {searchQuery ? t("search.tryDifferentSearch") : t("publicFiles.noPublicFilesDescription")}
            </Typography>
          </Box>
        )}

        {/* Context Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem
            onClick={() => {
              if (selectedItem?.type === "file") {
                const file = filteredFiles[selectedItem.id];
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
            {t("common.share")}
          </MenuItem>
        </Menu>
      </Container>
    </Box>
  );
}
