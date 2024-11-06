"use client";

import {
  Box,
  Card,
  Table,
  Stack,
  Button,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  Typography,
  Pagination,
  TableContainer,
  CircularProgress,
} from "@mui/material";
import { ReactNode, useState } from "react";
import { StyledTableCell } from "@/components/other/StyledTableCell";
import { ORDERS_LIMIT } from "@/components/account/personal-area/orders/Orders";
import { usePersonalAreaOrdersStore } from "@/stores/personal-area/orders/user-orders";
import OrderDetailsTableRow from "@/components/account/personal-area/orders/OrderDetailsTableRow";
import { GenerateAndQRCodeModal as GenerateModal } from "@/components/account/personal-area/orders/OrderDetailsQRGenerate";

type OrderDetailsTablePropsType = {
  loading: boolean;
  ordersPagination: number;
  setOrdersPagination: (pageNumber: number) => void;
};

const OrderDetailsTable = ({ loading, ordersPagination, setOrdersPagination }: OrderDetailsTablePropsType) => {
  const ordersStore = usePersonalAreaOrdersStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);

  const handleCheckboxChange = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
  };

  const handleGenerateButtonClick = () => {
    if (selected.length === 0) {
      alert("Пожалуйста, выберите хотя бы один элемент.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const getRowByItemType = (item: any): ReactNode => {
    return (
      <OrderDetailsTableRow
        key={item.id}
        item={item}
        checked={selected.includes(item.id)}
        onCheckboxChange={() => handleCheckboxChange(item.id)}
      />
    );
  };

  const handlePaginationChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setOrdersPagination(value);
  };

  return (
    <>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell align="center"></StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold", fontSize: "14px" }}>
                  Услуга
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold", fontSize: "14px" }}>
                  Дата оформления
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold", fontSize: "14px" }}>
                  Номер заказа
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold", fontSize: "14px" }}>
                  Номер документа
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold", fontSize: "14px" }}>
                  Статус
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold", fontSize: "14px" }}>
                  ФИО
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold", fontSize: "14px" }}>
                  Итого
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold", fontSize: "14px" }}>
                  Комиссия
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold", fontSize: "14px" }}>
                  Вознаграждение
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold", fontSize: "14px" }}>
                  Статус оплаты
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ordersStore.orders != null ? (
                <>{ordersStore.orders?.map((item) => getRowByItemType(item))}</>
              ) : (
                <TableRow>
                  <TableCell colSpan={11}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, m: 3 }}>
                      {loading ? (
                        <>
                          <Typography variant="inherit" color={"inherit"} sx={{ whiteSpace: "nowrap" }}>
                            Данные загружаются...
                          </Typography>
                          <CircularProgress color="inherit" size={15} />
                        </>
                      ) : (
                        <Typography variant="inherit" color={"inherit"} sx={{ whiteSpace: "nowrap" }}>
                          Результат не найден...
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {ordersStore.ordersTotal > ORDERS_LIMIT && (
        <Stack spacing={2} mt={2}>
          <Pagination
            page={ordersPagination}
            onChange={handlePaginationChange}
            count={Math.ceil(ordersStore.ordersTotal / ORDERS_LIMIT)}
          />
        </Stack>
      )}

      <Box sx={{ marginTop: "20px", width: "100%" }}>
        <Button
          onClick={handleGenerateButtonClick}
          variant="contained"
          sx={{ backgroundColor: "#5F8CCC", "&:hover": { backgroundColor: "#4a6b9c" } }}
          disabled={selected.length === 0}
          fullWidth
        >
          Сгенерировать QR код
        </Button>
      </Box>
      <GenerateModal open={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default OrderDetailsTable;
