"use client";

import {
  Box,
  Grid,
  Table,
  Alert,
  Button,
  Switch,
  Tooltip,
  TableRow,
  ListItem,
  TableCell,
  TableBody,
  TableHead,
  Typography,
  IconButton,
  SwitchProps,
  TableContainer,
  CircularProgress,
  styled,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { TUserModel } from "@/models/user/user";
import DoneIcon from "@mui/icons-material/Done";
import React, { useState, useEffect, useContext } from "react";
import { useUserActsStore } from "@/stores/personal-area/acts/acts";
import { StyledTableCell } from "@/components/other/StyledTableCell";
import { ActsFormatDate } from "@/components/account/personal-area/_helpers";
import ActLineReview from "@/components/account/personal-area/finance/ActComponents/ActLineReview";
import { ActsContext } from "@/components/account/personal-area/finance/ActsInProgress/ActsInProgressProvider";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";

type ActDetailsType = {
  handleCloseModal: () => void;
  act: Record<string, any> | null;
};

const ForwardedSwitch = React.forwardRef<HTMLButtonElement, SwitchProps>((props, ref) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} ref={ref} />
));

ForwardedSwitch.displayName = "ActDetailsSwitch";

const ActDetailsSwitch = styled(ForwardedSwitch)(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#5F8CCC",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[600],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: "#E9E9EA",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

const ActDetails = ({ act, handleCloseModal }: ActDetailsType) => {
  const actStore = useUserActsStore();
  const actsContext = useContext(ActsContext);
  const [loading, setLoading] = useState<boolean>(true);
  const currentUserContext = useContext(CurrentUserContext);
  const [actLines, setActLines] = useState<Record<string, any>[]>([]);
  const [currentUser, setCurrentUser] = useState<TUserModel | null>(null);
  const [visibleTableCell, setVisibleTableCell] = useState<boolean>(true);
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);

  const allActLinesAreVerified = actLines.every((line) => line.verified);
  const hasConversation = actLines.some((actLine) => actLine?.conversation?.length > 0);

  const markAsDone = (actLine: Record<string, any>) => {
    actLines.map((line) => {
      if (line.id === actLine.id) {
        const requestBody = {
          data: {
            id: actLine.id,
            verified: !line.verified,
          },
        };

        actStore.updateActLine(requestBody, (data: Record<string, any>) => {
          if (data.status === 0) {
            toggleVerified(actLine.id);
            updateActStatus();
            enqueueSnackbar(`ActLine был отмечен как ${!line.verified ? "правильный" : "не правильный"}`, {
              variant: "success",
            });
          } else {
            enqueueSnackbar("Не удалось обновить ActLine", { variant: "error" });
          }
        });
      }
    });
  };

  const markAllAsVerified = () => {
    let promises: Promise<void>[] = [];
    if (allActLinesAreVerified) {
      promises = actLines.map((line) => {
        const requestBody = {
          data: {
            id: line.id,
            verified: false,
          },
        };

        return new Promise<void>((resolve, reject) => {
          actStore.updateActLine(requestBody, (data: Record<string, any>) => {
            if (data.status === 0) {
              resolve();
            } else {
              reject(new Error("Update failed for line id: " + line.id));
            }
          });
        });
      });
    } else {
      const notVerifiedLines = actLines.filter((line) => !line.verified);
      promises = notVerifiedLines.map((line) => {
        const requestBody = {
          data: {
            id: line.id,
            verified: !line.verified,
          },
        };

        return new Promise<void>((resolve, reject) => {
          actStore.updateActLine(requestBody, (data: Record<string, any>) => {
            if (data.status === 0) {
              resolve();
            } else {
              reject(new Error("Update failed for line id: " + line.id));
            }
          });
        });
      });
    }

    Promise.all(promises)
      .then(() => {
        reloadTheAct();
        updateActStatus();
        enqueueSnackbar("Все строки были успешно обновлены.", { variant: "success" });
      })
      .catch((error) => {
        enqueueSnackbar("Не удалось обновить ActLines", { variant: "error" });
      });
  };

  const toggleVerified = (id: number) => {
    setActLines((prevLines) =>
      prevLines.map((line) => (line.id === id ? { ...line, verified: !line.verified } : line))
    );
  };

  const updateActStatus = () => {
    if (act?.status === "created") {
      const requestBody = {
        data: {
          id: act?.id,
          status: "inProgress",
        },
      };

      actStore.updateAct(requestBody, (data: Record<string, any>) => {
        if (data.status === 0) {
          actsContext?.reloadActs();
        } else {
          enqueueSnackbar("Не удалось обновить Act", { variant: "error" });
        }
      });
    }
  };

  const handleActConfirmation = () => {
    const requestBody = {
      data: {
        id: act?.id,
        ...(currentUser?.id === act?.accountant?.id ? { approvedAcc: true } : { approvedSub: true }),
        ...(currentUser?.id === act?.accountant?.id && act?.approvedSub ? { status: "done" } : { status: "pending" }),
        ...(currentUser?.organization?.id === act?.organization?.id && act?.approvedAcc ? { status: "done" } : {}),
      },
    };

    actStore.updateAct(requestBody, (data: Record<string, any>) => {
      if (data.status === 0) {
        if (requestBody.data.status == "done") {
          const reqBody = {
            data: {
              id: act?.organization?.id,
              balance: act?.balanceAfter,
            },
          };

          actStore.updateOrganizationBalance(reqBody, (data: Record<string, any>) => {
            if (data.status !== 0) console.log("BalanceAfter of organization hasn't been updated!");
          });
        }
        actsContext?.reloadActs();
        enqueueSnackbar("Акт был успешно подтверждён!", { variant: "success" });
        handleCloseModal();
      }
    });
  };

  const reloadTheAct = () => {
    actStore.fetchActById(act?.id, (data: Record<string, any>) => {
      setLoading(false);
      if (data.status === 0) {
        setActLines(data.data[0].actLines);
      } else {
        enqueueSnackbar("Не удалось загрузить контент акта...", { variant: "error" });
      }
    });
  };

  const showConfirmationButton = () => {
    if (!allActLinesAreVerified) return false;

    const isAccountant = currentUser?.id === act?.accountant?.id;
    const isSameOrganization = currentUser?.organization?.id === act?.organization?.id;

    if (
      (!act?.approvedAcc && isAccountant) ||
      (!act?.approvedSub && currentUserRoles?.isSubagent && isSameOrganization)
    )
      return true;

    return false;
  };

  useEffect(() => {
    if (currentUserContext?.currentUser) setCurrentUser(currentUserContext?.currentUser);
    if (currentUserContext?.userRoles) setCurrentUserRoles(currentUserContext?.userRoles);

    if (act?.status === "pending" || act?.status === "done") {
      setLoading(false);
      setVisibleTableCell(false);
      setActLines(act?.actLines);
    } else {
      setLoading(false);
      setActLines(act?.actLines);
    }
  }, [currentUserContext]);

  return (
    <Box sx={{ width: 1 }}>
      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, m: 3 }}>
          <Typography variant="inherit" color={"inherit"}>
            Загрузка контент акта...
          </Typography>
          <CircularProgress color="inherit" size={15} />
        </Box>
      ) : (
        <Box sx={{ width: 1, overflow: "auto", maxHeight: "600px", p: 2 }}>
          {actLines?.length > 0 ? (
            <Box
              border={2}
              id={`act-pdf-container-${act?.id}`}
              sx={{ display: "flex", flexDirection: "column", minWidth: "1000px", maxWidth: "1300px", mx: "auto" }}
            >
              <Box
                sx={{
                  width: 1,
                  display: "flex",
                  textAlign: "center",
                  flexDirection: "column",
                }}
              >
                <Typography variant="subtitle1" sx={{ fontSize: "medium", fontWeight: "bold" }}>
                  Акт сверки по
                </Typography>
                <Typography variant="subtitle1" sx={{ fontSize: "medium", fontWeight: "bold" }}>
                  за {ActsFormatDate(act?.startDate)} - {ActsFormatDate(act?.endDate)}
                </Typography>
              </Box>

              <Box display="flex" flexDirection="column">
                <Box borderTop={2}>
                  <Typography variant="subtitle1" sx={{ p: 0.5, fontWeight: "bold" }}>
                    ОсОО &quot;Kyrgyz Concept&quot; (Кыргыз Концепт)
                  </Typography>
                </Box>
                <Box display="flex" flexDirection="column">
                  <Box display="flex">
                    <Box flex={3} borderTop={2} sx={{ p: 0.5 }}>
                      <Typography>в лице главного бухгалтера</Typography>
                    </Box>
                    <Box flex={9} borderLeft={2} borderTop={2} sx={{ p: 0.5 }}>
                      <Typography sx={{ fontWeight: "bold" }}>{act?.chiefAccountant?.name}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box display="flex" flexDirection="column">
                <Box borderTop={2}>
                  <Typography variant="subtitle1" sx={{ p: 0.5, fontWeight: "bold" }}>
                    и {act?.organization?.name}
                  </Typography>
                </Box>
                <Box display="flex" flexDirection="column">
                  <Box display="flex">
                    <Box flex={3} borderTop={2} sx={{ p: 0.5, display: "flex", flexDirection: "column" }}>
                      <Box>
                        <Typography>в лице главного бухгалтера</Typography>
                        <Typography>сделали выверку расчетов за</Typography>
                      </Box>
                    </Box>
                    <Box flex={9} borderLeft={2} borderTop={2} sx={{ p: 0.5 }}>
                      <Typography sx={{ fontWeight: "bold", transform: "translate(0, 50%)", top: "50%" }}>
                        {ActsFormatDate(act?.startDate)} - {ActsFormatDate(act?.endDate)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box borderTop={2} sx={{ p: 0.5 }}>
                <Typography>
                  Сальдо на {ActsFormatDate(act?.startDate)} составляет {act?.balanceBefore} в пользу ОсОО &quot;Kyrgyz
                  Concept&quot; (Кыргыз Концепт)
                </Typography>
              </Box>

              <Box borderTop={2}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ borderBottom: 2 }}>
                        <StyledTableCell
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            fontSize: "14px",
                            borderColor: "black",
                            borderRight: 2,
                            borderBottom: 2,
                            width: "2%",
                          }}
                        >
                          №
                        </StyledTableCell>
                        <StyledTableCell
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            fontSize: "14px",
                            borderColor: "black",
                            borderRight: 2,
                            borderBottom: 2,
                            width: "5%",
                          }}
                        >
                          Дата
                        </StyledTableCell>
                        <StyledTableCell
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            fontSize: "14px",
                            borderColor: "black",
                            borderRight: 2,
                            borderBottom: 2,
                            width: "12%",
                          }}
                        >
                          Документ
                        </StyledTableCell>
                        <StyledTableCell
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            fontSize: "14px",
                            borderColor: "black",
                            borderRight: 2,
                            borderBottom: 2,
                            width: "21%",
                          }}
                        >
                          Операции
                        </StyledTableCell>
                        <StyledTableCell
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            fontSize: "14px",
                            borderColor: "black",
                            borderRight: 2,
                            borderBottom: 2,
                            width: "8%",
                          }}
                        >
                          № исх. документа
                        </StyledTableCell>
                        <StyledTableCell
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            fontSize: "14px",
                            borderColor: "black",
                            borderRight: 2,
                            borderBottom: 2,
                            width: "8%",
                          }}
                        >
                          Номер билета
                        </StyledTableCell>
                        <StyledTableCell
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            fontSize: "14px",
                            borderColor: "black",
                            borderRight: 2,
                            borderBottom: 2,
                            width: "15%",
                          }}
                        >
                          Пассажир
                        </StyledTableCell>
                        <StyledTableCell
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            fontSize: "14px",
                            borderColor: "black",
                            p: 0,
                            borderBottom: 2,
                            ...(visibleTableCell ? { borderRight: 2 } : {}),
                            width: "20%",
                          }}
                        >
                          <Grid container>
                            <Grid item xs={12} borderBottom={2}>
                              Сумма
                            </Grid>
                            <Grid item xs={12}>
                              <Grid container>
                                <Grid item xs={6}>
                                  Дебет
                                </Grid>
                                <Grid item xs={6} sx={{ height: "29px" }} borderLeft={2}>
                                  Кредит
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </StyledTableCell>

                        {visibleTableCell && (
                          <StyledTableCell
                            sx={{
                              width: "5%",
                              borderBottom: 2,
                              fontSize: "14px",
                              fontWeight: "bold",
                              borderColor: "black",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 2,
                                width: "100%",
                              }}
                            >
                              {hasConversation || currentUserRoles?.isAdmin || currentUserRoles?.isChiefAccountant ? (
                                <ActDetailsSwitch
                                  checked={false}
                                  disabled={true}
                                  inputProps={{ "aria-label": "controlled" }}
                                />
                              ) : (
                                <Tooltip title="Отметить все строки верно">
                                  <ActDetailsSwitch
                                    checked={allActLinesAreVerified}
                                    onChange={() => markAllAsVerified()}
                                    inputProps={{ "aria-label": "controlled" }}
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          </StyledTableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow sx={{ bgcolor: "#e4fce4" }}>
                        <StyledTableCell
                          sx={{ borderColor: "black", borderRight: 2, borderBottom: 2, fontSize: "12px" }}
                        ></StyledTableCell>
                        <StyledTableCell
                          colSpan={6}
                          sx={{
                            fontWeight: "bold",
                            fontSize: "12px",
                            borderColor: "black",
                            borderRight: 2,
                            borderBottom: 2,
                            py: 0,
                          }}
                        >
                          Сальдо на {ActsFormatDate(act?.startDate)}
                        </StyledTableCell>

                        <StyledTableCell
                          align="center"
                          sx={{
                            p: 0,
                            fontWeight: "bold",
                            fontSize: "12px",
                            borderColor: "black",
                            borderBottom: 2,
                            ...(visibleTableCell ? { borderRight: 2 } : {}),
                          }}
                        >
                          <Grid container>
                            <Grid item xs={6} sx={{ fontSize: "12px" }}>
                              {act?.balanceBefore}
                            </Grid>
                            <Grid item xs={6} borderLeft={2} sx={{ fontSize: "12px" }}></Grid>
                          </Grid>
                        </StyledTableCell>

                        {visibleTableCell && (
                          <StyledTableCell
                            align="center"
                            sx={{ borderColor: "black", p: 0, borderBottom: 2 }}
                          ></StyledTableCell>
                        )}
                      </TableRow>
                      {actLines?.length > 0 ? (
                        actLines?.map((line: Record<string, any>, index: number) => {
                          return (
                            <TableRow key={line?.id}>
                              <StyledTableCell
                                sx={{ borderColor: "black", textAlign: "center", borderRight: 2, borderBottom: 2 }}
                              >
                                {index + 1}
                              </StyledTableCell>
                              <StyledTableCell
                                sx={{ borderColor: "black", textAlign: "center", borderRight: 2, borderBottom: 2 }}
                              >
                                {ActsFormatDate(line.issuedDate)}
                              </StyledTableCell>
                              <StyledTableCell
                                sx={{ borderColor: "black", textAlign: "center", borderRight: 2, borderBottom: 2 }}
                              >
                                {line?.airFiles[0]?.status} {line?.invNumber}
                              </StyledTableCell>
                              <StyledTableCell
                                sx={{ borderColor: "black", textAlign: "center", borderRight: 2, borderBottom: 2 }}
                              >
                                {line?.airFiles[0]?.status} {act?.organization?.name}
                              </StyledTableCell>
                              <StyledTableCell
                                sx={{ borderColor: "black", textAlign: "center", borderRight: 2, borderBottom: 2 }}
                              >
                                {line?.invNumber}
                              </StyledTableCell>
                              <StyledTableCell
                                sx={{ borderColor: "black", textAlign: "center", borderRight: 2, borderBottom: 2 }}
                              >
                                <Box sx={{ height: `${line?.airFiles?.length * 20}px` }}>
                                  {line?.airFiles?.map((airFile: Record<string, any>) => (
                                    <ListItem key={airFile?.id} sx={{ p: 0 }}>
                                      <Typography sx={{ whiteSpace: "nowrap" }}>{airFile?.docNum}</Typography>
                                    </ListItem>
                                  ))}
                                </Box>
                              </StyledTableCell>
                              <StyledTableCell sx={{ borderColor: "black", py: 0, borderRight: 2, borderBottom: 2 }}>
                                <Box sx={{ height: `${line?.airFiles?.length * 20}px` }}>
                                  {line?.airFiles?.map((airFile: Record<string, any>) => (
                                    <ListItem key={airFile?.id} sx={{ p: 0 }}>
                                      <Typography sx={{ whiteSpace: "nowrap" }}>
                                        {airFile?.firName} {airFile?.lasNam}
                                      </Typography>
                                    </ListItem>
                                  ))}
                                </Box>
                              </StyledTableCell>
                              <StyledTableCell
                                sx={{
                                  p: 0,
                                  borderColor: "black",
                                  borderBottom: 2,
                                  ...(visibleTableCell ? { borderRight: 2 } : {}),
                                }}
                              >
                                <Box
                                  sx={
                                    line?.airFiles?.length > 1
                                      ? { height: `${line?.airFiles?.length * 25}px` }
                                      : { height: "50px" }
                                  }
                                >
                                  <Grid container sx={{ height: "100%" }}>
                                    <Grid
                                      item
                                      xs={6}
                                      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                                    >
                                      {line.debit}
                                    </Grid>
                                    <Grid
                                      item
                                      xs={6}
                                      borderLeft={2}
                                      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                                    >
                                      {line.credit}
                                    </Grid>
                                  </Grid>
                                </Box>
                              </StyledTableCell>

                              {visibleTableCell && (
                                <StyledTableCell
                                  sx={{ fontWeight: "bold", fontSize: "14px", borderColor: "black", borderBottom: 2 }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 2,
                                      width: "100%",
                                    }}
                                  >
                                    <IconButton
                                      size="small"
                                      disabled={
                                        line?.conversation?.length > 0 ||
                                        currentUserRoles?.isAdmin ||
                                        currentUserRoles?.isChiefAccountant
                                      }
                                      sx={
                                        line?.verified
                                          ? {
                                              backgroundColor: "#5F8CCC",
                                              color: "white",
                                              "&:hover": {
                                                backgroundColor: "#5F8CCC",
                                                color: "white",
                                              },
                                            }
                                          : {}
                                      }
                                      onClick={() => markAsDone(line)}
                                    >
                                      <Tooltip title="Отметить как правильное">
                                        <DoneIcon />
                                      </Tooltip>
                                    </IconButton>

                                    <ActLineReview
                                      act={act}
                                      actLine={line}
                                      actLineIndex={index + 1}
                                      reloadTheAct={() => reloadTheAct()}
                                    />
                                  </Box>
                                </StyledTableCell>
                              )}
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={visibleTableCell ? 9 : 8}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, m: 3 }}>
                              <Typography variant="inherit" color={"inherit"} sx={{ whiteSpace: "nowrap" }}>
                                Результат не найден...
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}

                      <TableRow sx={{ bgcolor: "#e4fce4" }}>
                        <StyledTableCell
                          sx={{ borderColor: "black", borderRight: 2, borderBottom: 2, fontSize: "12px" }}
                        ></StyledTableCell>
                        <StyledTableCell
                          colSpan={6}
                          sx={{
                            fontWeight: "bold",
                            fontSize: "12px",
                            borderColor: "black",
                            borderRight: 2,
                            borderBottom: 2,
                            py: 0,
                          }}
                        >
                          Обороты за период
                        </StyledTableCell>

                        <StyledTableCell
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            fontSize: "12px",
                            borderBottom: 2,
                            borderColor: "black",
                            ...(visibleTableCell ? { borderRight: 2 } : {}),
                            py: 0,
                          }}
                        >
                          <Grid container>
                            <Grid item xs={6} sx={{ fontSize: "12px" }}>
                              {act?.debitTotal}
                            </Grid>
                            <Grid item xs={6} borderLeft={2} sx={{ fontSize: "12px" }}>
                              {act?.creditTotal}
                            </Grid>
                          </Grid>
                        </StyledTableCell>
                        {visibleTableCell && (
                          <StyledTableCell
                            align="center"
                            sx={{ borderColor: "black", borderBottom: 2, py: 0 }}
                          ></StyledTableCell>
                        )}
                      </TableRow>

                      <TableRow sx={{ bgcolor: "#e4fce4" }}>
                        <StyledTableCell sx={{ borderRight: 2, fontSize: "12px" }}></StyledTableCell>
                        <StyledTableCell
                          colSpan={6}
                          sx={{ fontWeight: "bold", fontSize: "12px", borderRight: 2, py: 0 }}
                        >
                          Сальдо на {ActsFormatDate(act?.endDate)}
                        </StyledTableCell>

                        <StyledTableCell
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            fontSize: "12px",
                            ...(visibleTableCell ? { borderRight: 2 } : {}),
                            p: 0,
                          }}
                        >
                          <Grid container>
                            <Grid item xs={6} sx={{ fontSize: "12px" }}>
                              {act?.balanceAfter}
                            </Grid>
                            <Grid item xs={6} borderLeft={2} sx={{ fontSize: "12px" }}></Grid>
                          </Grid>
                        </StyledTableCell>
                        {visibleTableCell && <StyledTableCell align="center" sx={{ py: 0 }}></StyledTableCell>}
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Box borderTop={2} sx={{ px: 0.5, pb: 0.5, pt: 2 }}>
                <Typography>
                  Сальдо на {ActsFormatDate(act?.endDate)} составляет {act?.balanceAfter} в пользу ОсОО &quot;Kyrgyz
                  Concept&quot; (Кыргыз Концепт)
                </Typography>
              </Box>

              <Box borderTop={2} sx={{ px: 0.5, py: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography>Гл. бухгалтер ОсОО &quot;Kyrgyz Concept&quot; (Кыргыз Концепт)</Typography>
                <Typography>Гл. бухгалтер {act?.organization?.name}</Typography>
              </Box>
            </Box>
          ) : (
            <Box>
              <Alert severity="warning" sx={{ p: 2 }}>
                <span>Не найдено ни одного результата в этом диапазоне дат</span>
              </Alert>
            </Box>
          )}
        </Box>
      )}

      {showConfirmationButton() && (
        <Box sx={{ width: 1, display: "flex", justifyContent: "end", mt: 1 }}>
          <Button
            onClick={handleActConfirmation}
            variant="contained"
            sx={{
              mt: 1,
              backgroundColor: "#5F8CCC",
              "&:hover": {
                backgroundColor: "#497ec9",
              },
            }}
          >
            Подтвердить
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ActDetails;
