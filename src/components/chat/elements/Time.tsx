"use client";
import { FC, useCallback } from "react";
import { Box, BoxProps, Typography } from "@mui/material";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface TimeProps extends BoxProps {
  timestamp: number;
  formatStr: string;
}

export const Time: FC<TimeProps> = ({ timestamp, formatStr, ...rest }) => {
  const displayTime = useCallback(() => {
    const date = new Date(timestamp * 1000);
    {
      return format(date, formatStr, { locale: ru });
    }
  }, []);

  return (
    <Box>
      <Typography fontSize={9} color="#8d8d8d">
        {displayTime()}
      </Typography>
    </Box>
  );
};
