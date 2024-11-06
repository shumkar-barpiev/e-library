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
import OrderDetailsTableRow from "./OrderDetailsTableRow";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: 1,
  borderStyle: "solid",
  borderColor: theme.palette.divider,
  padding: 10,
}));

export default function OrderDetailsTable({
  orderId,
  items,
  readOnly,
  isLoading = false,
}: {
  orderId: TOrderModel["id"];
  items?: TOrderDetailModel[] | null;
  readOnly?: boolean;
  isLoading?: boolean;
}) {
  const getRowByItemType = (item: TOrderDetailModel, index: number): ReactNode => {
    if (item.service?.id == null) return <TableRow key={index}></TableRow>;

    return (
      <OrderDetailsTableRow
        key={`${item.id}_${item.product?.id}`}
        item={item}
        isLoading={isLoading}
        orderId={orderId}
        readOnly={readOnly}
        serviceId={item.service?.id}
      />
    );
  };

  return (
    <TableContainer sx={{ overflow: "inherit" }}>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              Услуга
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              ФИО
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              Описание
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              Номер заказа
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              Скриншот
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              Валюта
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              Цена
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              Кол-во
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              Итого
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              Статус
            </StyledTableCell>
            {!readOnly && <StyledTableCell align="center"></StyledTableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {items && items.map((item, index) => getRowByItemType(item as TOrderDetailModel, index))}
          {items == null && (
            <TableRow>
              <StyledTableCell align="center" colSpan={10}>
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
