"use client";
import AppealsDataTable from "@/components/appeals/table/AppealsDataTable";
import { useChatStore } from "@/stores/chat/chat";
import { Box } from "@mui/material";
import { useEffect } from "react";

export default function Appeals() {
  const { currentUserId, getCurrentUserId } = useChatStore((state) => state);
  useEffect(() => {
    getCurrentUserId();
  }, []);
  return (
    <Box p={1}>
      <AppealsDataTable currentUserId={currentUserId} />
    </Box>
  );
}
