"use client";

import {
  Table,
  Modal,
  Stack,
  styled,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Pagination,
  IconButton,
  Typography,
  TableContainer,
  CircularProgress,
} from "@mui/material";
import dayjs from "dayjs";
import { TModelFilters } from "@/types/model";
import { TUserModel } from "@/models/user/user";
import { useUserStore } from "@/stores/users/users";
import { TOrderModel } from "@/models/orders/order";
import { useOrderStore } from "@/stores/orders/orders";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { ChangeEvent, useEffect, useState } from "react";
import { useAppealsStore } from "@/stores/appeals/appeals";
import { useOrderStatusesStore } from "@/stores/dictionaries/order-statuses";
import OrdersTableModal from "@/components/order/order-details/OrdersTableModal";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: 1,
  borderStyle: "solid",
  borderColor: theme.palette.divider,
  padding: 10,
}));

const initialFilters: (clientId: number) => TModelFilters = (clientId) => ({
  page: 1,
  pageSize: 3,
  criteria: [
    {
      operator: "and",
      criteria: [
        {
          fieldName: "clientPartner.id",
          operator: "=",
          value: clientId,
        },
      ],
    },
  ],
});

export default function OrderTable({ clientId }: { clientId?: number }) {
  const userStore = useUserStore();
  const orderStore = useOrderStore();
  const appealStore = useAppealsStore();
  const [pageTotal, setPageTotal] = useState(1);
  const [user, setUser] = useState<TUserModel | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Record<string, any> | null>(null);
  const orderStatuses = useOrderStatusesStore((state) => state.getItems({ translate: true }));

  const [filters, setFilters] = useState<TModelFilters>({
    ...initialFilters(clientId ?? 0),
  });

  const handlePageChange = (e: ChangeEvent<unknown>, page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  useEffect(() => {
    if (appealStore.item?.client) {
      userStore.fetchItem(appealStore.item?.client!.id!).then((res) => {
        setUser(res);
      });
    }
  }, [appealStore.item]);

  useEffect(() => {
    orderStore.getItems(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    const pageTotal =
      orderStore.total != null && filters?.pageSize != null ? Math.ceil(orderStore.total / filters?.pageSize) : 1;
    setPageTotal(pageTotal);
  }, [orderStore.total, filters?.pageSize]);

  useEffect(() => {
    if (clientId == null && user?.id) {
      const baseFilters = initialFilters(user.id)?.criteria ?? [];
      setFilters((prev) => ({
        ...prev,
        page: 1,
        criteria: baseFilters,
      }));
    }
  }, [user]);

  const handleTableRowClick = (item: Record<string, any>) => {
    setSelectedOrder(item);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedOrder(null);
  };

  return (
    <>
      <TableContainer sx={{ overflow: "inherit" }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">Номер</StyledTableCell>
              <StyledTableCell align="center">ФИО</StyledTableCell>
              <StyledTableCell align="center">Дата создания</StyledTableCell>
              <StyledTableCell align="center">Итого</StyledTableCell>
              <StyledTableCell align="center">Статус</StyledTableCell>
              <StyledTableCell align="center"></StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orderStore.items == null ? (
              <TableRow>
                <StyledTableCell align="center" colSpan={10}>
                  {orderStore.loading && <CircularProgress />}
                  {!orderStore.loading && <Typography variant="h6">Нет данных</Typography>}
                </StyledTableCell>
              </TableRow>
            ) : (
              orderStore.items.map((item) => {
                const orderStatus = orderStatuses?.find((v) => v?.value === item.soStatus);

                return (
                  <TableRow key={item.id} onClick={() => handleTableRowClick(item)}>
                    <StyledTableCell>{item.saleOrderSeq}</StyledTableCell>
                    <StyledTableCell>{`${user?.lastName ?? ""} ${user?.firstName ?? ""}`}</StyledTableCell>
                    <StyledTableCell>{dayjs(item.createdOn).format("YYYY-MM-DD HH:mm:ss")}</StyledTableCell>
                    <StyledTableCell>{item.total}</StyledTableCell>
                    <StyledTableCell>{orderStatus?.title_ru ?? orderStatus?.title}</StyledTableCell>
                    <StyledTableCell align="center" sx={{ width: 40, minWidth: 40 }}>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <IconButton>
                          <MoreVertIcon />
                        </IconButton>
                      </Stack>
                    </StyledTableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        page={filters?.page}
        count={pageTotal}
        siblingCount={1}
        boundaryCount={2}
        onChange={handlePageChange}
        disabled={orderStore.loading}
      />

      <OrdersTableModal order={selectedOrder} open={openModal} handleCloseModal={handleCloseModal} />
    </>
  );
}
