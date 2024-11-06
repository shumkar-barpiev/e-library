import { Box, Grid, Stack } from "@mui/material";
import ActionCard from "@/components/order/cards/ActionCard";
import OrderDetails from "@/components/order/order-details/OrderDetails";
import ChatBox from "@/components/chat/ChatBox";
import { Suspense } from "react";

export default function Order() {
  return (
    <>
      <Box display="flex" flexDirection="column" gap={1} p={1}>
        <Box sx={{ height: "580px" }}></Box>
        <Box
          display="flex"
          gap={1}
          sx={{ position: "fixed", bgcolor: "#fff", zIndex: 100, top: "10px", paddingBottom: "15px" }}
        >
          <Grid container direction="row" spacing={1}>
            <Grid item xs={6}>
              <ActionCard />
            </Grid>
            <Grid item xs={6} sx={{ paddingRight: "10px" }}>
              <ChatBox order chatId={null} page="/page" />
            </Grid>
          </Grid>
        </Box>

        <Suspense fallback={<div>Loading...</div>}>
          <OrderDetails />
        </Suspense>
      </Box>
    </>
  );
}
