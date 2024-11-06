"use client";

import {
  Box,
  Card,
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  Typography,
  Pagination,
  TableContainer,
  CircularProgress,
} from "@mui/material";
import dayjs from "dayjs";
import { ReactNode } from "react";
import React, { useState, useEffect, useContext } from "react";
import { StyledTableCell } from "@/components/other/StyledTableCell";
import { ActsFormatDate } from "@/components/account/personal-area/_helpers/";
import { useUserAttendanceStore } from "@/stores/personal-area/user-attendance/user-attendance";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";
import UserAttendanceReview from "@/components/account/personal-area/user-attendance/Components/UserAttendanceReview";

const AppealsToHR = () => {
  const attendanceStore = useUserAttendanceStore();
  const currentUserContext = useContext(CurrentUserContext);
  const [loadingAppeals, setLoadingAppeals] = useState<boolean>(true);
  const [appealsToHR, setAppealsToHR] = useState<Record<string, any>[]>([]);
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);
  const reloadAllAppeals = () => {
    attendanceStore.fetchAttendanceAppeals((data: Record<string, any>) => {
      if (data.status === 0) setAppealsToHR(data.data);

      setLoadingAppeals(false);
    });
  };

  const getRowByItemType = (appealToHR: Record<string, any>): ReactNode => {
    return <AttendanceAppealsTableRow key={appealToHR.id} appealToHR={appealToHR} />;
  };

  const AttendanceAppealsTableRow = ({ appealToHR }: { appealToHR: Record<string, any> }) => {
    return (
      <TableRow key={appealToHR?.id} sx={{ height: "50px" }}>
        <StyledTableCell sx={{ fontSize: "10px", textAlign: "center" }}>
          <Typography sx={{ whiteSpace: "nowrap" }}>{appealToHR?.id}</Typography>
        </StyledTableCell>
        <StyledTableCell sx={{ fontSize: "10px", textAlign: "center" }}>
          <Typography sx={{ whiteSpace: "nowrap" }}>{appealToHR?.employee?.name}</Typography>
        </StyledTableCell>
        <StyledTableCell sx={{ fontSize: "10px", textAlign: "center" }}>
          <Typography sx={{ whiteSpace: "nowrap" }}>{ActsFormatDate(appealToHR?.date)}</Typography>
        </StyledTableCell>
        <StyledTableCell sx={{ fontSize: "10px", textAlign: "center" }}>
          <UserAttendanceReview
            showBadge={true}
            attendance={appealToHR}
            dateOfCell={dayjs(appealToHR?.date)}
            reloadAllAttendance={() => reloadAllAppeals()}
          />
        </StyledTableCell>
      </TableRow>
    );
  };

  useEffect(() => {
    reloadAllAppeals();
  }, []);

  useEffect(() => {
    if (currentUserContext?.userRoles) setCurrentUserRoles(currentUserContext?.userRoles);
  }, [currentUserContext]);

  return (
    <Box>
      <Card sx={{ border: "none" }}>
        <TableContainer
          sx={{ border: "solid 1px #0a0f1c", borderRadius: "5px", pb: 0.5, overflowX: "auto", maxWidth: 800 }}
        >
          <Table sx={{ minWidth: 500, maxWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ height: 50, backgroundColor: "#5F8CCC" }}>
                <StyledTableCell
                  align="center"
                  sx={{
                    borderBottom: "solid 1px #0a0f1c",
                    borderTopLeftRadius: "5px",
                    fontWeight: "bold",
                    fontSize: "14px",
                    color: "#fff",
                    width: "10%",
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
                  Сотрудник
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{
                    borderBottom: "solid 1px #0a0f1c",
                    fontWeight: "bold",
                    fontSize: "14px",
                    color: "#fff",
                    width: "30%",
                  }}
                >
                  Дата
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ borderBottom: "solid 1px #0a0f1c", borderTopRightRadius: "5px", width: "15%" }}
                ></StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appealsToHR?.length > 0 ? (
                <>{appealsToHR?.map((appealToHR: Record<string, any>) => getRowByItemType(appealToHR))}</>
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, m: 3 }}>
                      {loadingAppeals ? (
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
    </Box>
  );
};

export default AppealsToHR;
