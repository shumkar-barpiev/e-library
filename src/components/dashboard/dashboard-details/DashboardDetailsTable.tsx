"use client";

import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Typography,
  CircularProgress,
  styled,
} from "@mui/material";
import { TOrderModel } from "@/models/orders/order";
import { TOrderDetailModel } from "@/models/orders/order-detail";
import { TServiceModel } from "@/models/dictionaries/service";
import DashboardDetailsTableRow from "@/components/dashboard/dashboard-details/DashboardDetailsTableRow";
import DashboardDetailsTableRowForAir from "@/components/dashboard/dashboard-details/DashboardDetailsTableRowForAir";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: 1,
  borderStyle: "solid",
  borderColor: theme.palette.divider,
  padding: 10,
}));

export default function DashboardDetailsTable({
  orderId,
  items,
  isLoading = false,
}: {
  orderId: TOrderModel["id"];
  items?: TOrderDetailModel[] | null;
  isLoading?: boolean;
}) {
  const getRowByItemType = (item: TOrderDetailModel): ReactNode => {
    if (item.service?.id == null) return <></>;

    if (item.service.id != 1) {
      return (
        <DashboardDetailsTableRow
          key={item.id}
          item={item}
          isLoading={isLoading}
          orderId={orderId}
          serviceId={item.service.id}
        />
      );
    }

    return (
      <DashboardDetailsTableRowForAir
        key={item.id}
        item={item}
        isLoading={isLoading}
        initialOrderId={orderId}
        serviceId={item.service.id}
      />
    );
  };

  return (
    <TableContainer sx={{ overflow: "inherit" }}>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell align="center">№</StyledTableCell>
            <StyledTableCell align="center">ФИО</StyledTableCell>
            <StyledTableCell align="center">Описание</StyledTableCell>
            <StyledTableCell align="center">Валюта</StyledTableCell>
            <StyledTableCell align="center">Цена</StyledTableCell>
            <StyledTableCell align="center">Итого</StyledTableCell>
            <StyledTableCell align="center">Статус</StyledTableCell>
            <StyledTableCell align="center"></StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items && items.map((item) => getRowByItemType(item as TOrderDetailModel))}
          {items == null && (
            <TableRow>
              <StyledTableCell align="center" colSpan={9}>
                {isLoading && <CircularProgress />}
                {!isLoading && <Typography variant="h6">Нет данных</Typography>}
              </StyledTableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
