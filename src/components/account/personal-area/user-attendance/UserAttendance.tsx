import React from "react";
import { Box, Card } from "@mui/material";
import { UserAttendanceTabbar } from "./UserAttendanceTabbar";

const UserAttendance = () => {
  return (
    <>
      <Box sx={{ height: "100%", width: "100%" }}>
        <Card sx={{ p: 1 }}>
          <UserAttendanceTabbar />
        </Card>
      </Box>
    </>
  );
};

export default UserAttendance;
