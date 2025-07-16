"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Paper, TextField, Button, Typography, Container, Alert } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { customColors } from "@/styles/theme";
import { useTranslation } from "react-i18next";

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginPage() {
  const { login, isAuthenticated, error: authError } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Update local error state when auth error changes
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(formData.username, formData.password);
      // Redirect will be handled by the auth context effect
      router.push("/dashboard");
    } catch (err) {
      setError(t("auth.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: customColors.gradients.primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            padding: 4,
            width: "100%",
            backgroundColor: "white",
            borderRadius: 3,
            border: `1px solid ${customColors.neutral}`,
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            align="center"
            gutterBottom
            sx={{ color: customColors.primary, fontWeight: 700 }}
          >
            {t("landing.title")}
          </Typography>
          <Typography variant="h5" align="center" color={customColors.muted} gutterBottom sx={{ mb: 3 }}>
            {t("auth.signIn")}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label={t("auth.username")}
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t("auth.password")}
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: customColors.primary,
                "&:hover": { backgroundColor: customColors.blue },
              }}
              disabled={loading}
            >
              {loading ? t("auth.signingIn") : t("auth.signIn")}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
