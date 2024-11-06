"use client";

import React, { useState } from "react";
import Snackbar from "@/components/other/Snackbar";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Profile from "@/components/account/personal-area/profile/Profile";
import { CardHeader, Divider, Grid, Box, Card, Stack, IconButton } from "@mui/material";
import { PersonalAreaTabBar } from "@/components/account/personal-area/PersonalAreaTabBar";
import { CurrentUserProvider } from "@/components/account/personal-area/current-user/CurrentUserProvider";

export default function AccountPage() {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <>
      <CurrentUserProvider>
        <Box
          sx={{
            p: 2,
            width: 1,
            height: "100%",
            display: "flex",
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Card sx={{ height: "100%", width: "100%", overflow: { xs: "auto", md: "hidden" } }}>
            <Grid container sx={{ direction: { xs: "column", md: "row" } }}>
              {isExpanded && (
                <Grid
                  item
                  sx={{
                    height: "auto",
                    borderRight: { xs: "", md: "1px solid #bdbdbd" },
                    width: { xs: "100%", md: "25%" },
                  }}
                >
                  <CardHeader title="Личный кабинет" />
                  <Divider />
                  <Box p={3}>
                    <Profile />
                  </Box>
                </Grid>
              )}
              <Grid item sx={{ height: "auto", width: { xs: "100%", md: `${isExpanded ? "75%" : "100%"}` } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <PersonalAreaTabBar />
                </Stack>
              </Grid>
            </Grid>
          </Card>

          <IconButton
            sx={{
              width: 22,
              height: 22,
              top: "38px",
              color: "white",
              bgcolor: "#5F8CCC",
              position: "absolute",
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
              flexDirection: "column",
              left: `${isExpanded ? "24.9%" : "6px"}`,
              "&:hover": {
                backgroundColor: "#5F8CCC",
                color: "white",
              },
            }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </IconButton>
        </Box>
      </CurrentUserProvider>
      <Snackbar />
    </>
  );
}
