"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
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
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  IconButton,
  Menu,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  Search,
  FilterList,
  ExpandMore,
  InsertDriveFile,
  Folder,
  Download,
  Share,
  MoreVert,
  Clear,
} from "@mui/icons-material";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { SearchResult, FileMetadata, Folder as FolderType } from "@/types/dms";
import { useTranslation } from "react-i18next";

interface SearchFilters {
  fileTypes: string[];
  dateRange: "all" | "today" | "week" | "month" | "year";
  isPublic?: boolean;
  tags: string[];
  minSize?: number;
  maxSize?: number;
}

export default function SearchPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    fileTypes: [],
    dateRange: "all",
    tags: [],
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<{ type: "file" | "folder"; id: number } | null>(null);

  const fileTypes = [
    { value: "pdf", label: t("search.documents") },
    { value: "doc", label: t("search.documents") },
    { value: "xls", label: t("search.documents") },
    { value: "ppt", label: t("search.documents") },
    { value: "image", label: t("search.images") },
    { value: "video", label: t("search.videos") },
    { value: "audio", label: t("search.audio") },
  ];

  const availableTags = ["document", "image", "report", "presentation", "financial", "hr", "marketing", "legal"];

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockResults: SearchResult = {
        files: [
          {
            id: 1,
            name: "annual_report_2024.pdf",
            originalName: "Annual Report 2024.pdf",
            mimeType: "application/pdf",
            size: 2048000,
            path: "/documents/reports/",
            uploadedBy: 1,
            uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
            updatedAt: new Date(),
            isPublic: false,
            downloadCount: 25,
            tags: ["report", "financial", "annual"],
            description: "Annual financial report for 2024",
          },
          {
            id: 2,
            name: "marketing_presentation.pptx",
            originalName: "Marketing Presentation Q4.pptx",
            mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            size: 5120000,
            path: "/documents/marketing/",
            uploadedBy: 2,
            uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
            updatedAt: new Date(),
            isPublic: true,
            downloadCount: 12,
            tags: ["presentation", "marketing", "quarterly"],
            description: "Q4 marketing strategy presentation",
          },
          {
            id: 3,
            name: "employee_handbook.pdf",
            originalName: "Employee Handbook 2024.pdf",
            mimeType: "application/pdf",
            size: 1536000,
            path: "/documents/hr/",
            uploadedBy: 1,
            uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
            updatedAt: new Date(),
            isPublic: true,
            downloadCount: 156,
            tags: ["document", "hr", "handbook"],
            description: "Updated employee handbook",
          },
        ],
        folders: [
          {
            id: 1,
            name: "Marketing Materials",
            path: "/documents/marketing",
            parentId: undefined,
            createdBy: 1,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
            updatedAt: new Date(),
            isPublic: true,
            description: "Marketing and promotional materials",
          },
        ],
        totalCount: 4,
        query,
      };

      // Apply filters
      let filteredFiles = mockResults.files;

      if (filters.fileTypes.length > 0) {
        filteredFiles = filteredFiles.filter((file) => {
          return filters.fileTypes.some((type) => {
            if (type === "image") return file.mimeType.startsWith("image/");
            if (type === "video") return file.mimeType.startsWith("video/");
            if (type === "audio") return file.mimeType.startsWith("audio/");
            return file.mimeType.includes(type);
          });
        });
      }

      if (filters.isPublic !== undefined) {
        filteredFiles = filteredFiles.filter((file) => file.isPublic === filters.isPublic);
      }

      if (filters.tags.length > 0) {
        filteredFiles = filteredFiles.filter((file) => file.tags?.some((tag) => filters.tags.includes(tag)));
      }

      const filteredResults = {
        ...mockResults,
        files: filteredFiles,
        totalCount: filteredFiles.length + mockResults.folders.length,
      };

      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      fileTypes: [],
      dateRange: "all",
      tags: [],
    });
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`;
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, type: "file" | "folder", id: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem({ type, id });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [filters]);

  return (
    <DashboardLayout>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom>
          {t("search.title")}
        </Typography>

        {/* Search Bar */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={t("search.searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && performSearch()}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
                }}
              />
              <Button
                variant="contained"
                onClick={performSearch}
                disabled={!query.trim() || loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? t("common.loading") : t("common.search")}
              </Button>
              <Button variant="outlined" startIcon={<FilterList />} onClick={() => setFiltersOpen(!filtersOpen)}>
                {t("common.filter")}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Filters */}
        {filtersOpen && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">{t("search.filterByType")}</Typography>
                <Button startIcon={<Clear />} onClick={clearFilters}>
                  {t("common.cancel")}
                </Button>
              </Box>

              <Grid container spacing={3}>
                {/* File Types */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    File Types
                  </Typography>
                  {fileTypes.map((type) => (
                    <FormControlLabel
                      key={type.value}
                      control={
                        <Checkbox
                          checked={filters.fileTypes.includes(type.value)}
                          onChange={(e) => {
                            const newTypes = e.target.checked
                              ? [...filters.fileTypes, type.value]
                              : filters.fileTypes.filter((t) => t !== type.value);
                            handleFilterChange("fileTypes", newTypes);
                          }}
                        />
                      }
                      label={type.label}
                    />
                  ))}
                </Grid>

                {/* Other Filters */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Other Filters
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Date Range</InputLabel>
                    <Select
                      value={filters.dateRange}
                      onChange={(e) => handleFilterChange("dateRange", e.target.value)}
                      label="Date Range"
                    >
                      <MenuItem value="all">All Time</MenuItem>
                      <MenuItem value="today">Today</MenuItem>
                      <MenuItem value="week">This Week</MenuItem>
                      <MenuItem value="month">This Month</MenuItem>
                      <MenuItem value="year">This Year</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.isPublic === true}
                        onChange={(e) => handleFilterChange("isPublic", e.target.checked ? true : undefined)}
                      />
                    }
                    label="Public files only"
                  />
                </Grid>

                {/* Tags */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Tags
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {availableTags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        clickable
                        color={filters.tags.includes(tag) ? "primary" : "default"}
                        onClick={() => {
                          const newTags = filters.tags.includes(tag)
                            ? filters.tags.filter((t) => t !== tag)
                            : [...filters.tags, tag];
                          handleFilterChange("tags", newTags);
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {searchResults && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Search Results for &quot;{searchResults.query}&quot;
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {searchResults.totalCount} results found
              </Typography>

              {/* Folders */}
              {searchResults.folders.length > 0 && (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                    Folders
                  </Typography>
                  <List>
                    {searchResults.folders.map((folder) => (
                      <ListItem key={`folder-${folder.id}`} disablePadding>
                        <ListItemButton>
                          <ListItemIcon>
                            <Folder sx={{ color: "warning.main" }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={folder.name}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {folder.path}
                                </Typography>
                                {folder.description && (
                                  <Typography variant="body2" color="text.secondary">
                                    {folder.description}
                                  </Typography>
                                )}
                                {folder.isPublic && (
                                  <Chip label="Public" size="small" color="success" sx={{ mt: 0.5 }} />
                                )}
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton onClick={(e) => handleMenuOpen(e, "folder", folder.id)}>
                              <MoreVert />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              {/* Files */}
              {searchResults.files.length > 0 && (
                <>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Files
                  </Typography>
                  <List>
                    {searchResults.files.map((file) => (
                      <ListItem key={`file-${file.id}`} disablePadding>
                        <ListItemButton>
                          <ListItemIcon>
                            <span style={{ fontSize: "24px" }}>{getFileIcon(file.mimeType)}</span>
                          </ListItemIcon>
                          <ListItemText
                            primary={file.originalName}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {formatFileSize(file.size)} • {formatTimeAgo(file.uploadedAt)} • {file.downloadCount}{" "}
                                  downloads
                                </Typography>
                                {file.description && (
                                  <Typography variant="body2" color="text.secondary">
                                    {file.description}
                                  </Typography>
                                )}
                                <Box sx={{ mt: 0.5, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                  {file.isPublic && <Chip label="Public" size="small" color="success" />}
                                  {file.tags?.map((tag) => <Chip key={tag} label={tag} size="small" />)}
                                </Box>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton onClick={(e) => handleMenuOpen(e, "file", file.id)}>
                              <MoreVert />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {/* No Results */}
              {searchResults.totalCount === 0 && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No results found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search terms or filters
                  </Typography>
                </Box>
              )}

              {/* Pagination */}
              {searchResults.totalCount > 10 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={Math.ceil(searchResults.totalCount / 10)}
                    page={page}
                    onChange={(_, newPage) => setPage(newPage)}
                    color="primary"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Context Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <Download fontSize="small" />
            </ListItemIcon>
            Download
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <Share fontSize="small" />
            </ListItemIcon>
            Share
          </MenuItem>
        </Menu>
      </Box>
    </DashboardLayout>
  );
}
