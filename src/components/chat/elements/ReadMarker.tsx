"use client";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DoneIcon from "@mui/icons-material/Done";
import { grey } from "@mui/material/colors";
import { appelTypeEnum, messageStatusType } from "@/models/chat/chat";

interface ReadMark {
  isDelivered?: boolean;
}

export const ReadMark = ({
  status,
  appealType,
}: {
  status: messageStatusType | undefined | null;
  appealType: appelTypeEnum | undefined | null;
}) => {
  if (appealType === appelTypeEnum.whatsapp) {
    if (status === messageStatusType.sent || status !== messageStatusType.delivered) {
      return <DoneIcon sx={{ width: "16px", height: "16px", color: grey[600] }} />;
    }
    if (status === messageStatusType.delivered) {
      return <DoneAllIcon sx={{ width: "16px", height: "16px", color: grey[600] }} />;
    }
  }
  return <DoneAllIcon sx={{ width: "16px", height: "16px", color: grey[600] }} />;
};
