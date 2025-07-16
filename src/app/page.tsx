"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LandingPage } from "@/components/landing/LandingPage";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        setShowLanding(true);
      }
    }
  }, [isAuthenticated, loading, router]);

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
          Loading ЭКитепкана...
        </Typography>
      </Box>
    );
  }

  if (showLanding) {
    return <LandingPage />;
  }

  return null;
}
