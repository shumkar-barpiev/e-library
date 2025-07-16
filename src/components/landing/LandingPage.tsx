"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
} from "@mui/material";
import {
  CloudUpload,
  Search,
  Security,
  Speed,
  Public,
  Dashboard,
  Login,
  FileDownload,
  Folder,
  People,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { customColors } from "@/styles/theme";

interface FeatureCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <Card sx={{ height: "100%", textAlign: "center" }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ mb: 2, color: "primary.main" }}>{React.cloneElement(icon, { sx: { fontSize: 48 } })}</Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

export const LandingPage: React.FC = () => {
  const router = useRouter();

  const features = [
    {
      icon: <CloudUpload />,
      title: "Easy File Upload",
      description:
        "Drag and drop files or browse to upload. Support for all major file formats including documents, images, videos, and more.",
    },
    {
      icon: <Search />,
      title: "Powerful Search",
      description:
        "Find files instantly with advanced search and filtering. Search by name, content, tags, file type, or date range.",
    },
    {
      icon: <Security />,
      title: "Secure & Private",
      description:
        "Role-based access control ensures your files are secure. Control who can view, edit, or download your documents.",
    },
    {
      icon: <Speed />,
      title: "Fast Performance",
      description:
        "Built with modern technology for lightning-fast file operations. Quick previews and instant downloads.",
    },
    {
      icon: <Folder />,
      title: "Smart Organization",
      description:
        "Organize files in folders with tags and metadata. Create custom folder structures that work for your team.",
    },
    {
      icon: <People />,
      title: "Team Collaboration",
      description:
        "Share files and folders with team members. Track downloads and manage permissions for better collaboration.",
    },
  ];

  const stats = [
    { number: "1,000+", label: "Files Managed" },
    { number: "50+", label: "Active Users" },
    { number: "99.9%", label: "Uptime" },
    { number: "15GB+", label: "Storage Used" },
  ];

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "grey.50" }}>
      {/* Header */}
      <AppBar position="static" color="primary" elevation={0} sx={{ borderRadius: 0 }}>
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <Public sx={{ mr: 2, color: "white" }} />
            <Typography variant="h6" component="div" sx={{ color: "white !important" }}>
              E-Library JK
            </Typography>
          </Box>
          <Button
            color="inherit"
            startIcon={<Public />}
            onClick={() => router.push("/public-files")}
            sx={{
              mr: 1,
              color: "white !important",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            Public Files
          </Button>
          <Button
            color="inherit"
            startIcon={<Login />}
            onClick={() => router.push("/login")}
            sx={{
              color: "white !important",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            Sign In
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: customColors.gradients.primary,
          color: "white",
          py: 12,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "white !important",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Modern Document Management
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              opacity: 0.95,
              mb: 4,
              color: "white !important",
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            Organize, share, and manage your files with our powerful, secure, and user-friendly document management
            system
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Public />}
              onClick={() => router.push("/public-files")}
              sx={{
                backgroundColor: "white",
                color: customColors.primary,
                "&:hover": { backgroundColor: "grey.100" },
                px: 4,
                py: 1.5,
              }}
            >
              Browse Public Files
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Login />}
              onClick={() => router.push("/login")}
              sx={{
                borderColor: "white",
                color: "white",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: customColors.alpha.primary(0.1),
                },
                px: 4,
                py: 1.5,
              }}
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4} sx={{ textAlign: "center" }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Typography variant="h3" color="primary" fontWeight="bold">
                {stat.number}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {stat.label}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
            Everything You Need
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
            Powerful features designed to make document management simple, secure, and efficient for teams of any size
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <FeatureCard {...feature} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ backgroundColor: customColors.primary, color: "white", py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "white !important",
              textShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          >
            Ready to Get Started?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              opacity: 0.95,
              color: "white !important",
              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            Join our document management system and experience the power of organized, secure file storage
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Dashboard />}
              onClick={() => router.push("/login")}
              sx={{
                backgroundColor: "white",
                color: customColors.primary,
                "&:hover": { backgroundColor: "grey.100" },
                px: 4,
                py: 1.5,
              }}
            >
              Access Dashboard
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<FileDownload />}
              onClick={() => router.push("/public-files")}
              sx={{
                borderColor: "white",
                color: "white",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: customColors.alpha.primary(0.1),
                },
                px: 4,
                py: 1.5,
              }}
            >
              View Public Files
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ backgroundColor: customColors.dark, color: "white", py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Public sx={{ mr: 1, color: "white" }} />
                <Typography variant="h6" sx={{ color: "white !important" }}>
                  E-Library JK
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2, color: "white !important" }}>
                A modern, secure, and user-friendly document management system designed for teams and organizations of
                all sizes.
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom sx={{ color: "white !important" }}>
                Quick Links
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  color="inherit"
                  sx={{
                    justifyContent: "flex-start",
                    textTransform: "none",
                    color: "white !important",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                  }}
                  onClick={() => router.push("/public-files")}
                >
                  Public Files
                </Button>
                <Button
                  color="inherit"
                  sx={{
                    justifyContent: "flex-start",
                    textTransform: "none",
                    color: "white !important",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                  }}
                  onClick={() => router.push("/login")}
                >
                  Sign In
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom sx={{ color: "white !important" }}>
                Features
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.8, color: "white !important" }}>
                  File Upload & Download
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, color: "white !important" }}>
                  Advanced Search
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, color: "white !important" }}>
                  Role-based Access
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, color: "white !important" }}>
                  Team Collaboration
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: customColors.muted }} />

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ opacity: 0.8, color: "white !important" }}>
              © 2024 E-Library Document Management System. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
