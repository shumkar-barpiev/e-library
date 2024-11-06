import React from "react";
import { Box } from "@mui/material";

function SecondStep({
  updateData,
  data,
}: {
  updateData: (step: string, data: Record<string, any>) => void;
  data: Record<string, any> | null;
}) {
  return <Box sx={{ mt: 3 }}>Second step</Box>;
}

export default SecondStep;
