"use client";

import React from "react";
import { customColors } from "@/styles/theme";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/auth/AuthGuard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Box, Grid, Card, CardContent, Typography, List } from "@mui/material";
import { NextcloudStatusWidget } from "@/components/dashboard/NextcloudStatusWidget";
import { ListItem, ListItemText, ListItemIcon, Chip, LinearProgress } from "@mui/material";
import { InsertDriveFile, Folder, CloudUpload, Download, TrendingUp } from "@mui/icons-material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar } from "@mui/material";

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true} requiredPermissions={["read"]}>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { user, hasPermission } = useAuth();
  const { t } = useTranslation();
  const { stats, loading, error, isNextcloudConnected, refreshData } = useDashboardData();

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
          <Chip
            label={isNextcloudConnected ? "Nextcloud Connected" : "Using Mock Data"}
            size="small"
            color={isNextcloudConnected ? "success" : "warning"}
            sx={{ ml: 1 }}
          />
        </Typography>

        {error && (
          <Box sx={{ mb: 2 }}>
            <Chip label={`Error: ${error}`} color="error" />
          </Box>
        )}

        {/* Nextcloud Status Widget */}
        <NextcloudStatusWidget
          isConnected={isNextcloudConnected}
          error={error}
          onRefresh={refreshData}
          refreshing={loading}
        />

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
                  {isNextcloudConnected ? "Recent Files (Live from Nextcloud)" : "Recent Uploads (Sample Data)"}
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
