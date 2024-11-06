"use client";
import { Box, ListItem, Divider, Tooltip, Typography, Grid } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import * as React from "react";
import { useOrderSuggestionStore } from "@/stores/orders/order-suggestion";
import { useEffect } from "react";
import { TOrderSuggestionModel } from "@/models/orders/order-suggestion";

export function SuggestionList() {
  const suggestionStore = useOrderSuggestionStore();
  const [items, setItems] = React.useState<TOrderSuggestionModel[]>([]);

  useEffect(() => {
    setItems(suggestionStore.items ?? []);
  }, [suggestionStore.items]);

  if (items.length === 0) {
    return <></>;
  }

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
      <Grid
        container
        sx={{
          width: "100%",
          maxHeight: 170,
          overflow: "auto",
          "&::-webkit-scrollbar": {
            width: "0.3em",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,.1)",
          },
        }}
      >
        {items.map((suggestion, index) => (
          <Grid key={index} xl={6} lg={12}>
            <>
              <ListItem sx={{ pl: 0, py: 0 }}>
                <InfoIcon
                  sx={{
                    marginRight: 1,
                    fontSize: 20,
                    color: "secondary.light",
                  }}
                />
                <Box sx={{ fontSize: 14, color: "#45464E", display: "flex", p: 1 }}>
                  <Tooltip title={suggestion.name}>
                    <Typography
                      sx={{
                        overflow: "hidden",
                        width: "170px",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      component="span"
                      variant="caption"
                      color="text.primary"
                    >
                      {suggestion.name}
                    </Typography>
                  </Tooltip>
                </Box>
              </ListItem>
              <Divider component="div" />
            </>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
