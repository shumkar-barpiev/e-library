"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from "recharts";
import { NoSsr } from "@/utils/no-ssr";
import { IChart, ITooltipContent } from "@/models/dashboard/dashboard";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";

const bars = [{ name: "Посещаемость (в год)", dataKey: "v1", color: "#5570F1" }];

export function Countries({ data }: { data: IChart[] | undefined }) {
  const chartHeight = 300;

  return (
    <Card>
      <CardHeader title="Инфографика по структуре обращений, кол-во" />
      <CardContent>
        <Stack divider={<Divider />} spacing={3}>
          <NoSsr fallback={<Box sx={{ height: `${chartHeight}px` }} />}>
            <ResponsiveContainer height={chartHeight}>
              <BarChart barGap={10} data={data} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 90 }}>
                <CartesianGrid horizontal={false} strokeDasharray="2 4" syncWithTicks />
                <XAxis axisLine={false} tickLine={false} type="number" domain={[0, "dataMax + 10"]} />
                <YAxis axisLine={false} dataKey="name" tick={<Tick />} tickLine={false} type="category" />
                {bars.map((bar) => (
                  <Bar
                    animationDuration={300}
                    barSize={10} // Увеличение толщины столбца
                    dataKey={bar.dataKey}
                    fill={bar.color}
                    key={bar.name}
                    name={bar.name}
                    radius={[5, 5, 5, 5]}
                  />
                ))}
                <Tooltip animationDuration={50} content={<TooltipContent />} cursor={false} />
              </BarChart>
            </ResponsiveContainer>
          </NoSsr>
          <Legend />
        </Stack>
      </CardContent>
    </Card>
  );
}
type CountryCode = "ca" | "de" | "ru" | "uk" | "us";

interface ITick {
  height: number;
  width: number;
  x: number;
  y: number;
  payload: {
    value: CountryCode;
  };
}

function Tick({ height, payload, width, x, y }: Partial<ITick>) {
  if (!payload) return null;

  return (
    <foreignObject height={width} width={height} x={(x ?? 0) - 150} y={(y ?? 0) - 16}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Box sx={{ height: "1rem", width: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* <AirplanemodeActiveIcon color={"primary"} /> */}
        </Box>
        <Typography noWrap variant="body2">
          {payload.value}
        </Typography>
      </Stack>
    </foreignObject>
  );
}

function Legend() {
  return (
    <Stack direction="row" spacing={2}>
      {bars.map((bar) => (
        <Stack direction="row" key={bar.name} spacing={1} sx={{ alignItems: "center" }}>
          <Box sx={{ bgcolor: bar.color, borderRadius: "2px", height: "4px", width: "16px" }} />
          <Typography color="text.secondary" variant="caption">
            {bar.name}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

function TooltipContent({ active, payload }: Partial<ITooltipContent>) {
  if (!active) {
    return null;
  }

  return (
    <Paper sx={{ border: "1px solid var(--mui-palette-divider)", boxShadow: "var(--mui-shadows-16)", p: 1 }}>
      <Stack spacing={2}>
        {payload?.map((entry) => (
          <Stack direction="row" key={entry.name} spacing={3} sx={{ alignItems: "center" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", flex: "1 1 auto" }}>
              <Box sx={{ bgcolor: entry.fill, borderRadius: "2px", height: "8px", width: "8px" }} />
            </Stack>
            <Typography color="text.secondary" variant="body2">
              {new Intl.NumberFormat("en-US").format(entry.value)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
