"use client";

import React from "react";
import { Box, Container, Typography, Grid, Card, CardContent, Chip, Button, Alert } from "@mui/material";
import { customColors } from "@/styles/theme";
import { Palette, CheckCircle, Info, Warning, Error } from "@mui/icons-material";

export const BrandShowcase: React.FC = () => {
  const colorItems = [
    {
      name: "Primary",
      color: customColors.primary,
      description: "Main brand color for headers, buttons, and primary actions",
    },
    { name: "Secondary", color: customColors.secondary, description: "Secondary actions and highlights" },
    { name: "Accent", color: customColors.accent, description: "Call-to-action buttons and important highlights" },
    { name: "Neutral", color: customColors.neutral, description: "Borders, backgrounds, and subtle elements" },
    { name: "Muted", color: customColors.muted, description: "Secondary text and disabled states" },
    { name: "Dark", color: customColors.dark, description: "Headings and important text" },
    { name: "Warm", color: customColors.warm, description: "Success states and positive feedback" },
    { name: "Blue", color: customColors.blue, description: "Information and neutral feedback" },
    { name: "Charcoal", color: customColors.charcoal, description: "Body text and primary content" },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
          <Palette sx={{ mr: 2, color: customColors.primary, fontSize: 32 }} />
          <Typography variant="h3" sx={{ color: customColors.dark, fontWeight: 700 }}>
            Brand Color System
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ color: customColors.muted, maxWidth: 600, mx: "auto" }}>
          A comprehensive color palette designed for consistency, accessibility, and brand recognition across the
          E-Library JK
        </Typography>
      </Box>

      {/* Color Palette Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {colorItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: "100%", border: `1px solid ${customColors.neutral}` }}>
              <CardContent>
                <Box
                  sx={{
                    width: "100%",
                    height: 80,
                    backgroundColor: item.color,
                    borderRadius: 2,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: item.name === "Neutral" ? customColors.charcoal : "white",
                      fontWeight: 600,
                      backgroundColor: item.name === "Neutral" ? "white" : "transparent",
                      px: item.name === "Neutral" ? 1 : 0,
                      borderRadius: 1,
                    }}
                  >
                    {item.color}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ color: customColors.dark, fontWeight: 600, mb: 1 }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" sx={{ color: customColors.muted }}>
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Component Examples */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ color: customColors.dark, fontWeight: 600, mb: 4, textAlign: "center" }}>
          Component Examples
        </Typography>

        <Grid container spacing={4}>
          {/* Buttons */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: customColors.dark, mb: 3 }}>
                Button Variations
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button variant="contained" color="primary" size="large">
                  Primary Action
                </Button>
                <Button variant="contained" color="secondary" size="large">
                  Secondary Action
                </Button>
                <Button variant="outlined" color="primary" size="large">
                  Outlined Button
                </Button>
                <Button variant="text" size="large" sx={{ color: customColors.muted }}>
                  Text Button
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* Alerts & Chips */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: customColors.dark, mb: 3 }}>
                Alerts & Status
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Alert severity="error" icon={<Error />}>
                  Error message using accent color
                </Alert>
                <Alert severity="info" icon={<Info />}>
                  Info message using blue color
                </Alert>
                <Alert severity="success" icon={<CheckCircle />}>
                  Success message using warm color
                </Alert>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
                  <Chip label="Primary" color="primary" />
                  <Chip label="Secondary" color="secondary" />
                  <Chip label="Status" sx={{ backgroundColor: customColors.warm, color: "white" }} />
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Typography Examples */}
      <Card sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h4" sx={{ color: customColors.dark, fontWeight: 700, mb: 2 }}>
          Typography Hierarchy
        </Typography>
        <Typography variant="h5" sx={{ color: customColors.primary, fontWeight: 600, mb: 2 }}>
          Heading 5 - Primary Color
        </Typography>
        <Typography variant="h6" sx={{ color: customColors.secondary, fontWeight: 600, mb: 3 }}>
          Heading 6 - Secondary Color
        </Typography>
        <Typography variant="body1" sx={{ color: customColors.charcoal, mb: 2 }}>
          Body text uses charcoal color for optimal readability and contrast. This ensures content is accessible and
          easy to read across all devices and screen sizes.
        </Typography>
        <Typography variant="body2" sx={{ color: customColors.muted }}>
          Secondary text uses muted color for less important information, creating proper visual hierarchy and content
          organization.
        </Typography>
      </Card>
    </Container>
  );
};
