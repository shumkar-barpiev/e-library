"use client";
import { Box, Card } from "@mui/material";
import { SuggestionList } from "@/components/order/cards/SuggestionList";
import { TaskListCard } from "@/components/order/cards/TaskListCard";
import { ClientPreferenceCard } from "@/components/order/cards/ClientPreferenceCard";
import { ClientCard } from "@/components/order/cards/ClientCard";
import { Suspense } from "react";

export default function ActionCard() {
  return (
    <Box display="flex" flexDirection="column" gap={1} height="100%">
      <Suspense>
        <ClientCard />
      </Suspense>
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          p: 2,
          height: "100%",
        }}
      >
        <SuggestionList />
        <TaskListCard />
        <ClientPreferenceCard />
      </Card>
    </Box>
  );
}
