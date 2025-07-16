"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  LinearProgress,
  Alert,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from "@mui/material";
import { Cloud, OpenInNew, CheckCircle, Error as ErrorIcon } from "@mui/icons-material";
import { NextcloudAuthService, NextcloudCredentials } from "@/services/nextcloud-auth";
import { nextcloudConfig } from "@/config/nextcloud";
import { useTranslation } from "react-i18next";
import { customColors } from "@/styles/theme";

interface NextcloudLoginProps {
  onSuccess: (credentials: NextcloudCredentials, userInfo: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export const NextcloudLogin: React.FC<NextcloudLoginProps> = ({ onSuccess, onError, onCancel }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [serverUrl, setServerUrl] = useState(nextcloudConfig.defaultServerUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authService, setAuthService] = useState<NextcloudAuthService | null>(null);
  const [loginWindow, setLoginWindow] = useState<Window | null>(null);
  const [pollToken, setPollToken] = useState<string | null>(null);
  const [pollEndpoint, setPollEndpoint] = useState<string | null>(null);

  const steps = [
    t("auth.nextcloud.enterServer"),
    t("auth.nextcloud.authenticateBrowser"),
    t("auth.nextcloud.waitingForAuth"),
    t("auth.nextcloud.completed"),
  ];

  useEffect(() => {
    return () => {
      // Cleanup: close login window and stop polling
      if (loginWindow && !loginWindow.closed) {
        loginWindow.close();
      }
      if (authService) {
        authService.stopPolling();
      }
    };
  }, [loginWindow, authService]);

  const handleOpen = () => {
    setOpen(true);
    setActiveStep(0);
    setError(null);
    setServerUrl("");
  };

  const handleClose = () => {
    if (loginWindow && !loginWindow.closed) {
      loginWindow.close();
    }
    if (authService) {
      authService.stopPolling();
    }
    setOpen(false);
    setActiveStep(0);
    setError(null);
    onCancel();
  };

  const validateServerUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleServerSubmit = async () => {
    if (!serverUrl.trim()) {
      setError(t("auth.nextcloud.serverRequired"));
      return;
    }

    if (!validateServerUrl(serverUrl)) {
      setError(t("auth.nextcloud.invalidServerUrl"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const service = new NextcloudAuthService({
        serverUrl: serverUrl.trim(),
        userAgent: "E-Library-DMS/1.0",
      });

      const { loginUrl, pollToken: token } = await service.initiateLoginFlow();

      setAuthService(service);
      setPollToken(token);
      setPollEndpoint(`${serverUrl.trim()}/login/v2/poll`);
      setActiveStep(1);

      // Open login URL in new window
      const newWindow = window.open(loginUrl, "nextcloud-login", "width=600,height=700,scrollbars=yes,resizable=yes");

      if (!newWindow) {
        throw new Error(t("auth.nextcloud.popupBlocked"));
      }

      setLoginWindow(newWindow);
      setActiveStep(2);

      // Start polling for authentication
      startPolling(service, token, `${serverUrl.trim()}/login/v2/poll`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.nextcloud.connectionError"));
    } finally {
      setLoading(false);
    }
  };

  const startPolling = async (service: NextcloudAuthService, token: string, endpoint: string) => {
    try {
      const credentials = await service.waitForAuthentication(token, endpoint);

      // Close the login window
      if (loginWindow && !loginWindow.closed) {
        loginWindow.close();
      }

      // Validate credentials and get user info
      const isValid = await service.validateCredentials(credentials);
      if (!isValid) {
        throw new Error(t("auth.nextcloud.invalidCredentials"));
      }

      const userInfo = await service.getUserInfo(credentials);
      setActiveStep(3);

      // Wait a moment to show success, then complete
      setTimeout(() => {
        onSuccess(credentials, userInfo);
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.nextcloud.authError"));
      setActiveStep(1); // Go back to try again
    }
  };

  const handleRetry = () => {
    setError(null);
    setActiveStep(0);
    if (authService) {
      authService.stopPolling();
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<Cloud />}
        onClick={handleOpen}
        sx={{
          borderColor: customColors.primary,
          color: customColors.primary,
          "&:hover": { borderColor: customColors.blue, backgroundColor: customColors.alpha.primary(0.1) },
        }}
      >
        {t("auth.nextcloud.signInWithNextcloud")}
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Cloud color="primary" />
            <Typography variant="h6">{t("auth.nextcloud.title")}</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stepper activeStep={activeStep} orientation="vertical">
            <Step>
              <StepLabel>{steps[0]}</StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t("auth.nextcloud.serverDescription")}
                </Typography>
                <TextField
                  fullWidth
                  label={t("auth.nextcloud.serverUrl")}
                  placeholder="https://jk.sanarip.org"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  disabled={loading}
                  margin="normal"
                />
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleServerSubmit}
                    disabled={loading || !serverUrl.trim()}
                    sx={{ mr: 1 }}
                  >
                    {loading ? t("common.loading") : t("common.next")}
                  </Button>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>{steps[1]}</StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t("auth.nextcloud.browserDescription")}
                </Typography>
                <Alert severity="info" icon={<OpenInNew />}>
                  {t("auth.nextcloud.popupInfo")}
                </Alert>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>{steps[2]}</StepLabel>
              <StepContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <LinearProgress sx={{ flexGrow: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {t("auth.nextcloud.waitingMessage")}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {t("auth.nextcloud.waitingDescription")}
                </Typography>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>{steps[3]}</StepLabel>
              <StepContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "success.main" }}>
                  <CheckCircle />
                  <Typography variant="body2">{t("auth.nextcloud.success")}</Typography>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>{t("common.cancel")}</Button>
          {error && activeStep > 0 && (
            <Button onClick={handleRetry} variant="outlined">
              {t("common.retry")}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
