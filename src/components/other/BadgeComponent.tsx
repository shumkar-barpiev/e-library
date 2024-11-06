import React from "react";
import { Chip } from "@mui/material";

export const StatusTranslation = {
  created: "создано",
  inProgress: "в процессе",
  pending: "в ожидании",
  done: "завершено",
};

export const capitalizeTheString = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getBadge = (status: string) => {
  let color: "default" | "primary" | "secondary" | "warning" | "success" | "info" | "error";

  switch (status) {
    case "created":
      color = "primary";
      break;
    case "inProgress":
      color = "info";
      break;
    case "pending":
      color = "warning";
      break;
    case "done":
      color = "success";
      break;
    default:
      return;
  }

  return (
    <div>
      <Chip
        label={capitalizeTheString(StatusTranslation[`${status}`].trim()) || status}
        color={color}
        sx={{ height: 20, fontWeight: "semibold", fontSize: "small", color: "white", whiteSpace: "nowrap" }}
      />
    </div>
  );
};
