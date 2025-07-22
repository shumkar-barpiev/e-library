"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import React, { useState, useEffect } from "react";
import { Search, Download, Home } from "@mui/icons-material";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import DocumentPreviewer from "@/components/other/DocumentPreviewer";
import { FileText, ImageIcon, Video, Music, FileArchive } from "lucide-react";
import { FileIcon, FileSpreadsheet, Folder, Presentation } from "lucide-react";
import { nextcloudPublicFilesService, PublicFile } from "@/services/nextcloud-public-files";
import { MenuItem, Container, AppBar, Toolbar, TextField, InputAdornment } from "@mui/material";
import { Box, Card, CardContent, Typography, Grid, Button, IconButton, Stack } from "@mui/material";

const mimeTypeGroups: Record<string, string[]> = {
  pdf: ["application/pdf"],
  image: ["image/png", "image/jpeg", "image/svg+xml", "image/gif", "image/jpg"],
  audio: ["audio/mpeg", "audio/mp3"],
  video: ["video/mp4"],
  word: ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  excel: ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  powerpoint: [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
};

export default function Main() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [files, setFiles] = useState<PublicFile[]>([]);
  const [selectedMime, setSelectedMime] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filteredFiles, setFilteredFiles] = useState<PublicFile[]>([]);

  const fetchFiles = async () => {
    try {
      const publicFiles = await nextcloudPublicFilesService.getPublicFiles();
      setLoading(false);
      setFiles(publicFiles);
      setFilteredFiles(publicFiles);
    } catch (error) {
      setFiles([]);
    }
  };

  const getFileTypeLabel = (file: PublicFile): string => {
    const ext = file.basename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "png":
      case "jpeg":
      case "jpg":
      case "gif":
        return "Image";
      case "mp3":
        return "Audio";
      case "mp4":
        return "Video";
      case "pdf":
        return "PDF";
      case "docx":
        return "Word Document";
      case "xlsx":
        return "Excel Spreadsheet";
      case "pptx":
        return "PowerPoint Presentation";
      default:
        return file.mime;
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDownload = (file: any) => {
    window.open(getFileUrl(file), "_blank");
  };

  const getFileUrl = (file: PublicFile) => {
    const baseUrl = process.env.NEXT_PUBLIC_NEXTCLOUD_SERVER_URL;
    const shareToken = process.env.NEXT_PUBLIC_NEXTCLOUD_PUBLIC_FOLDER_TOKEN;

    if (!shareToken) {
      console.error("NEXT_PUBLIC_NEXTCLOUD_PUBLIC_FOLDER_TOKEN is not defined");
      return "";
    }

    if (!baseUrl) {
      console.error("NEXT_PUBLIC_NEXTCLOUD_SERVER_URL is not defined");
      return "";
    }

    return `${baseUrl}/public.php/dav/files/${shareToken}/${encodeURIComponent(file.basename)}`;
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
      return t("time.today");
    } else if (diffInDays === 1) {
      return t("time.yesterday");
    } else if (diffInDays < 7) {
      return t("time.daysAgo", { count: diffInDays });
    } else if (diffInDays < 30) {
      return t("time.weeksAgo", { count: Math.floor(diffInDays / 7) });
    } else {
      return t("time.monthsAgo", { count: Math.floor(diffInDays / 30) });
    }
  };

  const getFileIcon = (mimeType: string): ReactNode => {
    if (!mimeType) return <Image src="/assets/mimeTypeIcons/imageIcon.png" alt="file" width={72} height={72} />;
    if (mimeType === "application/pdf")
      return <Image src="/assets/mimeTypeIcons/pdfIcon.png" alt="pdf" width={72} height={72} />;
    if (mimeType.startsWith("image/"))
      return <Image src="/assets/mimeTypeIcons/imageIcon.png" alt="image" width={72} height={72} />;
    if (mimeType.startsWith("audio/"))
      return <Image src="/assets/mimeTypeIcons/audioIcon.png" alt="audio" width={72} height={72} />;
    if (
      mimeType === "application/msword" ||
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      return <Image src="/assets/mimeTypeIcons/docxIcon.png" alt="docx" width={72} height={72} />;
    if (
      mimeType === "application/vnd.ms-excel" ||
      mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
      return <Image src="/assets/mimeTypeIcons/excelIcon.png" alt="excel" width={72} height={72} />;
    if (
      mimeType === "application/vnd.ms-powerpoint" ||
      mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )
      return <Image src="/assets/mimeTypeIcons/pptxIcon.png" alt="pptx" width={72} height={72} />;
    // fallback to generic image icon for unknown types
    return <Image src="/assets/mimeTypeIcons/imageIcon.png" alt="file" width={72} height={72} />;
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
      if (selectedMime && selectedMime !== "all") {
        const mimes = mimeTypeGroups[selectedMime] || [selectedMime];
        filtered = filtered.filter((file) => mimes.includes(file.mime));
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
                <MenuItem value="all">{t("files.allTypes") || "All Types"}</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="image">Image</MenuItem>
                <MenuItem value="audio">Audio</MenuItem>
                <MenuItem value="video">Video</MenuItem>
                <MenuItem value="word">Word</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="powerpoint">PowerPoint</MenuItem>
              </TextField>
            </Stack>
          </CardContent>
        </Card>

        {/* Document Previewer Modal */}
        {previewUrl && (
          <DocumentPreviewer
            fileUrl={previewUrl}
            onClose={() => setPreviewUrl(null)}
            filename={filteredFiles.find((file) => getFileUrl(file) === previewUrl)?.basename || ""}
          />
        )}

        {/* Content Grid */}
        <Grid container spacing={3}>
          {filteredFiles.map((file, index) => (
            <Grid item xs={12} sm={6} md={4} key={`file-${file.filename}`}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                    <Box sx={{ fontSize: "80px" }}>{getFileIcon(file.mime)}</Box>
                    <IconButton
                      title={t("files.preview")}
                      color="primary"
                      onClick={() => setPreviewUrl(getFileUrl(file))}
                      disabled={
                        !["png", "jpeg", "jpg", "gif", "mp3", "mp4", "pdf", "docx", "xlsx", "pptx"].includes(
                          file.basename.split(".").pop()?.toLowerCase() || ""
                        )
                      }
                    >
                      <AspectRatioIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="h6" gutterBottom noWrap title={file.basename}>
                    {file.basename}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0 }} component="div">
                    {getFileTypeLabel(file)}
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" component="div">
                      {formatFileSize(file.size)} • {formatTimeAgo(file.lastmod)}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems={"center"} justifyContent={"space-between"}>
                    <Button variant="contained" startIcon={<Download />} onClick={() => handleDownload(file)}>
                      {t("common.download")}
                    </Button>
                  </Stack>
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
      </Container>
    </Box>
  );
}
