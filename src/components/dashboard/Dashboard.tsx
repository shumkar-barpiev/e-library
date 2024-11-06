"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Card, Grid, Typography } from "@mui/material";
import ChatBox from "@/components/chat/ChatBox";
import { useOrderStore } from "@/stores/orders/orders";
import Snackbar from "@/components/other/Snackbar";
import { useAppealsStore } from "@/stores/appeals/appeals";
import Summary from "@/components/dashboard/dashboard-details/Summary";
import AppealsDataTable from "@/components/appeals/table/AppealsDataTable";
import { DevicesChart } from "@/components/dashboard/dashboard-details/DevicesChart";
import { SalesChart } from "./dashboard-details/SalesChart";
import Contacts from "../chat/Contacts";
import { Countries } from "./dashboard-details/Countries";
import { useChatStore } from "@/stores/chat/chat";
import { useDashboardStore } from "@/stores/dashboard/dashboard";
import { ruMonths } from "@/utils/date";
import { IChart } from "@/models/dashboard/dashboard";
import CardHeader from "@mui/material/CardHeader";
import * as React from "react";
import { formatNumber } from "@/utils/utils";

let defaultDestination: IChart[] = [
  {
    name: "Полис ОМС",
    v1: 12,
  },
  {
    name: "Жалоба",
    v1: 12,
  },
  {
    name: "Лекар. обеспечение",
    v1: 12,
  },
  {
    name: "Консультация",
    v1: 12,
  },
  {
    name: "Негатив",
    v1: 12,
  },
];

const Dashboard = () => {
  const searchParams = useSearchParams();

  const [destinations, setDestinations] = useState<IChart[]>(defaultDestination);
  const [sales, setSales] = useState<IChart[]>();

  const appealStore = useAppealsStore();
  const orderStore = useOrderStore();
  const dashboardStore = useDashboardStore();
  const appealsStore = useAppealsStore();
  const { currentUserId } = useChatStore();

  useEffect(() => {
    const controller = new AbortController();

    const orderId = parseInt(searchParams.get("id") || "");
    const appealId = parseInt(searchParams.get("appeal") || "");

    dashboardStore.fetchChats();
    dashboardStore.fetchDestinations();
    dashboardStore.fetchSales();

    if (appealId) {
      appealStore.fetchItem(appealId, controller.signal).then((appeal) => {
        appeal && orderId && orderStore.fetchItem(orderId);
      });
    }

    return () => {
      controller.abort();
      appealStore.clearStore();
      orderStore.clearStore();
      dashboardStore.clearStore();
    };
  }, []);

  useEffect(() => {
    // if (dashboardStore.destinations) {
    //   setDestinations(
    //     Object.entries(dashboardStore.destinations).map(([key, value]) => ({
    //       name: key,
    //       v1: formatNumber(String(value)),
    //     }))
    //   );
    // }

    if (dashboardStore.sales?.chart) {
      const values = Object.entries(dashboardStore.sales.chart).map(([key, value]) => ({
        name: ruMonths[key],
        v1: formatNumber(String(value)),
      }));
      const formattedValues = values.filter((v) => +v.v1 > 0);
      setSales(formattedValues);
    }
  }, [dashboardStore.destinations, dashboardStore.sales]);

  if (orderStore.error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography>Order Not Found</Typography>
      </Box>
    );
  }

  return (
    <Box p={1}>
      <Card sx={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", gap: 2, p: 1 }}>
        <Summary />
        <Grid container spacing={2}>
          <Grid item md={4} xs={12}>
            <DevicesChart
              data={[
                { name: "WhatsApp", value: dashboardStore.chats?.chatData.whatsapp, color: "#00E510" },
                // { name: "Instagram", value: dashboardStore.chats?.chatData.instagram, color: "#d73ae0" },
                { name: "Онлайн чат", value: 0, color: "green" },
                { name: "Звонки", value: dashboardStore.chats?.chatData.call, color: "#5570F1" },
                { name: "Telegram", value: dashboardStore.chats?.chatData.telegram, color: "#00a5e5" },
              ]}
            />
          </Grid>

          <Grid item md={8} xs={12}>
            <Countries data={destinations} />
          </Grid>

          <Grid item md={12} xs={12}>
            {/* <SalesChart data={sales} profit={dashboardStore.sales?.profitIncrease} /> */}
          </Grid>
        </Grid>

        <Card>
          <CardHeader title="Обращения" />

          <AppealsDataTable
            currentUserId={currentUserId}
            onClickStartChat={(appeal) => {
              appealStore.setAppealLoading(appeal);
              appealsStore.sendEvent({
                event: "updateAppeal",
                data: {
                  currentUserId,
                  appeal,
                  status: 2,
                },
              });

              const element = document.getElementById(`contact-${appeal.phoneNumber}`);
              element?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          />
        </Card>

        <Box sx={{ maxWidth: "fixed" }}>
          <Grid container flexWrap="nowrap" sx={{ px: "8px" }}>
            <Grid item sx={{ minWidth: "350px", maxWidth: "350px" }}>
              <Contacts />
            </Grid>
            <Grid item flexGrow={1}>
              <ChatBox chatId={null} page="/dashboard" />
            </Grid>
          </Grid>
        </Box>
        <Snackbar />
      </Card>
    </Box>
  );
};

export default React.memo(Dashboard);
