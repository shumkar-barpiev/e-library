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
          Settings
        </Typography>

        {saveStatus === "saved" && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Settings saved successfully!
          </Alert>
        )}

        {saveStatus === "error" && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to save settings. Please try again.
          </Alert>
        )}

        <Paper sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab icon={<Person />} label="Profile" />
              <Tab icon={<Notifications />} label="Notifications" />
              <Tab icon={<Storage />} label="Preferences" />
              <Tab icon={<Security />} label="Security" />
            </Tabs>
          </Box>

          {/* Profile Tab */}
          <TabPanel value={tabValue} index={0}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profile Information
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
                      Change Avatar
                    </Button>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, firstName: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, lastName: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Organization"
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
                    {saveStatus === "saving" ? "Saving..." : "Save Profile"}
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
                  Notification Preferences
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
                    label="Email notifications"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                    Receive email notifications for important updates
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
                    label="File upload notifications"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                    Get notified when files are uploaded or shared with you
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
                    label="Share notifications"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                    Receive notifications when files are shared with you
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
                    label="System notifications"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                    Get notified about system maintenance and updates
                  </Typography>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleNotificationsSave}
                    disabled={saveStatus === "saving"}
                  >
                    {saveStatus === "saving" ? "Saving..." : "Save Notifications"}
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
                  Application Preferences
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Default View</InputLabel>
                      <Select
                        value={preferences.defaultView}
                        onChange={(e) => setPreferences((prev) => ({ ...prev, defaultView: e.target.value }))}
                        label="Default View"
                      >
                        <MenuItem value="grid">Grid View</MenuItem>
                        <MenuItem value="list">List View</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Items per Page</InputLabel>
                      <Select
                        value={preferences.itemsPerPage}
                        onChange={(e) =>
                          setPreferences((prev) => ({ ...prev, itemsPerPage: e.target.value as number }))
                        }
                        label="Items per Page"
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
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={preferences.language}
                        onChange={(e) => setPreferences((prev) => ({ ...prev, language: e.target.value }))}
                        label="Language"
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="es">Spanish</MenuItem>
                        <MenuItem value="fr">French</MenuItem>
                        <MenuItem value="de">German</MenuItem>
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
                      label="Auto-save changes"
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
                      label="Dark mode (Coming soon)"
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
                    {saveStatus === "saving" ? "Saving..." : "Save Preferences"}
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
                  Security Settings
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Change Password
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            type="password"
                            label="Current Password"
                            placeholder="Enter your current password"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth type="password" label="New Password" placeholder="Enter new password" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="password"
                            label="Confirm New Password"
                            placeholder="Confirm new password"
                          />
                        </Grid>
                      </Grid>
                      <Button variant="outlined" sx={{ mt: 2 }}>
                        Update Password
                      </Button>
                    </CardContent>
                  </Card>

                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Active Sessions
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Monitor and manage your active sessions
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
                            <Typography variant="body1">Current Session</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Windows • Chrome • Active now
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="success.main">
                            Current
                          </Typography>
                        </Box>
                      </Box>

                      <Button variant="outlined" color="error" sx={{ mt: 2 }}>
                        Sign Out All Other Sessions
                      </Button>
                    </CardContent>
                  </Card>

                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Account Information
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Your account details and role information
                      </Typography>

                      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                        <Typography variant="body2">
                          <strong>User ID:</strong> {user?.id}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Role:</strong> {user?.role.toUpperCase()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Account Created:</strong>{" "}
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
