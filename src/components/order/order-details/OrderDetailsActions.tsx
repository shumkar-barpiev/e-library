"use client";

import {
  Box,
  Menu,
  Stack,
  Alert,
  Dialog,
  Button,
  Tooltip,
  MenuItem,
  TextField,
  Typography,
  ButtonGroup,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  Autocomplete,
  DialogContent,
  DialogActions,
  InputAdornment,
  DialogContentText,
  Modal,
  Divider,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import ListIcon from "@mui/icons-material/List";
import SaveIcon from "@mui/icons-material/Save";
import TreeMenu from "@/components/other/TreeMenu";
import SearchIcon from "@mui/icons-material/Search";
import { TOrderModel } from "@/models/orders/order";
import { useUserStore } from "@/stores/users/users";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { useForm, Controller } from "react-hook-form";
import { useOrderStore } from "@/stores/orders/orders";
import { useEffect, useState, useContext } from "react";
import { useAxelorStore } from "@/stores/axelor/axelor";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useAppealsStore } from "@/stores/appeals/appeals";
import { TServiceModel } from "@/models/dictionaries/service";
import { useSettingsStore } from "@/stores/dictionaries/settings";
import { useServicesStore } from "@/stores/dictionaries/services";
import { useOrderDetailsStore } from "@/stores/orders/order-details";
import { CashierType } from "@/models/electronic-order/electronic-order";
import { useOrderSuggestionStore } from "@/stores/orders/order-suggestion";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ElectronicOrderForm from "../electronic-order-form/ElectronicOrderForm";
import { ModalStyle } from "@/components/account/personal-area/profile/Profile";
import OrderDetailsRemark from "@/components/order/order-details/OrderDetailsRemark";
import { useElectronicOrderStore } from "@/stores/electronic-order/electronic-order";
import OrderDetailsInvoice from "@/components/order/order-details/OrderDetailsInvoice";
import { CurrentUserContext } from "@/components/account/personal-area/current-user/CurrentUserProvider";

export enum EOrderDetailsFilters {
  search = "search",
}

export default function OrderDetailsActions({
  activeTab,
  totalOrderDetails,
  totalAllOrderDetails,
  setActiveTab,
  onFilter,
}: {
  activeTab: string;
  totalOrderDetails?: number | null;
  totalAllOrderDetails?: number | null;
  setActiveTab: (activeTab: string) => void;
  onFilter?: (type: EOrderDetailsFilters, value?: string | number) => void;
}) {
  const axelorStore = useAxelorStore();
  const userStore = useUserStore((state) => state);
  const suggestionStore = useOrderSuggestionStore();
  const orderStore = useOrderStore((state) => state);
  const appealStore = useAppealsStore((state) => state);
  const electronicOrderStore = useElectronicOrderStore();
  const serviceStore = useServicesStore((state) => state);
  const currentUserContext = useContext(CurrentUserContext);
  const settings = useSettingsStore((state) => state.getItems());
  const orderDetailsStore = useOrderDetailsStore((state) => state);

  const [tabsEl, setTabsEl] = useState<null | HTMLElement>(null);
  const [cashiersList, setCashiersList] = useState<CashierType[]>([]);
  const [actionsEl, setActionsEl] = useState<null | HTMLElement>(null);
  const [services, setServices] = useState<null | TServiceModel[]>(null);
  const [loadingActions, setLoadingActions] = useState<{ [key: string]: boolean }>({});
  const [invoiceNumberObj, setInvoiceNumberObj] = useState<Record<string, any> | null>();
  const [saveInvoiceConfirmationOpen, setSaveInvoiceConfirmationOpen] = useState(false);
  const [disabledSaveOrderButton, setDisabledSaveOrderButton] = useState<boolean>(true);

  const {
    watch,
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm({
    defaultValues: {
      cashierId: null,
    },
  });

  const [orderId, setOrderId] = useState<TOrderModel["id"]>();

  const handleFilter = (type: EOrderDetailsFilters, value?: string | number) => {
    if (onFilter != null) onFilter(type, value);
  };

  const handleAction = async (id?: number) => {
    if (!id) {
      enqueueSnackbar("Услуга не выбрана!", { variant: "error" });
      return;
    }

    setActionsEl(null);
    setLoadingActions((prev) => ({ ...prev, [id!]: true }));

    suggestionStore.fetchItems(id!);

    let order = orderId;

    if (!orderStore.item && appealStore.item) {
      if (Object.values(loadingActions).some((item) => item)) {
        enqueueSnackbar("Пожалуйста, подождите", { variant: "warning" });
        setLoadingActions((prev) => ({ ...prev, [id!]: false }));
        return;
      }

      const appeal = appealStore.item;
      let client = appealStore.item?.client;

      if (!client) {
        const createdUser = await userStore.createItem({
          firstName: appeal?.firstName,
          mobilePhone: appeal?.phoneNumber,
          name: appeal?.name,
          email: appeal.importOrigin,
          dateOfBirth: appeal.processInstanceId,
          partnerTypeSelect: 2,
        });

        if (!createdUser) {
          enqueueSnackbar("Клиент не создан!", { variant: "error" });
          return;
        }

        client = createdUser;

        await appealStore.updateItem({
          ...appealStore.item,
          client: { id: client.id },
        });
      }

      const data = await orderStore.createItem({
        appeal: { id: appealStore.item.id! },
        clientPartner: { id: client.id },
        currency: axelorStore.config?.defaultCurrencySaleOrderLine,
      });

      order = data?.id;
      setOrderId(order);
    }

    if (!order) {
      enqueueSnackbar("Заказ не создан! Перед тем как создать заказ выберите или создайте новый клиент!", {
        variant: "error",
      });
      return;
    }

    orderDetailsStore
      .saveItem({
        productName: "new",
        saleOrder: { id: order },
        service: { id },
        listPriceCur: settings?.at(0)?.defaultCurrencySaleOrderLine,
        status: settings?.at(0)?.defaultStatusSaleOrderLine,
      })
      .catch((e) => {
        enqueueSnackbar(e?.message, { variant: "error" });
      })
      .finally(() => {
        setLoadingActions((prev) => ({ ...prev, [id!]: false }));
      });
  };

  const onSubmit = (data: Record<string, any>) => {
    if (isDirty && invoiceNumberObj && orderStore.item?.id) {
      const reqBody = {
        ...invoiceNumberObj,
        saleOrderId: orderStore.item?.id,
      };

      orderStore.updateSaleOrderSeq(reqBody).then((resp: Record<string, any> | null) => {
        if (resp?.codeStatus === 200) {
          setDisabledSaveOrderButton(true);
          handleSaveInvoiceConfirmationClose();

          const paymentReqBody = {
            saleOrderId: orderStore.item?.id,
            cashierId: data.cashierId,
          };

          orderStore.createPayment(paymentReqBody, (data: Record<string, any>) => {
            if (data.codeStatus === 200) {
              enqueueSnackbar("Заказ успешно сохранен!", { variant: "success" });
            } else {
              console.log("Payment hasn't been created!");
            }
          });
        }
      });
    }
  };

  useEffect(() => {
    if (currentUserContext?.currentUser) {
      electronicOrderStore.getCashier(currentUserContext?.currentUser, (data: Record<string, any>) => {
        if (data.status === 0) {
          setCashiersList(data.data);
        } else {
          console.log("Cashiers haven't been loaded!");
        }
      });
    }
  }, [currentUserContext?.currentUser]);

  useEffect(() => {
    if (orderDetailsStore.items != undefined && orderDetailsStore.items?.length > 0 && orderStore.item?.id) {
      if (orderStore.item?.saleOrderSeq) setDisabledSaveOrderButton(true);
      else setDisabledSaveOrderButton(false);
      if (!invoiceNumberObj) {
        orderStore.fetchInvoiceNumber(orderStore.item?.id).then((resp: Record<string, any> | null) => {
          if (!!resp) setInvoiceNumberObj(resp);
        });
      }
    }
  }, [orderDetailsStore.items]);

  const handleSaveInvoiceNumberClick = () => {
    setSaveInvoiceConfirmationOpen(true);
  };

  const handleSaveInvoiceConfirmationClose = () => {
    setSaveInvoiceConfirmationOpen(false);
  };

  const SaveSaleOrderSeqComponent = () => {
    return (
      <>
        <Tooltip title={disabledSaveOrderButton ? "Ваш заказ уже сохранен." : ""}>
          <Typography>
            <Button
              size="small"
              color="primary"
              sx={{ p: 0.4 }}
              variant="outlined"
              onClick={handleSaveInvoiceNumberClick}
              disabled={disabledSaveOrderButton}
            >
              <SaveIcon />
            </Button>
          </Typography>
        </Tooltip>

        <Modal
          open={saveInvoiceConfirmationOpen}
          onClose={handleSaveInvoiceConfirmationClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={{ ...ModalStyle, width: 400, position: "relative" }}>
            <Box id="modal-modal-description">
              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{ display: "flex", flexDirection: "column", maxWidth: 400, margin: "auto" }}
              >
                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mb: 1 }}>
                  Сохранить заказ
                </Typography>
                <Divider />

                <Box sx={{ mt: 1, mb: 2 }}>
                  <Controller
                    name="cashierId"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        size="small"
                        options={cashiersList}
                        disabled={cashiersList?.length === 0}
                        getOptionLabel={(option: any) => option?.name ?? ""}
                        noOptionsText="Нет данных"
                        onChange={(e, value) => field.onChange(value?.id ?? 0)}
                        value={cashiersList.find((item: any) => item.id === field.value) ?? null}
                        renderOption={(props, option) => (
                          <li {...props} key={option.id}>
                            {option.name}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            required={true}
                            variant="standard"
                            label="Выберите кассира"
                            sx={{ minWidth: 170 }}
                          />
                        )}
                      />
                    )}
                  />
                </Box>

                <Alert severity="warning">После этого действие вы не сможете вынести изменение в заказ.</Alert>
                <Box sx={{ display: "flex", alignItems: "center", gap: 3, mt: 1 }}>
                  <Button color="secondary" onClick={handleSaveInvoiceConfirmationClose}>
                    Отмена
                  </Button>
                  <Button type="submit" color="success">
                    Сохранить
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Modal>
      </>
    );
  };

  useEffect(() => {
    if (orderId || (orderId && orderDetailsStore.dirty)) {
      orderStore.fetchSum(orderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, orderDetailsStore.dirty]);

  useEffect(() => {
    if (orderId) return;
    setOrderId(orderStore?.item?.id);
  }, [orderStore?.item]);

  useEffect(() => {
    setServices(serviceStore.getItems({ pageSize: 0, sortBy: ["id"] }));
  }, [serviceStore]);

  return (
    <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center" justifyContent="space-between" width="100%">
      <ButtonGroup variant="outlined" color="secondary" size="small">
        <Button
          startIcon={<ListIcon />}
          variant={activeTab === "orderDetails" ? "contained" : "outlined"}
          color={activeTab === "orderDetails" ? "primary" : "secondary"}
          onClick={() => setActiveTab("orderDetails")}
        >
          Заказы ({totalOrderDetails ?? 0})
        </Button>
        <Button
          startIcon={<ListAltIcon />}
          variant={activeTab === "allOrderDetails" ? "contained" : "outlined"}
          color={activeTab === "allOrderDetails" ? "primary" : "secondary"}
          onClick={() => setActiveTab("allOrderDetails")}
        >
          Все заказы ({totalAllOrderDetails ?? 0})
        </Button>

        <Menu
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          anchorEl={tabsEl}
          open={Boolean(tabsEl)}
          onClose={() => setTabsEl(null)}
        >
          <MenuItem>
            <ListItemIcon>
              <AssignmentOutlinedIcon />
            </ListItemIcon>
            <ListItemText>Документ</ListItemText>
          </MenuItem>
        </Menu>
        <Button
          endIcon={<MoreHorizIcon />}
          sx={{ "& .MuiButton-endIcon": { m: 0 } }}
          onClick={(e) => setTabsEl(e.currentTarget)}
        ></Button>
      </ButtonGroup>
      {activeTab !== "allOrderDetails" && (
        <>
          {!orderStore.item?.saleOrderSeq && (
            <ButtonGroup variant="outlined" color="secondary" size="small">
              <TreeMenu buttonText="Добавить услугу" items={services} onSelect={(id) => handleAction(id)} />
            </ButtonGroup>
          )}

          <TextField
            variant="outlined"
            placeholder="Поиск"
            size="small"
            onChange={(e) => handleFilter(EOrderDetailsFilters.search, e.target.value)}
            InputProps={{
              sx: { pl: 1, ".MuiInputBase-input": { py: 0.5 } },
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 200 }}
          />

          <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
            <SaveSaleOrderSeqComponent />
            <ElectronicOrderForm props={null} />
            <OrderDetailsRemark />
            <OrderDetailsInvoice />
            <Typography variant="h6">{orderStore.sum ?? 0} Сом</Typography>
          </Stack>
        </>
      )}
    </Stack>
  );
}
