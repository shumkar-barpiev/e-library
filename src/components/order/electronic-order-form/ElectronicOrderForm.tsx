"use client";

import React from "react";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useUserStore } from "@/stores/users/users";

import { useElectronicOrderStore } from "@/stores/electronic-order/electronic-order";
import {
  Avatar,
  Modal,
  Typography,
  Button,
  Box,
  TextField,
  Autocomplete,
  MenuItem,
  styled,
  Stack,
} from "@mui/material";
import {
  Response,
  ShiftType,
  CashierType,
  CurrencyType,
  AirlineCompanyType,
  OrderNumResponseType,
} from "@/models/electronic-order/electronic-order";

type CurrentUserType = {
  id?: number;
} | null;

const modalScreenStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 500, md: 800 },
  bgcolor: "background.paper",
  borderRadius: "5px",
  p: 4,
};

const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-input.Mui-disabled": {
    color: theme.palette.text.primary,
    WebkitTextFillColor: theme.palette.text.primary, // Fix for Chrome
  },
  "& .MuiInputLabel-root.Mui-disabled": {
    color: theme.palette.text.primary,
  },
  "& .MuiInput-underline:before": {
    borderBottom: "1px solid #eaeafe",
  },
  "& .MuiInput-underline.Mui-disabled:before": {
    borderBottom: "1px solid #eaeafe",
  },
}));

type ElectronicOrderFormPropsType = {
  totalSum: number | null;
  blinkTheButton: boolean | null;
  paymentCurrencyId: number | null;
  invoiceNumberCallback: ((data: string) => void) | null;
};

interface BlinkProps {
  blink: string;
}

const Blink = styled(Box)<BlinkProps>(({ blink }) => ({
  "@keyframes blink": {
    "0%": { opacity: 1 },
    "50%": { opacity: 0 },
    "100%": { opacity: 1 },
  },
  animation: blink == "true" ? "blink 1s infinite" : "none",
}));

const ElectronicOrderForm = ({ props }: { props: ElectronicOrderFormPropsType | null }) => {
  const userStore = useUserStore();
  const [open, setOpen] = useState(false);
  const electronicOrderStore = useElectronicOrderStore();
  const [blinkTheButton, setBlinkTheButton] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<CurrentUserType>(null);

  const getCurrentUserIdCallback = (data: Record<string, any>) => {
    if (data.status === 0) {
      setCurrentUserId({
        id: data?.data?.id,
      });
    } else {
      enqueueSnackbar("Что то пошло не так", { variant: "error" });
    }
  };

  useEffect(() => {
    userStore.getCurrentUserId(getCurrentUserIdCallback);
  }, []);

  const [shifts, setShifts] = useState<ShiftType[]>([]);
  const [electronicSequenceId, setElectronicSequenceId] = useState<number>(0);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState<boolean>(true);
  const [airlineCompanies, setAirlineCompanies] = useState<AirlineCompanyType[]>([]);
  const [getOrderNumButtonDisabled, setGetOrderNumButtonDisabled] = useState<boolean>(true);
  const formOrderIcon = `${process.env.NODE_ENV === "production" ? "/foms/front/" : "/"}assets/electronic-order-form.svg`;
  const [cashiers, setCashiers] = useState<CashierType[]>([]);
  const [currency, setCurrency] = useState<CurrencyType[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUserType | null>(null);

  const {
    handleSubmit: handleElectronicFormSubmission,
    control,
    setValue,
    formState: { isDirty },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      shiftId: 0,
      orderNumber: "",
      airlineCompanyId: 0,
      toPay: 0,
      checkedCurrency: 0,
      cashier: 0,
    },
  });

  const toPayWatch = watch("toPay");
  const shiftWatch = watch("shiftId");
  const orderNum = watch("orderNumber");
  const cashierWatch = watch("cashier");
  const airlineCompanyWatch = watch("airlineCompanyId");
  const checkedCurrencyWatch = watch("checkedCurrency");

  const getCashierCallBack = (data: Response) => {
    if (data.status === 0) {
      setCashiers(data.data);
    } else {
      enqueueSnackbar(`Список кассиров неполучено`, { variant: "error" });
    }
  };

  const getCurrentUserCallBack = (data: Response) => {
    if (data.status === 0) {
      setCurrentUser(data.data[0]);
      electronicOrderStore.getCashier(data.data[0], getCashierCallBack);
    } else {
      enqueueSnackbar(`Текущий пользователь не получен`, { variant: "error" });
    }
  };

  const getCurrencyCallBack = (data: Response) => {
    if (data.status === 0) {
      setCurrency(data.data);
      if (
        props?.paymentCurrencyId != undefined &&
        props?.paymentCurrencyId !== null &&
        props?.blinkTheButton !== null &&
        props?.totalSum !== null &&
        props?.totalSum != undefined
      ) {
        setValue("toPay", Math.round(Number(props?.totalSum)));
        setBlinkTheButton(props?.blinkTheButton);
        setValue("checkedCurrency", props?.paymentCurrencyId);
      }
    } else {
      enqueueSnackbar(`Валюты не получены`, { variant: "error" });
    }
  };

  const saveOrderNumCallback = (data: Response) => {
    if (data.codeStatus === 200) {
      if (!!props?.invoiceNumberCallback) {
        setBlinkTheButton(false);
        props?.invoiceNumberCallback(orderNum);
      }
      enqueueSnackbar(`${data.messageStatus}`, { variant: "success" });
    } else {
      enqueueSnackbar(`${data.messageStatus}`, { variant: "error" });
    }
    // setOpen(false);
    // resetForm();
  };

  const createPaymentCallBack = (data: Response) => {
    if (data.status === 0) {
      enqueueSnackbar(`Платеж успешно создан!`, { variant: "success" });
    } else {
      enqueueSnackbar(`${data.messageStatus}`, { variant: "error" });
    }
    setOpen(false);
    resetForm();
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    handleElectronicFormSubmission(onSubmit)();
  };

  const onSubmit = (data: Record<string, any>) => {
    const reqBody: OrderNumResponseType = {
      electronicSequenceId: electronicSequenceId,
      numberInvoice: data["orderNumber"],
    };

    electronicOrderStore.saveOrderNumber(reqBody, saveOrderNumCallback);
    electronicOrderStore.createPayment(
      {
        orderNum: orderNum,
        currencyId: checkedCurrencyWatch,
        sum: toPayWatch,
        cashierId: cashierWatch,
      },
      createPaymentCallBack
    );
  };

  const handleModalClose = () => {
    if (isDirty) {
      const confirmed = window.confirm("Ваши изменения будут удалены. Вы уверены, что хотите закрыть модальное окно?");
      if (confirmed) {
        resetForm();
        setOpen(false);
        clearClipboard();
        setSubmitButtonDisabled(true);
        setGetOrderNumButtonDisabled(true);
      }
    } else {
      resetForm();
      setOpen(false);
      setSubmitButtonDisabled(true);
      setGetOrderNumButtonDisabled(true);
    }
  };

  const shiftsCallback = (data: Response<ShiftType>) => {
    if (data.status === 0) {
      setShifts(data.data);
    } else {
      enqueueSnackbar(`Что то пошло не так`, { variant: "error" });
    }
  };

  const airCompaniesCallback = (data: Response<AirlineCompanyType>) => {
    if (data.status === 0) {
      setAirlineCompanies(data.data);
    } else {
      enqueueSnackbar(`Что то пошло не так`, { variant: "error" });
    }
  };

  const getOrderNumberCallback = (data: OrderNumResponseType) => {
    // setSubmitButtonDisabled(false);
    setGetOrderNumButtonDisabled(true);
    copyToClipboard(`${data.numberInvoice}`);
    setValue("orderNumber", `${data.numberInvoice}`);
    setElectronicSequenceId(data.electronicSequenceId);
  };

  const resetForm = () => {
    reset({
      shiftId: 0,
      airlineCompanyId: 0,
      orderNumber: "",
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const clearClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText === orderNum) {
        await navigator.clipboard.writeText("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getOrderNumber = () => {
    const reqBody = {
      airlineId: airlineCompanyWatch,
      shiftId: shiftWatch,
    };

    electronicOrderStore.fetchOrderNum(reqBody, getOrderNumberCallback);
  };

  useEffect(() => {
    electronicOrderStore.fetchShifts(shiftsCallback);
    electronicOrderStore.fetchAirlineCompanies(airCompaniesCallback);
    electronicOrderStore.getCurrency(getCurrencyCallBack);
  }, []);

  useEffect(() => {
    const userId = currentUserId?.id ?? null;

    if (!!userId) {
      userStore.fetchUser(userId, getCurrentUserCallBack);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (toPayWatch !== 0 && checkedCurrencyWatch !== 0 && cashierWatch !== 0 && orderNum !== "") {
      setSubmitButtonDisabled(false);
    } else {
      setSubmitButtonDisabled(true);
    }
  }, [toPayWatch, checkedCurrencyWatch, cashierWatch, orderNum]);

  return (
    <div>
      <Button variant="outlined" color="primary" size="small" sx={{ p: 0.4 }} onClick={() => setOpen(true)}>
        <Blink blink={blinkTheButton.toString()}>
          <Avatar src={formOrderIcon} sx={{ width: 20, height: 20 }} />
        </Blink>
      </Button>
      <Modal
        open={open}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalScreenStyle}>
          <Box sx={{ p: 2 }}>
            <Typography id="modal-modal-title" variant="h4" component="h2" sx={{ textAlign: "center" }}>
              Форма заказа
            </Typography>
            <form id="electronicOrderForm" onSubmit={handleFormSubmit}>
              <Box sx={{ marginBottom: 2 }}>
                <Controller
                  name="shiftId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Выберите смену"
                      variant="standard"
                      onChange={(e) => {
                        field.onChange(e);
                        if (!!e.target.value && !!airlineCompanyWatch) {
                          setGetOrderNumButtonDisabled(false);
                        } else {
                          clearClipboard();
                          setGetOrderNumButtonDisabled(true);
                        }
                        setSubmitButtonDisabled(true);
                      }}
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          borderBottom: "1px solid #eaeafe",
                        },
                      }}
                    >
                      {shifts.map((shift: ShiftType) => (
                        <MenuItem key={shift.order_seq} value={shift.value}>
                          {shift.title_ru}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Box>
              <Box sx={{ marginBottom: 2 }}>
                <Controller
                  name="airlineCompanyId"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={airlineCompanies ?? []}
                      getOptionLabel={(option: AirlineCompanyType) => `${option.code} ${option.name}`}
                      noOptionsText="Нет данных"
                      onChange={(e, v) => {
                        field.onChange(v?.id ?? null);
                        if (!!v?.id) {
                          setGetOrderNumButtonDisabled(false);
                        } else {
                          setGetOrderNumButtonDisabled(true);
                        }
                        setSubmitButtonDisabled(true);
                      }}
                      value={airlineCompanies?.find((item: any) => item?.id === field.value) ?? null}
                      renderOption={(props, option) => {
                        return (
                          <MenuItem {...props} key={option.id}>
                            {option.code} {option.name}
                          </MenuItem>
                        );
                      }}
                      renderInput={(params) => {
                        return <TextField {...params} variant="standard" label="Выберите авиакомпанию" />;
                      }}
                    />
                  )}
                />
              </Box>
              <Box sx={{ marginBottom: 2 }}>
                <Controller
                  name="orderNumber"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label="Ваш номер заказа"
                      variant="standard"
                      disabled={true}
                      required
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          borderBottom: "1px solid #eaeafe",
                        },
                      }}
                    />
                  )}
                />
              </Box>

              {orderNum !== "" && (
                <Box>
                  <Stack direction="row">
                    <Controller
                      name="toPay"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="К оплате"
                          type="number"
                          variant="standard"
                          required
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                          InputProps={{
                            disableUnderline: true,
                            sx: {
                              borderBottom: "1px solid #eaeafe",
                            },
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="checkedCurrency"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          label="Валюта"
                          variant="standard"
                          onChange={(e) => {
                            field.onChange(e);

                            setSubmitButtonDisabled(true);
                          }}
                          InputProps={{
                            disableUnderline: true,
                            sx: {
                              borderBottom: "1px solid #eaeafe",
                            },
                          }}
                        >
                          {currency.map((currencyElem: CurrencyType) => (
                            <MenuItem key={currencyElem.id} value={currencyElem.id}>
                              {currencyElem["code"]}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Stack>
                </Box>
              )}

              {orderNum !== "" && (
                <Box sx={{ marginBottom: 2 }}>
                  <Controller
                    name="cashier"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        options={cashiers ?? []}
                        getOptionLabel={(option: CashierType) => `${option.code} ${option.name}`}
                        noOptionsText="Нет данных"
                        onChange={(e, v) => {
                          field.onChange(v?.id ?? null);

                          if (toPayWatch !== 0 && checkedCurrencyWatch !== 0 && cashierWatch !== 0) {
                            setSubmitButtonDisabled(false);
                          } else {
                            setSubmitButtonDisabled(true);
                          }
                        }}
                        value={cashiers?.find((item: any) => item?.id === field.value) ?? null}
                        renderOption={(props, option) => {
                          return (
                            <MenuItem {...props} key={option.id}>
                              {option.code} {option.name}
                            </MenuItem>
                          );
                        }}
                        renderInput={(params) => {
                          return <TextField {...params} variant="standard" label="Выберите кассира" />;
                        }}
                      />
                    )}
                  />
                </Box>
              )}

              <Box mt={3} sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3 }}>
                <Button
                  fullWidth
                  type="button"
                  color="primary"
                  variant="contained"
                  onClick={getOrderNumber}
                  disabled={getOrderNumButtonDisabled}
                  sx={{ width: { xs: 1, sm: 2 / 3, md: 3 / 4 } }}
                >
                  Получить и скопировать номер заказа
                </Button>
                <Button
                  fullWidth
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={submitButtonDisabled}
                  sx={{ ml: { sm: 3 }, width: { xs: 1, sm: 1 / 3, md: 1 / 4 } }}
                >
                  Отправить
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default ElectronicOrderForm;
