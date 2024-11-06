import "dayjs/locale/ru";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { enqueueSnackbar } from "notistack";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import React, { useState, useEffect, useContext } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Grid, Typography, Box, CircularProgress, Badge } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useUserAttendanceStore } from "@/stores/personal-area/user-attendance/user-attendance";
import { CurrentUserContext } from "@/components/account/personal-area/current-user/CurrentUserProvider";
import UserAttendanceReview from "@/components/account/personal-area/user-attendance/Components/UserAttendanceReview";

interface CalendarCellProps {
  date: Dayjs | null;
  isBottomLeft?: boolean;
  isBottomRight?: boolean;
  isHighlighted?: boolean | null;
  attendance?: Record<string, any>;
}

dayjs.extend(isoWeek);

const CurrentStateAttendance: React.FC = () => {
  const [monthlyUserAttendance, setMonthlyUserAttendance] = useState<Record<string, any>[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs().locale("ru"));
  const [attendanceMap, setAttendanceMap] = useState<Record<string, any>>();
  const [loadingAttendance, setLoadingAttendance] = useState<boolean>(true);
  const [daysInMonth, setDaysInMonth] = useState<(Dayjs | null)[]>([]);
  const currentUserContext = useContext(CurrentUserContext);
  const attendanceStore = useUserAttendanceStore();

  const startOfMonth = currentMonth.startOf("month");
  const firstDate = startOfMonth;
  const currentDate = dayjs();

  const calculateDaysInMonth = (month: Dayjs) => {
    const startDay = month.startOf("month").isoWeekday();
    const daysArray: (Dayjs | null)[] = [];

    for (let i = 1; i < startDay; i++) {
      daysArray.push(null);
    }

    for (let i = 0; i < month.daysInMonth(); i++) {
      daysArray.push(startOfMonth.add(i, "day"));
    }

    setDaysInMonth(daysArray);
  };

  const formatTime = (timeString: string) => {
    return dayjs(timeString, "HH:mm").format("HH:mm");
  };

  const numRows = Math.ceil(daysInMonth.length / 7);
  const bottomLeftIndex = (numRows - 1) * 7;
  const bottomRightIndex = daysInMonth.length - 1;

  const CalendarCell: React.FC<CalendarCellProps> = ({
    date,
    attendance,
    isBottomLeft,
    isBottomRight,
    isHighlighted,
  }) => {
    return (
      <Grid
        item
        xs={1}
        sx={{
          p: 2,
          height: 70,
          minWidth: 165,
          position: "relative",
          borderRight: "1px solid #ddd",
          borderBottom: "1px solid #ddd",
          ...(date && { backgroundColor: "#fff" }),
          ...(isBottomLeft ? { borderBottomLeftRadius: "5px" } : {}),
          ...(date?.date() === 1 ? { borderTop: "1px solid #ddd" } : {}),
          ...(isBottomRight && date?.isoWeekday() === 7 ? { borderBottomRightRadius: "5px" } : {}),
          ...(date?.isoWeekday() === 6 || date?.isoWeekday() === 7 ? { bgcolor: "#A7C7E7 " } : {}),
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {isHighlighted ? (
            <>
              {attendance?.comingTime && attendance?.leaveTime ? (
                <Badge
                  badgeContent=""
                  color="success"
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >
                  <Typography color="textPrimary">{date ? date.format("D MMM") : ""}</Typography>
                </Badge>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Badge
                    badgeContent=""
                    color="error"
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                  >
                    <Typography color="textPrimary" sx={{ fontWeight: "bold" }}>
                      {date ? date.format("D MMM") : ""}
                    </Typography>
                  </Badge>
                  <Box sx={{ position: "absolute", right: 5, bottom: 6 }}>
                    <UserAttendanceReview
                      dateOfCell={date}
                      reloadAllAttendance={() => reloadAllAttendance()}
                      attendance={!!attendance ? attendance : null}
                    />
                  </Box>
                </Box>
              )}
            </>
          ) : (
            <Typography color="textSecondary">{date ? date.format("D MMM") : ""}</Typography>
          )}
          {(attendance?.comingTime || attendance?.leaveTime) && (
            <Box sx={{ display: "flex", flexDirection: "row", gap: 1, whiteSpace: "nowrap" }}>
              <Box sx={{ display: "flex", flexDirection: "row", alignContent: "top", gap: 1 }}>
                <LoginIcon fontSize="inherit" />
                <Typography color="textPrimary" sx={{ fontSize: "11px" }}>
                  {attendance?.comingTime ? formatTime(attendance?.comingTime) : ""}
                </Typography>
              </Box>
              <Typography color="textPrimary" sx={{ fontSize: "11px" }}>
                -
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "row", alignContent: "top", gap: 1 }}>
                <LogoutIcon fontSize="inherit" />
                <Typography color="textPrimary" sx={{ fontSize: "11px" }}>
                  {attendance?.leaveTime ? formatTime(attendance?.leaveTime) : ""}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Grid>
    );
  };

  const reloadAllAttendance = () => {
    attendanceStore.getUserAttendance((data: Record<string, any>) => {
      setLoadingAttendance(false);
      if (data.codeStatus === 200) {
        setMonthlyUserAttendance(data.object);
      } else enqueueSnackbar("Содержание посещаемость не перезагружено", { variant: "error" });
    });
  };

  useEffect(() => {
    if (currentUserContext?.currentUser && currentUserContext?.currentUser?.partner?.isEmployee) {
      reloadAllAttendance();
    } else {
      setLoadingAttendance(false);
    }
  }, [currentUserContext]);

  useEffect(() => {
    const attendanceMap: Record<string, any> = {};
    monthlyUserAttendance.forEach((attendance) => {
      const dateKey = dayjs(attendance.date).format("YYYY-MM-DD");
      attendanceMap[dateKey] = {
        id: attendance.id,
        date: attendance.date,
        leaveTime: attendance.leaveTime,
        comingTime: attendance.comingTime,
        employeeId: attendance.employeeId,
        conversation: attendance.conversations,
      };
    });

    setAttendanceMap(attendanceMap);
  }, [monthlyUserAttendance]);

  useEffect(() => {
    calculateDaysInMonth(currentMonth);
  }, [currentMonth]);

  return (
    <Box>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
        {loadingAttendance ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="inherit" color={"inherit"} sx={{ whiteSpace: "nowrap" }}>
              Данные загружаются...
            </Typography>
            <CircularProgress color="inherit" size={15} />
          </Box>
        ) : (
          <Box>
            {monthlyUserAttendance?.length > 0 ? (
              <Box>
                <Grid container alignItems="center" mb={1}>
                  <Typography variant="h5" sx={{ textTransform: "capitalize", fontWeight: 600 }}>
                    {currentMonth.format("MMMM, YYYY")}
                  </Typography>
                </Grid>
                <Box sx={{ p: 1, overflowX: "auto" }}>
                  <Grid
                    container
                    spacing={0}
                    columns={7}
                    sx={{
                      minWidth: "1200px",
                      borderRadius: "5px",
                      backgroundColor: "#ebecf2",
                      border: "solid 1px #0a0f1c",
                    }}
                  >
                    {["Пнд", "Втр", "Срд", "Чтв", "Птн", "Суб", "Вск"].map((day, index) => (
                      <Grid
                        item
                        xs={1}
                        key={day}
                        sx={{
                          minWidth: 165,
                          bgcolor: "#5F8CCC",
                          borderBottom: "solid 1px #0a0f1c",
                          p: 1,
                          ...(index === 0 ? { borderTopLeftRadius: "5px" } : {}),
                          ...(index === 6 ? { borderTopRightRadius: "5px" } : {}),
                        }}
                      >
                        <Typography align="center" variant="body1" sx={{ color: "#fff", fontWeight: 800 }}>
                          {day}
                        </Typography>
                      </Grid>
                    ))}
                    {daysInMonth.map((date, index) => {
                      const isHighlighted =
                        date &&
                        (date.isAfter(firstDate, "day") || date.isSame(firstDate, "day")) &&
                        (date.isBefore(currentDate, "day") || date.isSame(currentDate, "day"));
                      const attendance = date ? attendanceMap?.[dayjs(date).format("YYYY-MM-DD")] : null;
                      return (
                        <CalendarCell
                          key={`${dayjs(date).format("YYYY-MM-DD")}-${index}`}
                          date={date}
                          attendance={attendance}
                          isBottomLeft={index === bottomLeftIndex}
                          isBottomRight={index === bottomRightIndex}
                          isHighlighted={isHighlighted}
                        />
                      );
                    })}
                  </Grid>
                </Box>
              </Box>
            ) : (
              <Typography variant="inherit" color={"inherit"} sx={{ whiteSpace: "nowrap" }}>
                Данные отсутствуют.
              </Typography>
            )}
          </Box>
        )}
      </LocalizationProvider>
    </Box>
  );
};

export default CurrentStateAttendance;
