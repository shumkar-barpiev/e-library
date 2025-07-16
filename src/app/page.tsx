"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Box, CircularProgress, Typography } from "@mui/material";
import { LandingPage } from "@/components/landing/LandingPage";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // If user is authenticated, redirect to dashboard
        router.push("/dashboard");
      } else {
        // If user is not authenticated, show landing page
        setShowLanding(true);
      }
    }
  }, [isAuthenticated, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading E-Library JK...
        </Typography>
      </Box>
    );
  }

  // Show landing page for guests
  if (showLanding) {
    return <LandingPage />;
  }

  // This should not be reached, but keeping as fallback
  return null;
}
