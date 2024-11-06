"use client";

import { TModelFilters } from "@/types/model";
import ClearIcon from "@mui/icons-material/Clear";
import React, { useEffect, useState } from "react";
import { TOrderModel } from "@/models/orders/order";
import { useUserStore } from "@/stores/users/users";
import { useOrderStore } from "@/stores/orders/orders";
import { useOrderDetailsStore } from "@/stores/orders/order-details";
import { ModalStyle } from "@/components/account/personal-area/profile/Profile";
import OrderDetailsTable from "@/components/order/order-details/OrderDetailsTable";
import { Modal, IconButton, Box, CircularProgress, Typography, Card, Grid, styled, Chip } from "@mui/material";

const StyledTypography = styled(Typography)({
  fontSize: "0.6964285714285714rem",
  lineHeight: "1.5",
  fontWeight: "bold",
});

const initialFilters: (orderId: TOrderModel["id"]) => TModelFilters = (orderId) => ({
  page: 1,
  pageSize: 3,
  fields: [
    "description",
    "listPrice",
    "status",
    "listPriceCur",
    "unitPrice",
    "saleOrder",
    "productName",
    "product",
    "service",
    "product.subService",
    "product.tNumber",
    "product.name",
    "product.pSurname",
    "product.route",
    "product.resNumber",
    "reservation",
    "preOrderFromTo",
  ],
  criteria: [
    {
      operator: "and",
      criteria: [
        {
          fieldName: "saleOrder.id",
          operator: "=",
          value: orderId as number,
        },
      ],
    },
  ],
});

type OrdersTableModalPropsType = {
  open: boolean;
  handleCloseModal: () => void;
  order: Record<string, any> | null;
};

const OrdersTableModal = ({ order, open, handleCloseModal }: OrdersTableModalPropsType) => {
  const userStore = useUserStore();
  const orderStore = useOrderStore();
  const orderDetailsStore = useOrderDetailsStore();
  const [client, setClient] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (!!order?.id) {
      const filters = initialFilters(order?.id);
      orderDetailsStore.fetchItems(filters);

      userStore.fetchItem(order?.clientPartner.id).then((data) => {
        if (data) setClient(data);
      });
    }
  }, [order]);

  return (
    <>
      <Modal
        open={open}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            ...ModalStyle,
            width: { xs: "90%", sm: 500, md: 800, lg: 900, xl: 1000 },
            position: "relative",
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          <IconButton
            aria-label="close-modal"
            sx={{ position: "absolute", top: 8, right: 8 }}
            onClick={handleCloseModal}
          >
            <ClearIcon />
          </IconButton>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Card sx={{ p: 2, gap: 2 }}>
              <Grid container>
                <Grid item xs={12}>
                  <Box display={"flex"} gap={1}>
                    <Typography sx={{ color: "secondary", fontWeight: "bold" }}>
                      {order?.saleOrderSeq && `№${order?.saleOrderSeq}`}
                    </Typography>
                    {order?.soStatus && <Chip label={order?.soStatus} sx={{ height: 23 }} color="primary" />}
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ gap: 1, display: "flex", flexDirection: "column", mt: 1 }}>
                <Grid container>
                  <Grid item xs={12} md={6}>
                    <StyledTypography>{client?.firstName || "Имя"}</StyledTypography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTypography>{client?.lastName || "Фамилия"}</StyledTypography>
                  </Grid>
                </Grid>
                <Grid container>
                  <Grid item xs={12} md={4}>
                    <StyledTypography>{client?.mobilePhone || "Мобильный телефон"}</StyledTypography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <StyledTypography>{client?.email || "Email"}</StyledTypography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <StyledTypography>{client?.dateOfBirth || "Дата рождение"}</StyledTypography>
                  </Grid>
                </Grid>
              </Box>
            </Card>
            {orderDetailsStore.items ? (
              <Card>
                <OrderDetailsTable orderId={order?.id} items={orderDetailsStore.items} readOnly={true} />
              </Card>
            ) : (
              <Box sx={{ width: 1, height: 50 }}>
                <Box sx={{ width: "10%", mx: "auto", textAlign: "center" }}>
                  {orderDetailsStore.loading && <CircularProgress />}
                  {!orderDetailsStore.loading && <Typography variant="h6">Нет данных</Typography>}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default OrdersTableModal;
