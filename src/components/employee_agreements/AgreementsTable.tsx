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
import { AGREEMENTS_LIMIT } from "@/components/employee_agreements/Main";
import { ActsFormatDate } from "@/components/account/personal-area/_helpers";
import { useEmployeeAgreementsStore } from "@/stores/hr/employee-agreements/employee-agreements";
import EmployeeAgreementDelete from "@/components/employee_agreements/employee_agreement_actions/EmployeeAgreementDelete";
import EmployeeAgreementReview from "@/components/employee_agreements/employee_agreement_actions/EmployeeAgreementReview";
import EmployeeAgreementGenerateDocument from "@/components/employee_agreements/employee_agreement_actions/EmployeeAgreementGenerateDocument";

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
  padding: "8px",
  fontSize: "12px",
  textAlign: "center",
  borderBottom: "1px solid #ddd",
}));

type PropsType = {
  loading: boolean;
  agreementsPagination: number;
  setPagination: (page: number) => void;
  agreements: Record<string, any> | null;
};

function AgreementsTable({ loading, agreements, setPagination, agreementsPagination }: PropsType) {
  const agreementStore = useEmployeeAgreementsStore();

  const handlePaginationChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPagination(value);
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{ border: "solid 1px #0a0f1c", width: "90%", mx: "auto", overflowX: "auto" }}
      >
        <StyledTable>
          <StyledTableHeader>
            <TableRow>
              <StyledTableHeadCell sx={{ width: "30%" }}>Сотрудник</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "30%" }}>Имя договора</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "15%" }}>Тип договора</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ width: "10%" }}>Добавлено</StyledTableHeadCell>
              <StyledTableHeadCell sx={{ borderRight: "none", width: "15%" }}>Действие</StyledTableHeadCell>
            </TableRow>
          </StyledTableHeader>
        </StyledTable>
        <StyledTableBody>
          <StyledTable>
            {agreements === null ? (
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
                {agreements?.map((agreement: Record<string, any>) => (
                  <TableRow
                    key={agreement.id}
                    sx={{
                      height: 25,
                    }}
                  >
                    <StyledTableBodyCell sx={{ width: "30%", textAlign: "left" }}>
                      {agreement?.partner?.linkedUser?.fullName}
                    </StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "30%", textAlign: "left" }}>
                      {agreement?.fullName}
                    </StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "15%" }}>{agreement?.template?.name}</StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "10%" }}>
                      {ActsFormatDate(agreement?.createdOn)}
                    </StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ width: "15%", pl: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <EmployeeAgreementGenerateDocument agreement={agreement} />
                        <EmployeeAgreementReview agreement={agreement} />
                        <EmployeeAgreementDelete agreementId={agreement.id} />
                      </Box>
                    </StyledTableBodyCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </StyledTable>
        </StyledTableBody>
      </TableContainer>
      {agreementStore.agreementsTotal > AGREEMENTS_LIMIT && (
        <Box sx={{ width: "90%", mx: "auto" }}>
          <Stack spacing={2} mt={2}>
            <Pagination
              page={agreementsPagination}
              onChange={handlePaginationChange}
              count={Math.ceil(agreementStore.agreementsTotal / AGREEMENTS_LIMIT)}
            />
          </Stack>
        </Box>
      )}
    </>
  );
}

export default AgreementsTable;
