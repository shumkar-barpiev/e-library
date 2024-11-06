"use client";

import {
  Box,
  Card,
  Table,
  Stack,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  Typography,
  Pagination,
  TableContainer,
  CircularProgress,
} from "@mui/material";
import { ReactNode } from "react";
import { useUserActsStore } from "@/stores/personal-area/acts/acts";
import { StyledTableCell } from "@/components/other/StyledTableCell";
import ActsTableRow from "@/components/account/personal-area/finance/ActComponents/ActsTableRow";
import { ACTS_LIMIT } from "@/components/account/personal-area/finance/ActsInProgress/ActsInProgressInit";

type PropsType = {
  loading: boolean;
  tableType: string;
  actsPagination: number;
  acts: Record<string, any>[] | null;
  setActsPagination: (pageNumber: number) => void;
};

const ActsTable = ({ acts, tableType, loading, actsPagination, setActsPagination }: PropsType) => {
  const actStore = useUserActsStore();

  const getRowByItemType = (item: any): ReactNode => {
    return <ActsTableRow key={item.id} item={item} tableType={tableType} />;
  };

  const handlePaginationChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setActsPagination(value);
  };

  return (
    <>
      <Card sx={{ border: "none" }}>
        <TableContainer sx={{ border: "solid 1px #0a0f1c", borderRadius: "5px", pb: 0.5, overflowX: "auto" }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{}}>
              <TableRow sx={{ bgcolor: "red", height: 50, backgroundColor: "#5F8CCC" }}>
                <StyledTableCell
                  align="center"
                  sx={{
                    borderBottom: "solid 1px #0a0f1c",
                    borderTopLeftRadius: "5px",
                    fontWeight: "bold",
                    fontSize: "14px",
                    color: "#fff",
                    width: "5%",
                  }}
                >
                  ID
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{
                    borderBottom: "solid 1px #0a0f1c",
                    fontWeight: "bold",
                    fontSize: "14px",
                    color: "#fff",
                    width: "40%",
                  }}
                >
                  Организация
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{
                    borderBottom: "solid 1px #0a0f1c",
                    fontWeight: "bold",
                    fontSize: "14px",
                    color: "#fff",
                    width: "20%",
                  }}
                >
                  Период
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{
                    borderBottom: "solid 1px #0a0f1c",
                    fontWeight: "bold",
                    fontSize: "14px",
                    color: "#fff",
                    width: "20%",
                  }}
                >
                  Статус
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ borderBottom: "solid 1px #0a0f1c", borderTopRightRadius: "5px", width: "5%" }}
                ></StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {acts != null ? (
                <>{acts?.map((item) => getRowByItemType(item))}</>
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
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

      {actStore.actsTotal > ACTS_LIMIT && (
        <Stack spacing={2} mt={2}>
          <Pagination
            page={actsPagination}
            onChange={handlePaginationChange}
            count={Math.ceil(actStore.actsTotal / ACTS_LIMIT)}
          />
        </Stack>
      )}
    </>
  );
};

export default ActsTable;
