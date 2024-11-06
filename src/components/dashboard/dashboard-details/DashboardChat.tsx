"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { ArrowRightIcon } from "@mui/x-date-pickers";
import { format } from "date-fns";
import { IDataProps } from "@/models/dashboard/dashboard";

export function DashboardChat({ data }: IDataProps) {
  return (
    <Card>
      <CardHeader title="Последние сообщения" />
      <List
        disablePadding
        sx={{
          p: 1,
          "& .MuiListItemButton-root": { borderRadius: 1 },
          "& .MuiBadge-dot": {
            border: "2px solid var(--mui-palette-background-paper)",
            borderRadius: "50%",
            bottom: "5px",
            height: "12px",
            right: "5px",
            width: "12px",
          },
        }}
      >
        {data.map((message) => (
          <ListItem disablePadding key={message.id}>
            <ListItemButton>
              <ListItemAvatar>
                {message.author.status === "online" ? (
                  <Badge anchorOrigin={{ horizontal: "right", vertical: "bottom" }} color="success" variant="dot">
                    <Avatar src={message.author.avatar} />
                  </Badge>
                ) : (
                  <Avatar src={message.author.avatar} />
                )}
              </ListItemAvatar>
              <ListItemText
                disableTypography
                primary={
                  <Typography noWrap variant="subtitle2">
                    {message.author.name}
                  </Typography>
                }
                secondary={
                  <Typography color="text.secondary" noWrap variant="body2">
                    {message.content}
                  </Typography>
                }
              />
              <Typography color="text.secondary" sx={{ whiteSpace: "nowrap" }} variant="caption">
                {format(message.createdAt, "HH:mm")}
              </Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <CardActions>
        <Button color="secondary" endIcon={<ArrowRightIcon />} size="small">
          Перейти в чат
        </Button>
      </CardActions>
    </Card>
  );
}
