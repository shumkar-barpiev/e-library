"use client";
import { Inter } from "next/font/google";
import { createTheme } from "@mui/material/styles";

export const inter = Inter({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Brandbook Color Palette
const brandColors = {
  primary: "#0c2c84", // Deep navy blue - primary brand color
  secondary: "#3566c5", // Bright blue - secondary actions
  accent: "#be5e5b", // Warm red - highlights and CTAs
  neutral: "#d1d5db", // Light gray - backgrounds and borders
  muted: "#677586", // Blue gray - secondary text
  dark: "#524e60", // Dark purple gray - headings
  warm: "#dbab84", // Warm beige - success states
  blue: "#2d5397", // Medium blue - info states
  charcoal: "#444444", // Dark gray - body text
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: brandColors.primary,
      light: "#1e3a8a",
      dark: "#0a1f5c",
      contrastText: "#ffffff",
    },
    secondary: {
      main: brandColors.secondary,
      light: "#4f7bd9",
      dark: "#2451a0",
      contrastText: "#ffffff",
    },
    error: {
      main: brandColors.accent,
      light: "#ca7673",
      dark: "#a04e4b",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
      contrastText: "#000000",
    },
    info: {
      main: brandColors.blue,
      light: "#4472b8",
      dark: "#1e3976",
      contrastText: "#ffffff",
    },
    success: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
      contrastText: "#ffffff",
    },
    grey: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: brandColors.neutral,
      300: "#9ca3af",
      400: brandColors.muted,
      500: "#6b7280",
      600: brandColors.dark,
      700: "#374151",
      800: "#1f2937",
      900: brandColors.charcoal,
    },
    background: {
      default: "#f9fafb",
      paper: "#ffffff",
    },
    text: {
      primary: brandColors.charcoal,
      secondary: brandColors.muted,
    },
    divider: brandColors.neutral,
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    fontSize: 13,
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      color: brandColors.dark,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      color: brandColors.dark,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      color: brandColors.dark,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      color: brandColors.dark,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      color: brandColors.dark,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: "1.125rem",
      fontWeight: 600,
      color: brandColors.dark,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: "1rem",
      color: brandColors.charcoal,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      color: brandColors.muted,
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      textTransform: "none" as const,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          textTransform: "none",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          },
        },
        contained: {
          "&:hover": {
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          },
        },
        outlined: {
          borderWidth: 2,
          "&:hover": {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          border: `1px solid ${brandColors.neutral}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${brandColors.neutral}`,
        },
        elevation1: {
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        },
        elevation2: {
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        },
        elevation3: {
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& label": {
            fontSize: 13,
            color: brandColors.muted,
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "& fieldset": {
              borderColor: brandColors.neutral,
              borderWidth: 2,
            },
            "&:hover fieldset": {
              borderColor: brandColors.muted,
            },
            "&.Mui-focused fieldset": {
              borderColor: brandColors.primary,
            },
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          "& .MuiListItemText-primary": {
            fontSize: 13,
            color: brandColors.charcoal,
          },
          "& .MuiListItemText-secondary": {
            color: brandColors.muted,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: brandColors.primary,
          color: "#ffffff",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ffffff",
          borderRight: `1px solid ${brandColors.neutral}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "4px 8px",
          "&:hover": {
            backgroundColor: `${brandColors.primary}0a`,
          },
          "&.Mui-selected": {
            backgroundColor: `${brandColors.primary}15`,
            color: brandColors.primary,
            "&:hover": {
              backgroundColor: `${brandColors.primary}20`,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        colorPrimary: {
          backgroundColor: `${brandColors.primary}15`,
          color: brandColors.primary,
        },
        colorSecondary: {
          backgroundColor: `${brandColors.secondary}15`,
          color: brandColors.secondary,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardError: {
          backgroundColor: `${brandColors.accent}10`,
          color: brandColors.accent,
          border: `1px solid ${brandColors.accent}30`,
        },
        standardInfo: {
          backgroundColor: `${brandColors.blue}10`,
          color: brandColors.blue,
          border: `1px solid ${brandColors.blue}30`,
        },
        standardSuccess: {
          backgroundColor: `${brandColors.warm}20`,
          color: brandColors.dark,
          border: `1px solid ${brandColors.warm}50`,
        },
      },
    },
  },
});

// Custom color utilities for components
export const customColors = {
  ...brandColors,
  gradients: {
    primary: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`,
    accent: `linear-gradient(135deg, ${brandColors.accent} 0%, ${brandColors.warm} 100%)`,
    neutral: `linear-gradient(135deg, ${brandColors.muted} 0%, ${brandColors.dark} 100%)`,
  },
  alpha: {
    primary: (opacity: number) =>
      `${brandColors.primary}${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0")}`,
    secondary: (opacity: number) =>
      `${brandColors.secondary}${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0")}`,
    accent: (opacity: number) =>
      `${brandColors.accent}${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0")}`,
  },
};

export default theme;
