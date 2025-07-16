"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
} from "@mui/material";
import { InsertDriveFile, Folder, CloudUpload, Download, TrendingUp } from "@mui/icons-material";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardStats, ActivityLog, FileMetadata } from "@/types/dms";
import { customColors } from "@/styles/theme";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for dashboard stats
    const mockStats: DashboardStats = {
      totalFiles: 1245,
      totalFolders: 89,
      totalStorage: 15728640000, // 15GB in bytes
      recentUploads: [
        {
          id: 1,
          name: "annual_report_2024.pdf",
          originalName: "Annual Report 2024.pdf",
          mimeType: "application/pdf",
          size: 2048000,
          path: "/documents/reports/",
          uploadedBy: 1,
          uploadedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          updatedAt: new Date(),
          isPublic: false,
          downloadCount: 5,
        },
        {
          id: 2,
          name: "product_catalog.pdf",
          originalName: "Product Catalog.pdf",
          mimeType: "application/pdf",
          size: 5120000,
          path: "/documents/marketing/",
          uploadedBy: 2,
          uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          updatedAt: new Date(),
          isPublic: true,
          downloadCount: 23,
        },
        {
          id: 3,
          name: "meeting_notes.docx",
          originalName: "Meeting Notes.docx",
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          size: 256000,
          path: "/documents/meetings/",
          uploadedBy: 1,
          uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          updatedAt: new Date(),
          isPublic: false,
          downloadCount: 1,
        },
      ],
      popularFiles: [
        {
          id: 4,
          name: "employee_handbook.pdf",
          originalName: "Employee Handbook.pdf",
          mimeType: "application/pdf",
          size: 1024000,
          path: "/documents/hr/",
          uploadedBy: 1,
          uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
          updatedAt: new Date(),
          isPublic: true,
          downloadCount: 156,
        },
        {
          id: 5,
          name: "company_policies.pdf",
          originalName: "Company Policies.pdf",
          mimeType: "application/pdf",
          size: 512000,
          path: "/documents/policies/",
          uploadedBy: 1,
          uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 2 weeks ago
          updatedAt: new Date(),
          isPublic: true,
          downloadCount: 89,
        },
      ],
      activityLog: [
        {
          id: 1,
          userId: 1,
          action: "upload",
          resourceType: "file",
          resourceId: 1,
          resourceName: "annual_report_2024.pdf",
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
        },
        {
          id: 2,
          userId: 2,
          action: "download",
          resourceType: "file",
          resourceId: 4,
          resourceName: "employee_handbook.pdf",
          timestamp: new Date(Date.now() - 1000 * 60 * 45),
        },
        {
          id: 3,
          userId: 1,
          action: "move",
          resourceType: "file",
          resourceId: 3,
          resourceName: "meeting_notes.docx",
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
        },
      ],
    };

    setStats(mockStats);
    setLoading(false);
  }, []);

  const formatFileSize = (bytes: number): string => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return t("dashboard.fileInfo.timeAgo", { time: `${diffInMinutes} ${t("common.minutes")}` });
    } else if (diffInMinutes < 1440) {
      return t("dashboard.fileInfo.timeAgo", { time: `${Math.floor(diffInMinutes / 60)} ${t("common.hours")}` });
    } else {
      return t("dashboard.fileInfo.timeAgo", { time: `${Math.floor(diffInMinutes / 1440)} ${t("common.days")}` });
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "upload":
        return <CloudUpload />;
      case "download":
        return <Download />;
      default:
        return <InsertDriveFile />;
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("image")) return "🖼️";
    if (mimeType.includes("video")) return "🎥";
    if (mimeType.includes("audio")) return "🎵";
    if (mimeType.includes("document")) return "📝";
    return "📁";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom>
          {t("dashboard.welcomeBack", { name: user?.firstName })}
        </Typography>

        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {t("dashboard.role")}: <Chip label={user?.role.toUpperCase()} size="small" />
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${customColors.primary}15 0%, ${customColors.secondary}15 100%)`,
                border: `1px solid ${customColors.primary}30`,
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <InsertDriveFile sx={{ mr: 2, color: customColors.primary, fontSize: 32 }} />
                  <Box>
                    <Typography color={customColors.muted} gutterBottom>
                      {t("dashboard.stats.totalFiles")}
                    </Typography>
                    <Typography variant="h5" sx={{ color: customColors.charcoal, fontWeight: 600 }}>
                      {stats?.totalFiles.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${customColors.warm}20 0%, ${customColors.accent}15 100%)`,
                border: `1px solid ${customColors.warm}30`,
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Folder sx={{ mr: 2, color: customColors.warm, fontSize: 32 }} />
                  <Box>
                    <Typography color={customColors.muted} gutterBottom>
                      {t("dashboard.stats.totalFolders")}
                    </Typography>
                    <Typography variant="h5" sx={{ color: customColors.charcoal, fontWeight: 600 }}>
                      {stats?.totalFolders}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${customColors.blue}15 0%, ${customColors.secondary}15 100%)`,
                border: `1px solid ${customColors.blue}30`,
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TrendingUp sx={{ mr: 2, color: customColors.blue, fontSize: 32 }} />
                  <Box>
                    <Typography color={customColors.muted} gutterBottom>
                      {t("dashboard.stats.storageUsed")}
                    </Typography>
                    <Typography variant="h5" sx={{ color: customColors.charcoal, fontWeight: 600 }}>
                      {stats && formatFileSize(stats.totalStorage)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${customColors.accent}15 0%, ${customColors.warm}15 100%)`,
                border: `1px solid ${customColors.accent}30`,
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CloudUpload sx={{ mr: 2, color: customColors.accent, fontSize: 32 }} />
                  <Box>
                    <Typography color={customColors.muted} gutterBottom>
                      {t("dashboard.stats.recentUploads")}
                    </Typography>
                    <Typography variant="h5" sx={{ color: customColors.charcoal, fontWeight: 600 }}>
                      {stats?.recentUploads.length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Recent Uploads */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t("dashboard.sections.recentUploads")}
                </Typography>
                <List>
                  {stats?.recentUploads.map((file) => (
                    <ListItem key={file.id}>
                      <ListItemIcon>
                        <span style={{ fontSize: "24px" }}>{getFileIcon(file.mimeType)}</span>
                      </ListItemIcon>
                      <ListItemText
                        primary={file.originalName}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {formatFileSize(file.size)} • {formatTimeAgo(file.uploadedAt)}
                            </Typography>
                            {file.isPublic && <Chip label="Public" size="small" color="success" />}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Popular Files */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t("dashboard.sections.popularFiles")}
                </Typography>
                <List>
                  {stats?.popularFiles.map((file) => (
                    <ListItem key={file.id}>
                      <ListItemIcon>
                        <span style={{ fontSize: "24px" }}>{getFileIcon(file.mimeType)}</span>
                      </ListItemIcon>
                      <ListItemText
                        primary={file.originalName}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {file.downloadCount} downloads • {formatFileSize(file.size)}
                            </Typography>
                            {file.isPublic && <Chip label="Public" size="small" color="success" />}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Activity Log */}
          {hasPermission("manage_system") && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t("dashboard.sections.activityLog")}
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Action</TableCell>
                          <TableCell>Resource</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats?.activityLog.map((activity) => (
                          <TableRow key={activity.id}>
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                {getActionIcon(activity.action)}
                                <Typography sx={{ ml: 1, textTransform: "capitalize" }}>{activity.action}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{activity.resourceName}</TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Avatar sx={{ width: 24, height: 24, mr: 1 }}>U</Avatar>
                                User {activity.userId}
                              </Box>
                            </TableCell>
                            <TableCell>{formatTimeAgo(activity.timestamp)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
