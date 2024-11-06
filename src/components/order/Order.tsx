"use client";
import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, Typography } from "@mui/material";
import ActionCard from "@/components/order/cards/ActionCard";
import OrderDetails from "@/components/order/order-details/OrderDetails";
import ChatBox from "@/components/chat/ChatBox";
import { useOrderStore } from "@/stores/orders/orders";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Snackbar from "@/components/other/Snackbar";
import { useAppealsStore } from "@/stores/appeals/appeals";
import { useAxelorStore } from "@/stores/axelor/axelor";

export default function Order() {
  const appealStore = useAppealsStore();
  const orderStore = useOrderStore();
  const searchParams = useSearchParams();
  const axelorStore = useAxelorStore();
  const [chatId, setChatId] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const orderId = parseInt(searchParams.get("id") || "");
    const appealId = parseInt(searchParams.get("appeal") || "");

    axelorStore.fetchConfig();
    setChatId(parseInt(searchParams.get("chat") || "null"));

    if (appealId) {
      appealStore.fetchItem(appealId, controller.signal).then((appeal) => {
        appeal && orderId && orderStore.fetchItem(orderId);
      });
    }

    return () => {
      controller.abort();
      appealStore.clearStore();
      orderStore.clearStore();
    };
  }, [searchParams.get("appeal"), searchParams.get("chat")]);

  if (orderStore.error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography>Order Not Found</Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={1} p={1} height="100%">
      <Grid container spacing={1}>
        <Grid item md={3.5}>
          <ActionCard />
        </Grid>
        {searchParams.get("chat") && (
          <Grid item md={8.5}>
            <ChatBox order chatId={chatId} page="/orders" />
          </Grid>
        )}
      </Grid>
      <OrderDetails />
      <Snackbar />
    </Box>
  );
}
