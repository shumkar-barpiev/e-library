"use client";

import {
  Box,
  Paper,
  Table,
  Stack,
  styled,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  Typography,
  Pagination,
  TableContainer,
  CircularProgress,
} from "@mui/material";
import React from "react";
import { FormatDateWithTime } from "@/components/account/personal-area/_helpers";
import { usePersonalAreaTicketsStore } from "@/stores/personal-area/tickets/user-tickets";
import { TICKETS_LIMIT } from "@/components/account/personal-area/tickets/edit/UserTicketsEdit";

const StyledTableHeader = styled(TableHead)({
  backgroundColor: "#5F8CCC",
});

const StyledTableBody = styled("div")({
  width: "100%",
  maxHeight: 300,
  minWidth: "800px",
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    display: "none",
  },
});

const StyledTable = styled(Table)({
  width: "100%",
  minWidth: "800px",
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
  padding: "3px",
  fontSize: "12px",
  textAlign: "center",
  borderBottom: "1px solid #ddd",
}));

type UserTicketsEditTableProps = {
  loading: boolean;
  userTicketPagination: number;
  setPagination: (page: number) => void;
  selectedTicket: Record<string, any> | null;
  onRowClick: (ticket: Record<string, any>) => void;
};

function UserTicketsEditTable({
  loading,
  onRowClick,
  setPagination,
  selectedTicket,
  userTicketPagination,
}: UserTicketsEditTableProps) {
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
              <StyledTableHeadCell sx={{ width: "12%" }}>№ Билета</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "8%" }}>PNR</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "5%" }}>VC</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "22%" }}>ФИО</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "10%" }}>Статус</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "13%" }}>Дата оформление</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ borderRight: "none", width: "10%" }}>Бонусы</StyledTableHeadCell>
            </TableRow>
          </StyledTableHeader>
        </StyledTable>
        <StyledTableBody>
          <StyledTable>
            {userTicketStore.tickets === null ? (
              <TableBody>
                <TableRow>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {userTicketStore?.tickets?.map((ticket: Record<string, any>) => (
                  <TableRow
                    id={ticket.id}
                    key={ticket.id}
                    sx={{
                      height: 10,
                      "&:hover": { backgroundColor: "#cadefa", cursor: "pointer" },
                      ...(selectedTicket?.id === ticket.id ? { backgroundColor: "#cadefa" } : {}),
                    }}
                    onClick={() => onRowClick(ticket)}
                  >
                    <StyledTableBodyCell sx={{ width: "12%" }}>{ticket.docNum}</StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "8%" }}>{ticket.recLoc}</StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "5%" }}>{ticket.valCar}</StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "22%", textAlign: "left", pl: 3 }}>
                      <Typography variant="inherit" sx={{ maxWidth: "240px" }} noWrap>
                        {ticket.firName} {ticket.lasNam}
                      </Typography>
                    </StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "10%" }}>{ticket.status}</StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "13%" }}>{FormatDateWithTime(ticket.docIss)}</StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "10%" }}>
                      {ticket.serFee > 0 ? ticket.serFee * 84.28 * 0.06 : ticket.serFee}
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

export default UserTicketsEditTable;
