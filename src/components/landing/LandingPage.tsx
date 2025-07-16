"use client";

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
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { SmartLogo } from "@/components/common/SmartLogo";

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
      <Typography variant="body2" color="text.secondary" component="div">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

export const LandingPage: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const features = [
    {
      icon: <CloudUpload />,
      title: t("landing.features.easyUpload.title"),
      description: t("landing.features.easyUpload.description"),
    },
    {
      icon: <Search />,
      title: t("landing.features.powerfulSearch.title"),
      description: t("landing.features.powerfulSearch.description"),
    },
    {
      icon: <Security />,
      title: t("landing.features.secure.title"),
      description: t("landing.features.secure.description"),
    },
    {
      icon: <Speed />,
      title: t("landing.features.performance.title"),
      description: t("landing.features.performance.description"),
    },
    {
      icon: <Folder />,
      title: t("landing.features.organization.title"),
      description: t("landing.features.organization.description"),
    },
    {
      icon: <People />,
      title: t("landing.features.collaboration.title"),
      description: t("landing.features.collaboration.description"),
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "grey.50" }}>
      {/* Header */}
      <AppBar position="static" color="primary" elevation={0} sx={{ borderRadius: 0 }}>
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <SmartLogo variant="light" size={68} sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ color: "white !important" }}>
              {t("landing.title")}
            </Typography>
          </Box>
          <LanguageSelector />
          <Button
            color="inherit"
            startIcon={<Public />}
            onClick={() => router.push("/public-files")}
            sx={{
              mr: 1,
              ml: 2,
              color: "white !important",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            {t("navigation.publicFiles")}
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
            {t("common.login")}
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
            {t("landing.heroTitle")}
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
            {t("landing.heroSubtitle")}
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
              {t("landing.browsePublicFiles")}
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
              {t("auth.signIn")}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
            {t("landing.features.title")}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
            {t("landing.features.subtitle")}
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
            {t("landing.cta.title")}
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
            {t("landing.cta.subtitle")}
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
              {t("landing.cta.accessDashboard")}
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
              {t("landing.cta.viewPublicFiles")}
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
                <SmartLogo variant="light" size={42} sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ color: "white !important" }}>
                  ЭКитепкана
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2, color: "white !important" }} component="div">
                {t("landing.footer.description")}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom sx={{ color: "white !important" }}>
                {t("landing.footer.quickLinks")}
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
                  {t("navigation.publicFiles")}
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
                  {t("common.signIn")}
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom sx={{ color: "white !important" }}>
                {t("landing.footer.features")}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.8, color: "white !important" }} component="div">
                  {t("landing.footer.fileUploadDownload")}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, color: "white !important" }} component="div">
                  {t("landing.footer.advancedSearch")}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, color: "white !important" }} component="div">
                  {t("landing.footer.roleBasedAccess")}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, color: "white !important" }} component="div">
                  {t("landing.footer.teamCollaboration")}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: customColors.muted }} />

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ opacity: 0.8, color: "white !important" }} component="div">
              {new Date().getFullYear()} © {t("landing.footer.copyright")}
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
