"use client";

import React, { useState } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Badge,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  CloudUpload as UploadIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Public as PublicIcon,
  AccountCircle,
  Notifications,
  Logout,
} from "@mui/icons-material";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { customColors } from "@/styles/theme";

const drawerWidth = 240;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  text: string;
  icon: React.ReactElement;
  href: string;
  roles: string[];
}

const navigationItems: NavigationItem[] = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    href: "/dashboard",
    roles: ["admin", "editor", "user", "guest"],
  },
  {
    text: "File Browser",
    icon: <FolderIcon />,
    href: "/dashboard/files",
    roles: ["admin", "editor", "user", "guest"],
  },
  {
    text: "Upload Files",
    icon: <UploadIcon />,
    href: "/dashboard/upload",
    roles: ["admin", "editor", "user"],
  },
  {
    text: "Search",
    icon: <SearchIcon />,
    href: "/dashboard/search",
    roles: ["admin", "editor", "user", "guest"],
  },
  {
    text: "Public Files",
    icon: <PublicIcon />,
    href: "/public-files",
    roles: ["admin", "editor", "user", "guest"],
  },
  {
    text: "User Management",
    icon: <PeopleIcon />,
    href: "/dashboard/admin/users",
    roles: ["admin"],
  },
  {
    text: "Settings",
    icon: <SettingsIcon />,
    href: "/dashboard/settings",
    roles: ["admin", "editor", "user"],
  },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, hasPermission } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    router.push("/login");
  };

  const filteredNavigationItems = navigationItems.filter((item) => user && item.roles.includes(user.role));

  const drawer = (
    <div>
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            color: customColors.primary,
            fontWeight: 600,
          }}
        >
          E-Library JK
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredNavigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={pathname === item.href}
              onClick={() => router.push(item.href)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: `${customColors.primary}15`,
                  "& .MuiListItemIcon-root": {
                    color: customColors.primary,
                  },
                  "& .MuiListItemText-primary": {
                    color: customColors.primary,
                    fontWeight: 600,
                  },
                },
                "&:hover": {
                  backgroundColor: `${customColors.primary}08`,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: pathname === item.href ? customColors.primary : customColors.muted,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  "& .MuiListItemText-primary": {
                    color: pathname === item.href ? customColors.primary : customColors.charcoal,
                    fontWeight: pathname === item.href ? 600 : 400,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" }, color: "white !important" }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              color: "white !important",
            }}
          >
            Document Management System
          </Typography>

          <IconButton sx={{ color: "white !important" }}>
            <Badge badgeContent={4} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <IconButton onClick={handleProfileMenuOpen} sx={{ color: "white !important" }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: customColors.secondary,
                color: "white !important",
              }}
            >
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={handleProfileMenuClose}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleProfileMenuClose();
                router.push("/dashboard/settings");
              }}
            >
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
