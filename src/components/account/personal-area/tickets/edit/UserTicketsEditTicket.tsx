"use client";

import {
  Box,
  Grid,
  Card,
  Alert,
  Button,
  Divider,
  Popover,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
  styled,
  Tooltip,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useForm, Controller } from "react-hook-form";
import React, { useEffect, useContext, useState } from "react";
import CachedRoundedIcon from "@mui/icons-material/CachedRounded";
import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import { ActsFormatDate } from "@/components/account/personal-area/_helpers";
import { usePersonalAreaTicketsStore } from "@/stores/personal-area/tickets/user-tickets";
import ElectronicOrderForm from "@/components/order/electronic-order-form/ElectronicOrderForm";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";

type UserTicketsEditTicketProps = {
  ticket: Record<string, any> | null;
  resetSelectedRow: () => void;
  reloadTheTable: () => void;
};
interface BlinkProps {
  blink: string;
}

const Blink = styled(Typography)<BlinkProps>(({ blink }) => ({
  "@keyframes blink": {
    "0%": { opacity: 1 },
    "50%": { opacity: 0 },
    "100%": { opacity: 1 },
  },
  animation: blink == "true" ? "blink 1s infinite" : "none",
}));

function UserTicketsEditTicket({ ticket, resetSelectedRow, reloadTheTable }: UserTicketsEditTicketProps) {
  const userTicketStore = usePersonalAreaTicketsStore();
  const currentUserContext = useContext(CurrentUserContext);
  const [totalSum, setTotalSum] = useState<number | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [currencyId, setCurrencyId] = useState<number | null>(null);
  const [fieldDisabled, setFieldDisabled] = useState<boolean>(true);
  const [airFiles, setAirFiles] = useState<Record<string, any>[]>([]);
  const [sales, setSales] = useState<Record<string, any>[] | null>(null);
  const [organizations, setOrganizations] = useState<Record<string, any>[]>([]);
  const [isInvoiceFormVisible, setIsInvoiceFormVisible] = useState<boolean>(false);
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);
  const [anchorElPopover, setAnchorElPopover] = useState<null | HTMLElement>(null);
  const [selectedAirFile, setSelectedAirFile] = useState<Record<string, any> | null>(null);
  const [blinkTheInvoiceFormButton, setBlinkTheInvoiceFormButton] = useState<boolean>(false);
  const [typeOfPassengers, setTypeOfPassengers] = useState<Record<string, any>[] | null>(null);
  const ticketBackgroundImage = `${process.env.NODE_ENV === "production" ? "/foms/front/" : "/"}assets/airplane.jpg`;
  const openPopover = Boolean(anchorElPopover);

  const [airFilesForms, setAirFilesForms] = useState(
    airFiles.reduce((formData, airFile) => {
      formData[airFile.id] = {
        id: airFile?.id,
        passengerType: "",
      };
      return formData;
    }, {})
  );

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>, airFile: any) => {
    setAnchorElPopover(event.currentTarget);
    setSelectedAirFile(airFile);
  };

  const handlePopoverClose = () => {
    setAnchorElPopover(null);
    setSelectedAirFile(null);
  };

  const handleFormChange = (airFileTicketNumber: string, fieldName: string, value: string) => {
    setAirFilesForms((prevState) => ({
      ...prevState,
      [airFileTicketNumber]: {
        ...prevState[airFileTicketNumber],
        [fieldName]: value,
      },
    }));
  };

  const {
    handleSubmit: handleEditTicketSubmission,
    control,
    setValue,
    formState: { isDirty, errors },
    reset,
  } = useForm();

  const {
    handleSubmit: handleEditInvoiceSubmission,
    control: editInvoiceFormControl,
    setValue: editInvoiceFormSetValue,
    reset: editInvoiceFormReset,
  } = useForm({
    defaultValues: {
      pnrNum: "",
      invNum: "",
    },
  });

  const invoiceNumberCallback = (data: string) => {
    editInvoiceFormSetValue("invNum", data);
    setBlinkTheInvoiceFormButton(true);
  };

  useEffect(() => {
    if (ticket) {
      const requestBody = {
        offset: 0,
        sortBy: ["-createdOn"],
        data: {
          criteria: [
            {
              fieldName: "recLoc",
              operator: "=",
              value: `${ticket.recLoc}`,
            },
          ],
        },
      };

      userTicketStore.fetchTicketsByPnrNumber(requestBody, (data: Record<string, any>) => {
        if (data.status === 0) {
          setFieldDisabled(false);
          setIsInvoiceFormVisible(false);
          setValue("pnrNum", ticket.recLoc ?? "");
          setValue("operId", ticket.opera?.id ?? 0);
          setValue("organizationId", ticket.account?.id ?? 0);
          setValue("responsiblePersonId", ticket.sales?.id ?? 0);
          editInvoiceFormSetValue("pnrNum", ticket.recLoc ?? "");

          setAirFiles(data.data);
        }
      });
    }
  }, [ticket]);

  useEffect(() => {
    userTicketStore.fetchTypeOfPassengers((data: Record<string, any>) => {
      if (data.status === 0) setTypeOfPassengers(data.data);
    });
  }, []);

  useEffect(() => {
    if (currentUserRoles?.isAgent || currentUserRoles?.isManager || currentUserRoles?.isAdmin) {
      userTicketStore.fetchAllSales(null, (data: Record<string, any>) => {
        if (data.status == 0) setSales(data.data);
      });
      userTicketStore.fetchAllAccount((data: Record<string, any>) => {
        if (data.status === 0) setOrganizations(data.data);
      });
    }

    setIsAvailable(!!(currentUserRoles?.isManager || currentUserRoles?.isAdmin || currentUserRoles?.isAgent));
  }, [currentUserRoles]);

  useEffect(() => {
    if (currentUserContext?.userRoles) setCurrentUserRoles(currentUserContext?.userRoles);
  }, [currentUserContext]);

  const handleEditTicketFormSubmission = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    handleEditTicketSubmission(onSubmitEditTicket)();
  };

  const handleEditInvoiceFormSubmission = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    handleEditInvoiceSubmission(onSubmitEditInvoice)();
  };

  const updateTicketCallback = (data: Record<string, any>) => {
    if (data.status === 0) {
      setFieldDisabled(true);
      setIsInvoiceFormVisible(true);
      setTotalSum(data?.data?.totalSum);
      setCurrencyId(data?.data?.currencyId);
      enqueueSnackbar(`Данные PNR успешно обновлены`, { variant: "success" });

      setTimeout(() => {
        const editInvoiceForm = document.getElementById("updateInvoiceNumForm");
        if (editInvoiceForm) editInvoiceForm?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    } else {
      enqueueSnackbar(`${data.messageStatus}`, { variant: "error" });
    }
  };

  const updateInvoiceCallback = (data: Record<string, any>) => {
    if (data.status == 0) {
      reloadTheTable();
      setTotalSum(null);
      setCurrencyId(null);
      setFieldDisabled(true);
      setIsInvoiceFormVisible(false);
      enqueueSnackbar("Номер инвойса успешно обновлено", { variant: "success" });
    } else {
      enqueueSnackbar("Что то пошло не так", { variant: "error" });
    }
  };

  const resetTicketForm = () => {
    reset({
      responsiblePersonId: 0,
      organizationId: 0,
      pnrNum: "",
    });
    setAirFiles([]);
  };

  const resetInvoiceForm = () => {
    editInvoiceFormReset({
      pnrNum: "",
      invNum: "",
    });
  };

  const onSubmitEditTicket = async (data: Record<string, any>) => {
    if (isDirty) {
      const tickets = Object.values(airFilesForms).reduce((key, obj) => {
        return { ...key, ...obj };
      }, {});

      const requestBody = {
        data: {
          operatorId: data.operId,
          recLoc: data.pnrNum,
          salesId: data.responsiblePersonId,
          organizationId: data.organizationId,
          tickets: tickets,
        },
      };

      userTicketStore.updateTicket(requestBody, updateTicketCallback);
    }
  };

  const onSubmitEditInvoice = async (data: Record<string, any>) => {
    const requestBody = {
      data: {
        recLoc: data.pnrNum,
        numberInvoice: data.invNum,
      },
    };

    userTicketStore.updateTicket(requestBody, updateInvoiceCallback);
    setBlinkTheInvoiceFormButton(false);
    resetSelectedRow();
    resetInvoiceForm();
    resetTicketForm();
  };

  const handleRefresh = () => {
    setFieldDisabled(true);
    resetSelectedRow();
    resetTicketForm();
    resetInvoiceForm();
  };

  return (
    <Box sx={{ mx: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="h6" sx={{ textAlign: "center", my: 1, fontWeight: 600, width: "90%" }}>
          Билет
        </Typography>
        <IconButton onClick={handleRefresh}>
          <CachedRoundedIcon />
        </IconButton>
      </Box>
      <Divider />

      <Box>
        <form id="userTicketsEditTicketForm" onSubmit={handleEditTicketFormSubmission}>
          <Grid container alignItems="center" mt={1}>
            <Grid item xs={12} md={12} xl={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                PNR номер
              </Typography>
            </Grid>
            <Grid item xs={12} md={12} xl={6}>
              <Controller
                name="pnrNum"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={true}
                    variant="standard"
                    placeholder="PNR номер"
                    value={field.value ?? ""}
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        border: "1px solid #eaeafe",
                        borderRadius: "5px",
                        px: 1,
                      },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container alignItems="center" mt={1}>
            <Grid item xs={12} md={12} xl={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Ответственный
              </Typography>
            </Grid>
            <Grid item xs={12} md={12} xl={6}>
              <Controller
                control={control}
                name="responsiblePersonId"
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={sales ?? []}
                    disabled={!isAvailable || fieldDisabled}
                    getOptionLabel={(option: any) => option?.fullName ?? ""}
                    noOptionsText="Нет данных"
                    onChange={(e, value) => field.onChange(value?.id ?? 0)}
                    value={sales?.find((item: any) => item.id === field.value) ?? null}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        {option.fullName}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField {...params} label="" variant="standard" required={true} sx={{ minWidth: 130 }} />
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container alignItems="center" mt={1}>
            <Grid item xs={12} md={12} xl={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Оператор
              </Typography>
            </Grid>
            <Grid item xs={12} md={12} xl={6}>
              <Controller
                name="operId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={sales ?? []}
                    disabled={!isAvailable || fieldDisabled}
                    getOptionLabel={(option: any) => option?.fullName ?? ""}
                    noOptionsText="Нет данных"
                    onChange={(e, value) => field.onChange(value?.id ?? 0)}
                    value={sales?.find((item: any) => item.id === field.value) ?? null}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        {option.fullName}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField {...params} variant="standard" label="" required={true} sx={{ minWidth: 130 }} />
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container alignItems="center" mt={1}>
            <Grid item xs={12} md={12} xl={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Организация
              </Typography>
            </Grid>
            <Grid item xs={12} md={12} xl={6}>
              <Controller
                name="organizationId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={organizations ?? []}
                    disabled={userTicketStore.loadingAllAccounts || !isAvailable || fieldDisabled}
                    getOptionLabel={(option: Record<string, any>) => option?.name}
                    noOptionsText="Нет данных"
                    onChange={(e, value) => field.onChange(value?.id ?? 0)}
                    value={organizations?.find((item: Record<string, any>) => item.id === field.value) ?? null}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        {option.name}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField {...params} variant="standard" label="" required={true} sx={{ minWidth: 130 }} />
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>

          {airFiles?.length > 0 && (
            <Box
              sx={{
                mt: 1,
                pr: 1,
                width: 1,
                height: "55px",
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  width: "5px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#888",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#555",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                  justifyContent: "left",
                  width: 1,
                  gap: 1,
                }}
              >
                {airFiles.map((airFile) => {
                  return (
                    <Box key={airFile.id} sx={{ width: 1 }}>
                      <Box
                        sx={{
                          width: 1,
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Tooltip title="Подробности билета">
                          <Box
                            aria-haspopup="true"
                            onClick={(e) => handlePopoverOpen(e, airFile)}
                            aria-owns={openPopover ? "airfile-popover" : undefined}
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              alignContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <AirplaneTicketIcon
                              fontSize="small"
                              sx={{
                                mr: 1,
                                backgroundColor: "white",
                                color: "#5F8CCC",
                                "&:hover": {
                                  backgroundColor: "white",
                                  color: "#5F8CCC",
                                },
                              }}
                            />

                            <Typography variant="subtitle2">
                              <strong>{airFile?.docNum}</strong>
                            </Typography>
                          </Box>
                        </Tooltip>

                        <Box>
                          {!!airFile?.paxTyp ? (
                            <Box sx={{ height: 43, display: "flex", alignItems: "center" }}>
                              <Typography variant="subtitle2">
                                Тип пассажира: <strong> {airFile?.paxTyp.toUpperCase()}</strong>
                              </Typography>
                            </Box>
                          ) : (
                            <Controller
                              name={`${airFile.id}-passenger-type`}
                              control={control}
                              render={({ field }) => (
                                <Autocomplete
                                  {...field}
                                  size="small"
                                  options={typeOfPassengers ?? []}
                                  getOptionLabel={(option: Record<string, any>) => option?.title ?? ""}
                                  noOptionsText="Нет данных"
                                  onChange={(e, value) => {
                                    field.onChange(value?.value ?? "");
                                    handleFormChange(airFile.id, `${airFile.docNum}`, value?.value);
                                  }}
                                  value={
                                    typeOfPassengers?.find((item: Record<string, any>) => item.value === field.value) ??
                                    null
                                  }
                                  renderOption={(props, option) => (
                                    <li {...props} key={option.order_seq}>
                                      {option.title}
                                    </li>
                                  )}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Тип"
                                      variant="standard"
                                      required={true}
                                      sx={{ minWidth: 95 }}
                                    />
                                  )}
                                />
                              )}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  );
                })}

                <Popover
                  id="airfile-popover"
                  open={openPopover}
                  anchorEl={anchorElPopover}
                  onClose={handlePopoverClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                >
                  <Card
                    key={selectedAirFile?.id}
                    sx={{ maxWidth: 1, minWidth: 350, maxHeight: 200, py: 3, boxShadow: 3, bgcolor: "#5F8CCC" }}
                  >
                    <Box
                      sx={{
                        px: 1,
                        py: 0.5,
                        bgcolor: "white",
                        position: "relative",
                        "&::before": {
                          content: '""',
                          width: "100%",
                          height: "100%",
                          position: "absolute",
                          backgroundSize: "contain",
                          backgroundPosition: "center center",
                          backgroundRepeat: "no-repeat",

                          backgroundImage: `url(${ticketBackgroundImage})`,
                          opacity: 0.1,
                        },
                      }}
                    >
                      <Grid container spacing={1} justifyContent="space-between" alignItems="center">
                        <Grid item>
                          <Typography variant="h6" sx={{ maxWidth: 200 }}>
                            {selectedAirFile?.firName} <br /> {selectedAirFile?.lasNam}
                          </Typography>
                          <Typography variant="subtitle2" color="text.secondary">
                            № <strong>{selectedAirFile?.docNum}</strong>
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="body2" color="text.secondary">
                            PNR: <strong>{selectedAirFile?.recLoc}</strong>
                          </Typography>
                        </Grid>
                      </Grid>

                      <Box mt={2}>
                        <Grid container spacing={2} justifyContent="space-between">
                          <Grid item>
                            <Typography variant="subtitle2">
                              Статус: <strong>{selectedAirFile?.status}</strong>
                            </Typography>
                            <Typography variant="body2">
                              Дата: {ActsFormatDate(`${selectedAirFile?.createdOn}`)}
                            </Typography>
                          </Grid>
                          <Grid item>
                            {!!selectedAirFile?.paxTyp && (
                              <Box>
                                <Typography variant="subtitle2">
                                  Тип: <strong> {selectedAirFile?.paxTyp.toUpperCase()}</strong>
                                </Typography>
                              </Box>
                            )}
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Card>
                </Popover>
              </Box>
            </Box>
          )}

          {isAvailable && (
            <Button
              fullWidth
              size="small"
              type="submit"
              color="primary"
              variant="contained"
              disabled={fieldDisabled || !isDirty}
              sx={{
                ...(airFiles?.length > 0 ? { mt: 1 } : { mt: 2 }),
                p: 0.4,
                backgroundColor: "#5F8CCC",
                "&:hover": {
                  backgroundColor: "#497ec9",
                },
              }}
            >
              Подтвердить
            </Button>
          )}
        </form>

        {isAvailable && isInvoiceFormVisible && (
          <>
            <Divider sx={{ my: 1 }} />
            <form id="updateInvoiceNumForm" onSubmit={handleEditInvoiceFormSubmission}>
              <Grid container alignItems="center" mt={2} sx={{ display: "none" }}>
                <Grid item xs={12} md={12} xl={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    PNR номер
                  </Typography>
                </Grid>
                <Grid item xs={12} md={12} xl={6}>
                  <Controller
                    name="pnrNum"
                    control={editInvoiceFormControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="PNR номер"
                        variant="standard"
                        disabled={true}
                        InputProps={{
                          disableUnderline: true,
                          sx: {
                            border: "1px solid #eaeafe",
                            borderRadius: "5px",
                            px: 1,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Grid container alignItems="center" mt={1}>
                <Grid item xs={12} md={12} xl={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Номер инвойса
                  </Typography>
                </Grid>
                <Grid item xs={12} md={12} xl={6}>
                  <Controller
                    name="invNum"
                    control={editInvoiceFormControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        disabled={true}
                        variant="standard"
                        placeholder="Invoice Number"
                        InputProps={{
                          disableUnderline: true,
                          sx: {
                            border: "1px solid grey",
                            borderRadius: "5px",
                            px: 1,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Grid container alignItems="center" mt={1}>
                <Grid item xs={12}>
                  <Alert severity="warning">
                    <Typography variant="body2">Вам необходимо получить номер инвойса.</Typography>
                  </Alert>
                </Grid>
              </Grid>

              <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 3 }}>
                <Button
                  fullWidth
                  size="small"
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={!isInvoiceFormVisible}
                  sx={{
                    p: 0.4,
                    backgroundColor: "#5F8CCC",
                    "&:hover": {
                      backgroundColor: "#497ec9",
                    },
                  }}
                >
                  <Blink variant="inherit" blink={blinkTheInvoiceFormButton.toString()}>
                    Изменить номер инвойса
                  </Blink>
                </Button>
                <ElectronicOrderForm
                  props={{
                    totalSum: totalSum,
                    blinkTheButton: true,
                    paymentCurrencyId: currencyId,
                    invoiceNumberCallback: invoiceNumberCallback,
                  }}
                />
              </Box>
            </form>
          </>
        )}
      </Box>
    </Box>
  );
}

export default UserTicketsEditTicket;
