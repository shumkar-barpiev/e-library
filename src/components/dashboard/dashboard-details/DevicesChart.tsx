"use client";

import * as React from "react";

import { Cell, Pie, PieChart as RePieChart, Tooltip, TooltipProps } from "recharts";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { NoSsr } from "@/utils/no-ssr";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { IDataProps } from "@/models/dashboard/dashboard";
import { formatNumber } from "@/utils/utils";

export function DevicesChart({ data }: IDataProps) {
  const chartSize = 200;
  const chartTickness = 30;

  if (!data) return;

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader title="Источники обращений, кол-во" />
      <CardContent>
        <Stack divider={<Divider />} spacing={3}>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <NoSsr fallback={<Box sx={{ height: `${chartSize}px`, width: `${chartSize}px` }} />}>
              <RePieChart height={chartSize} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} width={chartSize}>
                <Pie
                  animationDuration={300}
                  cx={chartSize / 2}
                  cy={chartSize / 2}
                  data={data}
                  dataKey="value"
                  innerRadius={chartSize / 2 - chartTickness}
                  nameKey="name"
                  outerRadius={chartSize / 2}
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell fill={entry.color} key={entry.name} />
                  ))}
                </Pie>
                <Tooltip animationDuration={50} content={<TooltipContent />} />
              </RePieChart>
            </NoSsr>
          </Box>
          <Legend payload={data} />
        </Stack>
      </CardContent>
    </Card>
  );
}

function Legend({ payload }: Record<string, any>) {
  return (
    <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))" }}>
      {payload?.map((entry: Record<string, any>) => (
        <div key={entry.name}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Box sx={{ bgcolor: entry.color, borderRadius: "2px", height: "4px", width: "16px" }} />
            <Typography variant="body2">{entry.name}</Typography>
          </Stack>
          <Typography variant="h5">{formatNumber(String(entry.value))}</Typography>
        </div>
      ))}
    </Box>
  );
}

function TooltipContent({ active, payload }: TooltipProps<ValueType, NameType>) {
  if (!active) {
    return null;
  }

  return (
    <Paper sx={{ p: 1 }}>
      <Stack spacing={2}>
        {payload?.map((entry) => (
          <Stack direction="row" key={entry.name} spacing={3} sx={{ alignItems: "center" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", flex: "1 1 auto" }}>
              <Box sx={{ bgcolor: entry.payload.fill, borderRadius: "2px", height: "8px", width: "8px" }} />
              <Typography sx={{ whiteSpace: "nowrap" }}>{entry.name}</Typography>
            </Stack>
            <Typography color="text.secondary" variant="body2">
              {entry.value}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
