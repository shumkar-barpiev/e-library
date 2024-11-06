"use client";
import { Inter } from "next/font/google";
import { createTheme } from "@mui/material/styles";

export const inter = Inter({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const theme = createTheme({
  palette: {
    primary: {
      main: "#5570F1",
    },
    secondary: {
      light: "#C2C6CA",
      main: "#45464E",
    },
    success: {
      main: "#519C66",
    },
    error: {
      main: "#CC5F5F",
    },
    warning: {
      main: "#FFA500",
    },
    info: {
      main: "#5F8CCC",
    },
    divider: "#F1F3F9",
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    fontSize: 13,
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& label": {
            fontSize: 13,
            color: "secondary.main",
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          "& .MuiListItemText-primary": {
            fontSize: 13,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #C2C6CA",
          borderRadius: 6,
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});

export default theme;
