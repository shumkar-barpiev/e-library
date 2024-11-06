import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import PushPinIcon from "@mui/icons-material/PushPin";
import { Typography, Box, Button, Popover, Container, MenuItem, TextField, Autocomplete } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useRemarkerStore } from "@/stores/remark/remark";
import {
  RequestBodyType,
  StatusType,
  FetchRemarkType,
  PaymentFormType,
  OperSalesType,
  RemarkType,
  Response,
} from "@/models/remark/remark";

const OrderDetailsRemark = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>();
  const open = Boolean(anchorEl);
  const id = open ? "order-details-invoice-popover" : undefined;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        aria-describedby={id}
        variant="outlined"
        color="primary"
        size="small"
        sx={{ p: 0.4 }}
        onClick={handleClick}
      >
        <PushPinIcon />
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{ marginTop: "10px" }}
      >
        <PopoverContent closePopOver={handleClose} />
      </Popover>
    </>
  );
};

const PopoverContent = ({ closePopOver }: { closePopOver: () => void }) => {
  const remarksStore = useRemarkerStore();
  const [operSales, setOperSales] = useState<OperSalesType[]>([]);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [paymentForms, setPaymentForms] = useState<PaymentFormType[]>([]);
  const [airfileStatuses, setAirfileStatuses] = useState<StatusType[]>([]);

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    watch,
  } = useForm<RemarkType>({
    defaultValues: {
      numPnr: "",
      operId: 0,
      salesId: 0,
      status: "",
      formOfPayment: "",
      remOsh: "",
      remark: "",
    },
  });

  const numPnr = watch("numPnr");
  const oper = watch("operId");
  const sales = watch("salesId");
  const status = watch("status");
  const formOfPayment = watch("formOfPayment");
  const remark = watch("remark");

  const requestBody: RequestBodyType = {
    data: {
      numPnr: numPnr,
      operId: Number(oper),
      salesId: Number(sales),
      formOfPayment: formOfPayment,
      status: status,
      remark: remark,
      type: 1,
    },
  };

  const onSubmit = (data: RemarkType) => {
    if (!!numPnr && !!oper && !!sales && !!formOfPayment && !!remark) {
      delete data.remOsh;

      const updatedRequestBody: RequestBodyType = {
        data: {
          ...data,
          type: 2,
        },
      };

      remarksStore.fetchRemark(updatedRequestBody, (data: Response<FetchRemarkType>) => {
        if (data.status === 0) {
          enqueueSnackbar("Ремарка успешно обнавлена", { variant: "success" });
          closePopOver();
        } else {
          enqueueSnackbar("Что то пошло не так", { variant: "error" });
        }
      });
    }
  };

  const remarkOneCallback = (data: Response<FetchRemarkType>) => {
    if (data.status === 0) {
      setIsDisabled(false);
      if (data.data && typeof data.data === "object" && "remark" in data.data) {
        setValue("remark", `${data.data["remark"]}`);
      }
    } else {
      enqueueSnackbar("Что то пошло не так", { variant: "error" });
    }
  };

  const statusAirfileCallback = (data: Response<StatusType>) => {
    if (data.status === 0) {
      setAirfileStatuses(data.data);
    } else {
      enqueueSnackbar("Что то пошло не так", { variant: "error" });
    }
  };

  const paymentFormCallback = (data: Response<PaymentFormType>) => {
    if (data.status === 0) {
      setPaymentForms(data.data);
    } else {
      enqueueSnackbar("Что то пошло не так", { variant: "error" });
    }
  };

  const operSalesCallback = (data: Response<OperSalesType>) => {
    if (data.status === 0) {
      setOperSales(data.data);
    } else {
      enqueueSnackbar("Что то пошло не так", { variant: "error" });
    }
  };

  const handlePNRFieldBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (numPnr.trim() !== "") {
      const updatedRequestBody: RequestBodyType = {
        data: {
          ...requestBody.data,
          numPnr: event.target.value,
        },
      };
      remarksStore.fetchRemark(updatedRequestBody, remarkOneCallback);
    }
  };

  const handleFieldsOnchange = (reqBody: RequestBodyType) => {
    remarksStore.fetchRemark(reqBody, remarkOneCallback);
  };

  useEffect(() => {
    remarksStore.fetchStatusAirfile(statusAirfileCallback);
    remarksStore.fetchFormOfPayment(paymentFormCallback);
    remarksStore.fetchOperSales(operSalesCallback);
  }, []);

  return (
    <>
      <Container
        sx={{
          marginTop: "10px",
          minWidth: {
            xs: "100%",
            md: "400px",
          },
          maxHeight: "40vh",
          overflow: "auto",
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h5">Ремарка</Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ marginBottom: 2 }}>
              <Controller
                name="numPnr"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Номер PNR"
                    variant="standard"
                    onBlur={handlePNRFieldBlur}
                    required
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        borderBottom: field.value ? "1px solid #eaeafe" : "1px solid #dd514c",
                      },
                    }}
                    error={!!errors.numPnr}
                    helperText={errors.numPnr ? "Это поле обязательно к заполнению" : ""}
                  />
                )}
              />
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <Controller
                name="operId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={operSales ?? []}
                    disabled={isDisabled}
                    getOptionLabel={(option: OperSalesType) => `${option?.fullName}`}
                    noOptionsText="Нет данных"
                    onChange={(e, v) => {
                      field.onChange(v?.id ?? null);
                      const updatedRequestBody: RequestBodyType = {
                        data: {
                          ...requestBody.data,
                          operId: v?.id || 0,
                        },
                      };
                      handleFieldsOnchange(updatedRequestBody);
                    }}
                    value={operSales?.find((item: any) => item?.id === field.value) ?? null}
                    renderOption={(props, option) => {
                      return (
                        <li {...props} key={option.id}>
                          {option.fullName}
                        </li>
                      );
                    }}
                    renderInput={(params) => {
                      return <TextField {...params} variant="standard" label="Oper" />;
                    }}
                  />
                )}
              />
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <Controller
                name="salesId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={operSales ?? []}
                    disabled={isDisabled}
                    getOptionLabel={(option: OperSalesType) => `${option?.fullName}`}
                    noOptionsText="Нет данных"
                    onChange={(e, v) => {
                      field.onChange(v?.id ?? null);
                      const updatedRequestBody: RequestBodyType = {
                        data: {
                          ...requestBody.data,
                          salesId: v?.id || 0,
                        },
                      };
                      handleFieldsOnchange(updatedRequestBody);
                    }}
                    value={operSales?.find((item: any) => item?.id === field.value) ?? null}
                    renderOption={(props, option) => {
                      return (
                        <li {...props} key={option.id}>
                          {option.fullName}
                        </li>
                      );
                    }}
                    renderInput={(params) => {
                      return <TextField {...params} variant="standard" label="Sales" />;
                    }}
                  />
                )}
              />
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <Controller
                name="status"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Статус"
                    variant="standard"
                    disabled={isDisabled}
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        borderBottom: "1px solid #eaeafe",
                      },
                    }}
                  >
                    {airfileStatuses.map((status: StatusType) => (
                      <MenuItem key={status.order_seq} value={status.value}>
                        {status.title}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <Controller
                name="formOfPayment"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    variant="standard"
                    disabled={isDisabled}
                    onChange={(e) => {
                      field.onChange(e);
                      const updatedRequestBody: RequestBodyType = {
                        data: {
                          ...requestBody.data,
                          formOfPayment: e.target.value,
                        },
                      };
                      handleFieldsOnchange(updatedRequestBody);
                    }}
                    label="Form of payment"
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        borderBottom: "1px solid #eaeafe",
                      },
                    }}
                  >
                    {paymentForms.map((payment: PaymentFormType) => (
                      <MenuItem key={payment.order_seq} value={payment.value}>
                        {payment.title}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <Controller
                name="remOsh"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Rem Osh"
                    variant="standard"
                    disabled={true}
                    placeholder="Osh/0/0/0/0/0/0/0/0/CSH/"
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
            <Box sx={{ marginBottom: 2 }}>
              <Controller
                name="remark"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Ремарка 1"
                    variant="standard"
                    disabled={isDisabled}
                    placeholder="CRM/0/0/0/0/0/0/0/0/0"
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
            <Box mt={3}>
              <Button fullWidth variant="contained" color="primary" type="submit">
                Обновлять
              </Button>
            </Box>
          </form>
        </Box>
      </Container>
    </>
  );
};

export default OrderDetailsRemark;
