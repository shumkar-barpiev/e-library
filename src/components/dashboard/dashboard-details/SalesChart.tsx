"use client";

import * as React from "react";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from "recharts";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { NoSsr } from "@/utils/no-ssr";
import { IChart, ITooltipContent } from "@/models/dashboard/dashboard";

const bars = [{ name: "Этот год", dataKey: "v1", color: "#8c9ffa" }];

export function SalesChart({ data, profit }: { data: IChart[] | undefined; profit?: string }) {
  const chartHeight = 300;

  return (
    <Card>
      <CardHeader title="Прирост" />
      <CardContent>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
          <Stack spacing={3} sx={{ flex: "0 0 auto", justifyContent: "space-between", width: "240px" }}>
            <Stack spacing={2}>
              <Typography color="success.main" variant="h2">
                {profit}%
              </Typography>
              <Typography color="text.secondary">прирост к предыдущему периоду</Typography>
            </Stack>
          </Stack>
          <Stack divider={<Divider />} spacing={2} sx={{ flex: "1 1 auto" }}>
            <NoSsr fallback={<Box sx={{ height: `${chartHeight}px` }} />}>
              <ResponsiveContainer height={chartHeight}>
                <BarChart barGap={-32} data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" vertical={false} />
                  <XAxis axisLine={false} dataKey="name" tickLine={false} type="category" xAxisId={0} />
                  <XAxis axisLine={false} dataKey="name" hide type="category" xAxisId={1} />
                  <YAxis axisLine={false} domain={[0, 50]} hide tickCount={6} type="number" />
                  {bars.map((bar, index) => (
                    <Bar
                      animationDuration={300}
                      barSize={32}
                      dataKey={bar.dataKey}
                      fill={bar.color}
                      key={bar.name}
                      name={bar.name}
                      radius={[5, 5, 5, 5]}
                      xAxisId={index}
                    />
                  ))}
                  <Tooltip animationDuration={50} content={<TooltipContent />} cursor={false} />
                </BarChart>
              </ResponsiveContainer>
            </NoSsr>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function TooltipContent({ active, payload }: Partial<ITooltipContent>) {
  if (!active) {
    return null;
  }

  return (
    <Paper sx={{ p: 1 }}>
      <Stack spacing={2}>
        {payload?.map((entry) => {
          return (
            <Stack direction="row" key={entry.name} spacing={3} sx={{ alignItems: "center" }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", flex: "1 1 auto" }}>
                <Box sx={{ bgcolor: entry.fill, borderRadius: "2px", height: "8px", width: "8px" }} />
                <Typography sx={{ whiteSpace: "nowrap" }}>{entry.payload.name}</Typography>
              </Stack>
              <Typography color="text.secondary" variant="body2">
                {new Intl.NumberFormat("en-US").format(entry.value)}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}
