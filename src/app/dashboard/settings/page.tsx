"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Avatar,
  Grid,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import { Person, Security, Notifications, Storage, Save, Edit } from "@mui/icons-material";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    organization: user?.organization || "",
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    uploadNotifications: true,
    shareNotifications: true,
    systemNotifications: false,
  });
  const [preferences, setPreferences] = useState({
    defaultView: "grid",
    itemsPerPage: 25,
    autoSave: true,
    darkMode: false,
    language: "en",
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileSave = async () => {
    setSaveStatus("saving");
    try {
      // TODO: Implement actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleNotificationsSave = async () => {
    setSaveStatus("saving");
    try {
      // TODO: Implement actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handlePreferencesSave = async () => {
    setSaveStatus("saving");
    try {
      // TODO: Implement actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom>
          {t("settings.title")}
        </Typography>

        {saveStatus === "saved" && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {t("settings.saved")}
          </Alert>
        )}

        {saveStatus === "error" && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {t("settings.saveError")}
          </Alert>
        )}

        <Paper sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab icon={<Person />} label={t("settings.tabs.profile")} />
              <Tab icon={<Notifications />} label={t("settings.tabs.notifications")} />
              <Tab icon={<Storage />} label={t("settings.tabs.preferences")} />
              <Tab icon={<Security />} label={t("settings.tabs.security")} />
            </Tabs>
          </Box>

          {/* Profile Tab */}
          <TabPanel value={tabValue} index={0}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t("settings.profile.title")}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar sx={{ width: 80, height: 80, mr: 2, fontSize: "2rem" }}>
                    {profileData.firstName[0]}
                    {profileData.lastName[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {profileData.firstName} {profileData.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.role.toUpperCase()}
                    </Typography>
                    <Button startIcon={<Edit />} size="small" sx={{ mt: 1 }}>
                      {t("settings.profile.changeAvatar")}
                    </Button>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t("settings.profile.firstName")}
                      value={profileData.firstName}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, firstName: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t("settings.profile.lastName")}
                      value={profileData.lastName}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, lastName: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t("settings.profile.email")}
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t("settings.profile.organization")}
                      value={profileData.organization}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, organization: e.target.value }))}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleProfileSave}
                    disabled={saveStatus === "saving"}
                  >
                    {saveStatus === "saving" ? t("common.saving") : t("settings.profile.save")}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={tabValue} index={1}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t("settings.notifications.title")}
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.emailNotifications}
                        onChange={(e) =>
                          setNotifications((prev) => ({ ...prev, emailNotifications: e.target.checked }))
                        }
                      />
                    }
                    label={t("settings.notifications.email")}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                    {t("settings.notifications.emailDesc")}
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.uploadNotifications}
                        onChange={(e) =>
                          setNotifications((prev) => ({ ...prev, uploadNotifications: e.target.checked }))
                        }
                      />
                    }
                    label={t("settings.notifications.upload")}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                    {t("settings.notifications.uploadDesc")}
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.shareNotifications}
                        onChange={(e) =>
                          setNotifications((prev) => ({ ...prev, shareNotifications: e.target.checked }))
                        }
                      />
                    }
                    label={t("settings.notifications.share")}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                    {t("settings.notifications.shareDesc")}
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.systemNotifications}
                        onChange={(e) =>
                          setNotifications((prev) => ({ ...prev, systemNotifications: e.target.checked }))
                        }
                      />
                    }
                    label={t("settings.notifications.system")}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                    {t("settings.notifications.systemDesc")}
                  </Typography>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleNotificationsSave}
                    disabled={saveStatus === "saving"}
                  >
                    {saveStatus === "saving" ? t("common.saving") : t("settings.notifications.save")}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Preferences Tab */}
          <TabPanel value={tabValue} index={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t("settings.preferences.title")}
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t("settings.preferences.defaultView")}</InputLabel>
                      <Select
                        value={preferences.defaultView}
                        onChange={(e) => setPreferences((prev) => ({ ...prev, defaultView: e.target.value }))}
                        label={t("settings.preferences.defaultView")}
                      >
                        <MenuItem value="grid">{t("settings.preferences.gridView")}</MenuItem>
                        <MenuItem value="list">{t("settings.preferences.listView")}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t("settings.preferences.itemsPerPage")}</InputLabel>
                      <Select
                        value={preferences.itemsPerPage}
                        onChange={(e) =>
                          setPreferences((prev) => ({ ...prev, itemsPerPage: e.target.value as number }))
                        }
                        label={t("settings.preferences.itemsPerPage")}
                      >
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                        <MenuItem value={100}>100</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t("settings.preferences.language")}</InputLabel>
                      <Select
                        value={preferences.language}
                        onChange={(e) => setPreferences((prev) => ({ ...prev, language: e.target.value }))}
                        label={t("settings.preferences.language")}
                      >
                        <MenuItem value="ru">{t("settings.languages.ru")}</MenuItem>
                        <MenuItem value="kg">{t("settings.languages.kg")}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.autoSave}
                          onChange={(e) => setPreferences((prev) => ({ ...prev, autoSave: e.target.checked }))}
                        />
                      }
                      label={t("settings.preferences.autoSave")}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.darkMode}
                          onChange={(e) => setPreferences((prev) => ({ ...prev, darkMode: e.target.checked }))}
                        />
                      }
                      label={t("settings.preferences.darkMode")}
                      disabled
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handlePreferencesSave}
                    disabled={saveStatus === "saving"}
                  >
                    {saveStatus === "saving" ? t("common.saving") : t("settings.preferences.save")}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={tabValue} index={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t("settings.security.title")}
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {t("settings.security.changePassword")}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            type="password"
                            label={t("settings.security.currentPassword")}
                            placeholder={t("settings.security.enterCurrentPassword")}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="password"
                            label={t("settings.security.newPassword")}
                            placeholder={t("settings.security.enterNewPassword")}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="password"
                            label={t("settings.security.confirmNewPassword")}
                            placeholder={t("settings.security.confirmNewPassword")}
                          />
                        </Grid>
                      </Grid>
                      <Button variant="outlined" sx={{ mt: 2 }}>
                        {t("settings.security.updatePassword")}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {t("settings.security.activeSessions")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {t("settings.security.activeSessionsDesc")}
                      </Typography>

                      <Box sx={{ mt: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                          }}
                        >
                          <Box>
                            <Typography variant="body1">{t("settings.security.currentSession")}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Windows • Chrome • {t("settings.security.activeNow")}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="success.main">
                            {t("settings.security.current")}
                          </Typography>
                        </Box>
                      </Box>

                      <Button variant="outlined" color="error" sx={{ mt: 2 }}>
                        {t("settings.security.signOutAllOtherSessions")}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {t("settings.security.accountInformation")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {t("settings.security.accountInformationDesc")}
                      </Typography>

                      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                        <Typography variant="body2">
                          <strong>{t("settings.security.userId")}:</strong> {user?.id}
                        </Typography>
                        <Typography variant="body2">
                          <strong>{t("settings.security.role")}:</strong> {user?.role.toUpperCase()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>{t("settings.security.accountCreated")}:</strong>{" "}
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}
