import React from "react";
import { Box, Card } from "@mui/material";
import { FinanceTabbar } from "@/components/account/personal-area/finance/FinanceTabBar";

const Finance = () => {
  return (
    <>
      <Box sx={{ height: "100%", width: "100%" }}>
        <Card sx={{ p: 1 }}>
          <FinanceTabbar />
        </Card>
      </Box>
    </>
  );
};

export default Finance;
