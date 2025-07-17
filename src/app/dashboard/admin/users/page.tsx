"use client";

import React, { useState, useEffect } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  Avatar,
  Fab,
  Badge,
} from "@mui/material";
import { MoreVert, Add, Edit, Delete, PersonAdd, Security, Block, CheckCircle } from "@mui/icons-material";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { User, UserRole } from "@/types/dms";
import { useTranslation } from "react-i18next";

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organization: string;
}

export default function UserManagementPage() {
  return (
    <AuthGuard requireAuth={true} requiredPermissions={["manage_users"]}>
      <UserManagementContent />
    </AuthGuard>
  );
}

function UserManagementContent() {
  const { user, hasPermission } = useAuth();
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"create" | "edit" | "delete">("create");
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    firstName: "",
    lastName: "",
    role: "users",
    organization: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockUsers: User[] = [
        {
          id: 1,
          email: "admin@company.com",
          firstName: "Admin",
          lastName: "User",
          role: "admin",
          organization: "Head Office",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365),
          updatedAt: new Date(),
        },
        {
          id: 2,
          email: "editor@company.com",
          firstName: "Jane",
          lastName: "Editor",
          role: "editors",
          organization: "Content Team",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180),
          updatedAt: new Date(),
        },
        {
          id: 3,
          email: "user@company.com",
          firstName: "John",
          lastName: "User",
          role: "users",
          organization: "Marketing",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
          updatedAt: new Date(),
        },
        {
          id: 4,
          email: "guest@company.com",
          firstName: "Guest",
          lastName: "Account",
          role: "guest",
          organization: "External",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
          updatedAt: new Date(),
        },
      ];

      setUsers(mockUsers);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, selectedUser: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(selectedUser);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleDialogOpen = (type: "create" | "edit" | "delete", user?: User) => {
    setDialogType(type);
    if (type === "edit" && user) {
      setFormData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organization: user.organization || "",
      });
      setSelectedUser(user);
    } else if (type === "create") {
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        role: "users",
        organization: "",
      });
    } else if (type === "delete" && user) {
      setSelectedUser(user);
    }
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      role: "users",
      organization: "",
    });
  };

  const handleFormSubmit = async () => {
    try {
      if (dialogType === "create") {
        // TODO: Implement user creation
        const newUser: User = {
          id: Math.max(...users.map((u) => u.id)) + 1,
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUsers((prev) => [...prev, newUser]);
      } else if (dialogType === "edit" && selectedUser) {
        // TODO: Implement user update
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, ...formData, updatedAt: new Date() } : u))
        );
      } else if (dialogType === "delete" && selectedUser) {
        // TODO: Implement user deletion
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      }
      handleDialogClose();
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getRoleColor = (
    role: UserRole
  ): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (role) {
      case "admin":
        return "error";
      case "editors":
        return "warning";
      case "users":
        return "primary";
      case "guest":
        return "default";
      default:
        return "default";
    }
  };

  const getRoleStats = () => {
    const stats = users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      },
      {} as Record<UserRole, number>
    );

    return [
      { role: "admin", count: stats.admin || 0, label: t("users.roles.admin") },
      { role: "editors", count: stats.editors || 0, label: t("users.roles.editors") },
      { role: "users", count: stats.users || 0, label: t("users.roles.users") },
      { role: "guest", count: stats.guest || 0, label: t("users.roles.guest") },
    ];
  };

  if (!hasPermission("manage_users")) {
    return (
      <DashboardLayout>
        <Alert severity="error">{t("users.noPermission")}</Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4">{t("users.title")}</Typography>
          <Button variant="contained" startIcon={<PersonAdd />} onClick={() => handleDialogOpen("create")}>
            {t("users.addUser")}
          </Button>
        </Box>

        {/* User Statistics */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          {getRoleStats().map((stat) => (
            <Card key={stat.role} sx={{ minWidth: 150 }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h4" color={getRoleColor(stat.role as UserRole)}>
                  {stat.count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Users Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t("users.allUsers", { count: users.length })}
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("users.table.user")}</TableCell>
                    <TableCell>{t("users.table.email")}</TableCell>
                    <TableCell>{t("users.table.role")}</TableCell>
                    <TableCell>{t("users.table.organization")}</TableCell>
                    <TableCell>{t("users.table.created")}</TableCell>
                    <TableCell>{t("users.table.actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((userRow) => (
                    <TableRow key={userRow.id}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar sx={{ mr: 2 }}>
                            {userRow.firstName[0]}
                            {userRow.lastName[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body1">
                              {userRow.firstName} {userRow.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {userRow.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{userRow.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={t(`users.roles.${userRow.role}`)}
                          color={getRoleColor(userRow.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{userRow.organization}</TableCell>
                      <TableCell>{formatDate(userRow.createdAt)}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, userRow)}
                          disabled={userRow.id === user?.id} // Prevent self-modification
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Context Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => handleDialogOpen("edit", selectedUser!)}>
            <Edit sx={{ mr: 1 }} />
            {t("users.edit")}
          </MenuItem>
          <MenuItem onClick={() => handleDialogOpen("delete", selectedUser!)} sx={{ color: "error.main" }}>
            <Delete sx={{ mr: 1 }} />
            {t("users.delete")}
          </MenuItem>
        </Menu>

        {/* User Dialog */}
        <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialogType === "create" && t("users.dialog.add")}
            {dialogType === "edit" && t("users.dialog.edit")}
            {dialogType === "delete" && t("users.dialog.delete")}
          </DialogTitle>

          <DialogContent>
            {dialogType === "delete" ? (
              <Typography>
                {t("users.dialog.confirmDelete", {
                  firstName: selectedUser?.firstName,
                  lastName: selectedUser?.lastName,
                })}
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                <TextField
                  label={t("users.table.email")}
                  type="email"
                  fullWidth
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />

                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    label={t("users.table.firstName")}
                    fullWidth
                    value={formData.firstName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  />
                  <TextField
                    label={t("users.table.lastName")}
                    fullWidth
                    value={formData.lastName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  />
                </Box>

                <FormControl fullWidth>
                  <InputLabel>{t("users.table.role")}</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                    label={t("users.table.role")}
                  >
                    <MenuItem value="admin">{t("users.roles.admin")}</MenuItem>
                    <MenuItem value="editors">{t("users.roles.editors")}</MenuItem>
                    <MenuItem value="users">{t("users.roles.users")}</MenuItem>
                    <MenuItem value="guest">{t("users.roles.guest")}</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label={t("users.table.organization")}
                  fullWidth
                  value={formData.organization}
                  onChange={(e) => setFormData((prev) => ({ ...prev, organization: e.target.value }))}
                />
              </Box>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={handleDialogClose}>{t("common.cancel")}</Button>
            <Button
              onClick={handleFormSubmit}
              variant="contained"
              color={dialogType === "delete" ? "error" : "primary"}
            >
              {dialogType === "create" && t("users.dialog.create")}
              {dialogType === "edit" && t("users.dialog.save")}
              {dialogType === "delete" && t("users.dialog.delete")}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
