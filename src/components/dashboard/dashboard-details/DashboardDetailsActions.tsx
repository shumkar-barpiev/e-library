"use client";

import { useEffect, useState } from "react";
import { Stack, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { TOrderModel } from "@/models/orders/order";
import { useOrderStore } from "@/stores/orders/orders";
import { useOrderDetailsStore } from "@/stores/orders/order-details";
import { useServicesStore } from "@/stores/dictionaries/services";
import { useSettingsStore } from "@/stores/dictionaries/settings";

export enum EOrderDetailsFilters {
  search = "search",
}

export default function DashboardDetailsActions({
  orderId,
  onFilter,
}: {
  totalOrderDetails?: number | null;
  orderId: TOrderModel["id"];
  onFilter?: (type: EOrderDetailsFilters, value?: string | number) => void;
}) {
  const [activeTab, setActiveTab] = useState("orderDetails");
  const [tabsEl, setTabsEl] = useState<null | HTMLElement>(null);
  const [actionsEl, setActionsEl] = useState<null | HTMLElement>(null);

  const services = useServicesStore((state) =>
    state.getItems({ sortBy: ["id"], criteria: [{ fieldName: "parent", operator: "isNull", value: "" }] })
  );
  const settings = useSettingsStore((state) => state.getItems());
  const orderStore = useOrderStore((state) => state);
  const orderDetailsStore = useOrderDetailsStore((state) => state);

  const handleFilter = (type: EOrderDetailsFilters, value?: string | number) => {
    if (onFilter != null) onFilter(type, value);
  };

  const handleAction = (id?: number) => {
    orderDetailsStore.saveItem({
      productName: "new",
      saleOrder: { id: orderId },
      product: { service: { id } },
      listPriceCur: settings?.at(0)?.defaultCurrencySaleOrderLine,
      status: settings?.at(0)?.defaultStatusSaleOrderLine,
    });
  };

  useEffect(() => {
    if (orderId || (orderId && orderDetailsStore.dirty)) orderStore.fetchSum(orderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, orderDetailsStore.dirty]);

  return (
    <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center" justifyContent="space-between" width="100%">
      {/*<ButtonGroup variant="outlined" color="secondary" size="small">*/}
      {/*  <Button*/}
      {/*    startIcon={<ListIcon />}*/}
      {/*    variant={activeTab === "orderDetails" ? "contained" : "outlined"}*/}
      {/*    color={activeTab === "orderDetails" ? "primary" : "secondary"}*/}
      {/*  >*/}
      {/*    Заказы ({totalOrderDetails ?? 0})*/}
      {/*  </Button>*/}
      {/*  <Button*/}
      {/*    startIcon={<ListAltIcon />}*/}
      {/*    variant={activeTab === "allOrderDetails" ? "contained" : "outlined"}*/}
      {/*    color={activeTab === "allOrderDetails" ? "primary" : "secondary"}*/}
      {/*  >*/}
      {/*    Все заказы (13)*/}
      {/*  </Button>*/}

      {/*  <Menu*/}
      {/*    transformOrigin={{ horizontal: "right", vertical: "top" }}*/}
      {/*    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}*/}
      {/*    anchorEl={tabsEl}*/}
      {/*    open={Boolean(tabsEl)}*/}
      {/*    onClose={() => setTabsEl(null)}*/}
      {/*  >*/}
      {/*    <MenuItem>*/}
      {/*      <ListItemIcon>*/}
      {/*        <AssignmentOutlinedIcon />*/}
      {/*      </ListItemIcon>*/}
      {/*      <ListItemText>Документ</ListItemText>*/}
      {/*    </MenuItem>*/}
      {/*  </Menu>*/}
      {/*  <Button onClick={(e) => setTabsEl(e.currentTarget)}>*/}
      {/*    <MoreHorizIcon />*/}
      {/*  </Button>*/}
      {/*</ButtonGroup>*/}

      {/*<ButtonGroup variant="outlined" color="secondary" size="small">*/}
      {/*  {services &&*/}
      {/*    services.map((item, i) => {*/}
      {/*      if (i < 3)*/}
      {/*        return (*/}
      {/*          <Button key={i} startIcon={<AddIcon />} onClick={() => handleAction(item?.id)}>*/}
      {/*            {item?.["$t:name"] || item?.name}*/}
      {/*          </Button>*/}
      {/*        );*/}
      {/*    })}*/}

      {/*  {services && services.length > 3 && (*/}
      {/*    <>*/}
      {/*      <Menu*/}
      {/*        transformOrigin={{ horizontal: "right", vertical: "top" }}*/}
      {/*        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}*/}
      {/*        anchorEl={actionsEl}*/}
      {/*        open={Boolean(actionsEl)}*/}
      {/*        onClose={() => setActionsEl(null)}*/}
      {/*      >*/}
      {/*        {services.map((item, i) => {*/}
      {/*          if (i >= 3)*/}
      {/*            return (*/}
      {/*              <MenuItem key={i} onClick={() => handleAction(item?.id)}>*/}
      {/*                <ListItemIcon>*/}
      {/*                  <AddIcon />*/}
      {/*                </ListItemIcon>*/}
      {/*                <ListItemText>{item?.["$t:name"] || item?.name}</ListItemText>*/}
      {/*              </MenuItem>*/}
      {/*            );*/}
      {/*        })}*/}
      {/*      </Menu>*/}
      {/*      <Button onClick={(e) => setActionsEl(e.currentTarget)}>*/}
      {/*        <MoreHorizIcon />*/}
      {/*      </Button>*/}
      {/*    </>*/}
      {/*  )}*/}
      {/*</ButtonGroup>*/}

      <TextField
        variant="outlined"
        placeholder="Поиск"
        size="small"
        onChange={(e) => handleFilter(EOrderDetailsFilters.search, e.target.value)}
        InputProps={{
          sx: { pl: 1, ".MuiInputBase-input": { py: 0.6 } },
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ maxWidth: 500 }}
      />

      {/*<Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">*/}
      {/*  <OrderDetailsInvoice orderId={orderId} />*/}
      {/*  <Typography variant="h6">{orderStore.sum ?? 0} Сом</Typography>*/}
      {/*</Stack>*/}
    </Stack>
  );
}
