"use client";

import {
  Box,
  Paper,
  Table,
  Stack,
  TableRow,
  TableBody,
  TableHead,
  TableCell,
  Typography,
  Pagination,
  TableContainer,
  CircularProgress,
} from "@mui/material";
import React from "react";
import { styled } from "@mui/system";
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";
import { FormatDateWithTime } from "@/components/account/personal-area/_helpers";
import { usePersonalAreaTicketsStore } from "@/stores/personal-area/tickets/user-tickets";
import { TICKETS_LIMIT } from "@/components/account/personal-area/tickets/list/UserTicketsList";

const StyledTableHeader = styled(TableHead)({
  backgroundColor: "#5F8CCC",
});

const StyledTableBody = styled("div")({
  width: "100%",
  maxHeight: 300,
  minWidth: "1200px",
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    display: "none",
  },
});

const StyledTable = styled(Table)({
  width: "100%",
  minWidth: "1200px",
  tableLayout: "fixed",
});

const StyledTableHeadCell = styled(TableCell)(() => ({
  top: 0,
  color: "#fff",
  fontWeight: 800,
  textAlign: "center",
  borderBottom: `1px solid #0a0f1c`,
  borderRight: `1px solid #0a0f1c`,
}));

const StyledTableBodyCell = styled(TableCell)(() => ({
  borderBottom: "1px solid #ddd",
  textAlign: "center",
  fontSize: "12px",
  padding: "3px",
}));

type UserTicketsListTablePropsType = {
  loading: boolean;
  userTicketPagination: number;
  setPagination: (page: number) => void;
};

function UserTicketsListTable({ loading, userTicketPagination, setPagination }: UserTicketsListTablePropsType) {
  const userTicketStore = usePersonalAreaTicketsStore();
  const handlePaginationChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPagination(value);
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ border: "solid 1px #0a0f1c", overflowX: "auto" }}>
        <StyledTable>
          <StyledTableHeader>
            <TableRow>
              <StyledTableHeadCell sx={{ width: "10%" }}>№ Билета</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "10%" }}>Статус</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "8%" }}>PNR</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "18%" }}>ФИО</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "5%" }}>VC</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "10%" }}>Дата оформление</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "8%" }}>SF</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "5%" }}>Com</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "8%" }}>ComAm</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "8%" }}>Total</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "5%" }}>Val</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "5%", borderRight: "none" }}>1С</StyledTableHeadCell>
            </TableRow>
          </StyledTableHeader>
        </StyledTable>
        <StyledTableBody>
          <StyledTable>
            {userTicketStore.tickets === null ? (
              <TableBody>
                <TableRow>
                  <StyledTableBodyCell colSpan={11}>
                    <Box sx={{ display: "flex", alignItems: "center", m: 3 }}>
                      {loading ? (
                        <>
                          <Typography variant="inherit" color={"inherit"} sx={{ whiteSpace: "nowrap" }}>
                            Данные загружаются...
                          </Typography>
                          <CircularProgress color="inherit" size={15} sx={{ ml: 2 }} />
                        </>
                      ) : (
                        <Typography variant="inherit" color={"inherit"}>
                          Результат не найден...
                        </Typography>
                      )}
                    </Box>
                  </StyledTableBodyCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {userTicketStore?.tickets?.map((ticket, index) => (
                  <TableRow
                    key={index}
                    sx={{ height: 10, "&:hover": { backgroundColor: "#cadefa", cursor: "pointer" } }}
                  >
                    <StyledTableBodyCell sx={{ width: "10%" }}>{ticket?.docNum}</StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "10%" }}>{ticket?.status}</StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "8%" }}>{ticket?.recLoc}</StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "18%", textAlign: "left", pl: 3 }}>
                      <Typography variant="inherit" noWrap>
                        {ticket?.firName} {ticket?.lasNam}
                      </Typography>
                    </StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "5%" }}>{ticket?.valCar}</StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "10%" }}>
                      {FormatDateWithTime(ticket?.docIss)}
                    </StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "8%" }}>
                      {ticket?.serFee} {ticket?.serFeeCur?.name}
                    </StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "5%" }}>
                      {ticket?.com} {ticket?.comCurrency?.code}
                    </StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "8%" }}>{ticket?.comAmount}</StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "8%" }}>{ticket?.tot}</StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "5%" }}>{ticket?.totCur?.name}</StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "5%" }}>
                      {ticket?.statusOneC ? <DoneIcon fontSize="small" /> : <ClearIcon fontSize="small" />}
                    </StyledTableBodyCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </StyledTable>
        </StyledTableBody>
      </TableContainer>

      {userTicketStore.ticketsTotal > TICKETS_LIMIT && (
        <Stack spacing={2} mt={2}>
          <Pagination
            page={userTicketPagination}
            onChange={handlePaginationChange}
            count={Math.ceil(userTicketStore.ticketsTotal / TICKETS_LIMIT)}
          />
        </Stack>
      )}
    </>
  );
}

export default UserTicketsListTable;
