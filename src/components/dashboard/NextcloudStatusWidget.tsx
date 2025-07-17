import React from "react";
import { Card, CardContent, Typography, Box, Chip, IconButton, Tooltip, Alert } from "@mui/material";
import { Refresh, CloudDone, CloudOff, Info } from "@mui/icons-material";
import { customColors } from "@/styles/theme";

interface NextcloudStatusWidgetProps {
  isConnected: boolean;
  error?: string | null;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const NextcloudStatusWidget: React.FC<NextcloudStatusWidgetProps> = ({
  isConnected,
  error,
  onRefresh,
  refreshing = false,
}) => {
  return (
    <Card
      sx={{
        mb: 2,
        background: isConnected
          ? `linear-gradient(135deg, ${customColors.blue}10 0%, ${customColors.primary}10 100%)`
          : `linear-gradient(135deg, ${customColors.warm}10 0%, ${customColors.accent}10 100%)`,
        border: `1px solid ${isConnected ? customColors.blue : customColors.warm}30`,
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isConnected ? (
              <CloudDone sx={{ mr: 2, color: customColors.blue, fontSize: 32 }} />
            ) : (
              <CloudOff sx={{ mr: 2, color: customColors.warm, fontSize: 32 }} />
            )}

            <Box>
              <Typography variant="h6" sx={{ color: customColors.charcoal }}>
                Data Source
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={isConnected ? "Nextcloud Connected" : "Mock Data"}
                  size="small"
                  color={isConnected ? "success" : "warning"}
                />
                {isConnected && (
                  <Tooltip title="Real-time data from Nextcloud Files API">
                    <Info sx={{ fontSize: 16, color: customColors.muted }} />
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {onRefresh && (
              <Tooltip title="Refresh data">
                <IconButton
                  onClick={onRefresh}
                  disabled={refreshing}
                  sx={{
                    color: customColors.primary,
                    "&:hover": {
                      backgroundColor: `${customColors.primary}10`,
                    },
                  }}
                >
                  <Refresh
                    sx={{
                      animation: refreshing ? "spin 1s linear infinite" : "none",
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {error && (
          <Alert
            severity="warning"
            sx={{ mt: 2 }}
            action={
              onRefresh && (
                <IconButton color="inherit" size="small" onClick={onRefresh} disabled={refreshing}>
                  <Refresh />
                </IconButton>
              )
            }
          >
            <Typography variant="body2">{error}. Using mock data as fallback.</Typography>
          </Alert>
        )}

        {isConnected && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Showing recent files from Nextcloud based on your access permissions.
          </Typography>
        )}

        {!isConnected && !error && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Nextcloud connection not available. Displaying sample data for demonstration.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
