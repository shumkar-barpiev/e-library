import { useEffect, useState } from "react";
import { TOrderModel } from "@/models/orders/order";
import { TServiceModel } from "@/models/dictionaries/service";
import { OrderDetailModel, TOrderDetailModel } from "@/models/orders/order-detail";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSettingsStore } from "@/stores/dictionaries/settings";
import { useCurrenciesStore } from "@/stores/dictionaries/currencies";
import { useServicesStore } from "@/stores/dictionaries/services";
import { useServiceStatusesStore } from "@/stores/dictionaries/service-statuses";
import { useOrderDetailsStore } from "@/stores/orders/order-details";
import { useProductsStore } from "@/stores/products/products";
import { Autocomplete, TableRow, Typography, Stack, Box } from "@mui/material";
import ProductsSelector from "@/components/product/ProductsSelector";
import { StyledTextField } from "@/components/other/StyledTextField";
import { StyledTableCell } from "@/components/other/StyledTableCell";
import { AutocompletePopperProps } from "@/components/other/AutocompletePopperProps";
import { useAxelorStore } from "@/stores/axelor/axelor";
import { useOrderStore } from "@/stores/orders/orders";
import OrderDetailsTableRowActions from "@/components/order/order-details/OrderDetailsTableRowActions";

export default function DashboardDetailsTableRowForAir({
  initialOrderId,
  serviceId,
  productId,
  item,
  isLoading = false,
}: {
  initialOrderId: TOrderModel["id"];
  serviceId: number;
  productId?: number;
  item?: TOrderDetailModel | null;
  isLoading?: boolean;
}) {
  let [orderId, setOrderId] = useState<TOrderModel["id"]>(initialOrderId);
  const { control, formState, watch, setValue } = useForm<TOrderDetailModel>({
    mode: "onBlur",
    defaultValues: {
      id: item?.id,
      saleOrder: { id: orderId },
      description: item?.description ?? "",
      productName: item != null ? (item as any)["product.tNumber"] : "",
      product: {
        id: item?.product?.id ?? productId ?? 0,
        name: item != null ? (item as any)["product.name"] ?? "" : "",
        pSurname: item != null ? (item as any)["product.pSurname"] ?? "" : "",
        service: { id: serviceId },
      },
      listPriceCur: item?.listPriceCur ?? null,
      listPrice: Number(item?.unitPrice) * Number(item?.qty) || 0,
      unitPrice: Number(item?.unitPrice) || 0,
      qty: item?.qty != null ? Math.ceil(item.qty) : 0,
      status: item?.status ?? null,
    },
    resolver: zodResolver(OrderDetailModel),
  });

  const formProductId = watch("product.id");
  const productName = watch("product.name");
  const productPSurname = watch("product.pSurname");
  const orderDetailId = watch("id");
  const orderDetailListPriceCur = watch("listPriceCur");
  const orderDetailDescription = watch("description");
  const orderDetailListPrice = watch("listPrice");
  const orderDetailUnitPrice = watch("unitPrice");
  const orderDetailQty = watch("qty");
  const orderDetailStatus = watch("status");

  const [productInputValue, setProductInputValue] = useState("");
  const [subServices, setSubServices] = useState<TServiceModel[]>([]);

  const settings = useSettingsStore((state) => state.getItems());
  const services = useServicesStore((state) => state);
  const serviceStatuses = useServiceStatusesStore((state) => state.getItems({ translate: true }));
  const currencies = useCurrenciesStore((state) =>
    state.getItems({
      criteria: [{ fieldName: "isBase", operator: "=", value: true }],
    })
  );
  const orderStore = useOrderStore((state) => state);
  const orderDetailsStore = useOrderDetailsStore((state) => state);
  const productsStore = useProductsStore((state) => state);
  const axelorStore = useAxelorStore();

  const handleFindProduct = (id?: number) => {
    productsStore.clearStore();

    if (id != null) {
      productsStore.getItems({
        criteria: [
          {
            operator: "and",
            criteria: [
              { fieldName: "id", operator: "=", value: id },
              {
                fieldName: "service.id",
                operator: "=",
                value: serviceId ?? 0,
              },
            ],
          },
        ],
      });
    }
  };

  const handleSaveOrderDetail = async () => {
    const df = formState.dirtyFields;

    if (
      df.product?.id ||
      df.product?.name ||
      df.product?.pSurname ||
      df.listPriceCur ||
      df.description ||
      df.listPrice ||
      df.unitPrice ||
      df.qty ||
      df.status
    ) {
      // if (!orderId && appealStore.item) {
      //   const user = await userStore.createItem();
      //
      //   if (!user) {
      //     enqueueSnackbar("Что то пошло не так", { variant: "error" });
      //     return;
      //   }
      //
      //   await appealStore.updateItem({
      //     ...appealStore.item,
      //     client: { id: user.id },
      //   });
      //
      //   const data = await orderStore.createItem({
      //     appeal: { id: appealStore.item.id! },
      //     clientPartner: { id: user.id },
      //   });
      //
      //   if (data) {
      //     orderId = data.id;
      //     setOrderId(data.id);
      //   }
      // }
      //
      // if (!orderId) {
      //   return;
      // }

      orderDetailsStore.saveItem({
        id: orderDetailId,
        saleOrder: { id: orderId },
        description: orderDetailDescription,
        productName: `${formProductId}`,
        product: {
          id: formProductId,
          name: productName,
          pSurname: productPSurname,
          service: { id: serviceId },
        },
        listPriceCur: orderDetailListPriceCur,
        listPrice: orderDetailListPrice,
        unitPrice: orderDetailUnitPrice,
        qty: orderDetailQty,
        status: orderDetailStatus,
      });
    }
  };

  const handleProductChange = (
    product: TOrderDetailModel["product"],
    field: ControllerRenderProps<TOrderDetailModel, "product.id">
  ) => {
    setValue("product.name", product.name);
    setValue("product.pSurname", product.pSurname);
    setValue("product.tNumber", product.tNumber);
    setValue("product.resNumber", product.resNumber);
    setValue("product.route", product.route);
    setValue("listPriceCur", product.unitPriceCur);
    setValue("listPrice", (product.unitPrice ?? 1) * 1);
    setValue("unitPrice", product.unitPrice);
    setValue("qty", 1);
    field.onChange(product?.id ?? null);
  };

  const handleSelectedProducts = (items: Record<string, number>[]) => {
    items.map((item) => {
      const id = item?.id;

      orderDetailsStore.saveItem({
        productName: `${id}`,
        saleOrder: { id: orderId },
        product: { id, service: { id: serviceId } },
        listPriceCur: settings?.at(0)?.defaultCurrencySaleOrderLine,
        status: settings?.at(0)?.defaultStatusSaleOrderLine,
      });
    });
  };

  useEffect(() => {
    if (productInputValue) {
      productsStore.getItems({
        criteria: [
          {
            operator: "and",
            criteria: [
              { fieldName: "tNumber", operator: "=", value: productInputValue },
              {
                fieldName: "service.id",
                operator: "=",
                value: serviceId,
              },
            ],
          },
        ],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productInputValue]);

  useEffect(() => {
    if (!orderStore.item) {
      return;
    }

    setOrderId(orderStore.item.id);

    return () => {
      orderStore.clearStore();
    };
  }, []);

  useEffect(() => {
    services.fetchItems({ criteria: [{ fieldName: "parent.id", operator: "=", value: serviceId }] }, (data) => {
      setSubServices(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  return (
    <TableRow key={item?.id}>
      <StyledTableCell sx={{ width: 120 }}>
        <Stack direction="row" alignItems="center">
          <Controller
            name="product.id"
            control={control}
            disabled
            render={({ field }) => (
              <Autocomplete
                size="small"
                options={productsStore.items ?? []}
                filterOptions={(options) => options}
                getOptionLabel={(option) =>
                  option.tNumber ?? (item != null ? (item as any)["product.tNumber"] ?? "" : "")
                }
                isOptionEqualToValue={(option, value) => option.id === value}
                noOptionsText="Нет данных"
                loadingText="Загрузка..."
                loading={productsStore.loading}
                disabled
                onInputChange={(e, value) => setProductInputValue(value)}
                onChange={(e, v) => handleProductChange(v, field)}
                onBlur={() => {
                  field.onBlur();
                  handleSaveOrderDetail();
                }}
                value={field.value as any}
                onOpen={() => handleFindProduct(field.value)}
                renderInput={(params) => <StyledTextField {...params} variant="standard" placeholder="Авиа" />}
                componentsProps={AutocompletePopperProps}
              />
            )}
          />
          <ProductsSelector serviceId={serviceId} isLoading={isLoading} onSubmit={handleSelectedProducts} />
        </Stack>
      </StyledTableCell>
      <StyledTableCell sx={{ width: 150 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Controller
            name="product.name"
            control={control}
            disabled
            render={({ field }) => (
              <StyledTextField
                {...field}
                variant="standard"
                size="small"
                placeholder="Имя"
                onBlur={() => {
                  field.onBlur();
                  handleSaveOrderDetail();
                }}
              />
            )}
          />
          <Controller
            name="product.pSurname"
            control={control}
            disabled
            render={({ field }) => (
              <StyledTextField
                {...field}
                variant="standard"
                size="small"
                placeholder="Фамилия"
                onBlur={() => {
                  field.onBlur();
                  handleSaveOrderDetail();
                }}
              />
            )}
          />
        </Stack>
      </StyledTableCell>
      <StyledTableCell>
        <Stack direction="row" alignItems="center" gap={1}>
          <Box display={"flex"} gap={1}>
            <Typography variant={"caption"}>Бронь: </Typography>
            <Typography variant={"caption"} fontWeight={"bold"}>
              {(item as any)?.["reservation"] ?? "-"}
            </Typography>
          </Box>
          <Box display={"flex"} gap={1}>
            <Typography variant={"caption"}>Маршрут: </Typography>
            <Typography variant={"caption"} fontWeight={"bold"}>
              {(item as any)?.["preOrderFromTo"] ?? "-"}
            </Typography>
          </Box>
        </Stack>
        <Controller
          name="description"
          control={control}
          disabled
          render={({ field }) => (
            <StyledTextField
              {...field}
              variant="standard"
              size="small"
              multiline
              placeholder="Описание"
              onBlur={() => {
                field.onBlur();
                handleSaveOrderDetail();
              }}
              sx={{ width: "100%" }}
            />
          )}
        />
      </StyledTableCell>

      {/*<OrderDetailsFileCell filters={filter} item={item} isLoading={isLoading} />*/}

      <StyledTableCell sx={{ width: 80 }}>
        <Controller
          name="listPriceCur"
          control={control}
          disabled
          render={({ field }) => (
            <Autocomplete
              size="small"
              options={currencies ?? []}
              filterOptions={(options) => options}
              getOptionLabel={(option) => `${option?.["$t:name"]}`}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              noOptionsText="Нет данных"
              disabled
              onChange={(e, v) => field.onChange(v ?? null)}
              onBlur={() => {
                field.onBlur();
                handleSaveOrderDetail();
              }}
              value={field.value || axelorStore.config?.defaultCurrencySaleOrderLine}
              renderInput={(params) => <StyledTextField {...params} variant="standard" placeholder="Валюта" />}
              componentsProps={AutocompletePopperProps}
            />
          )}
        />
      </StyledTableCell>
      <StyledTableCell sx={{ width: 75 }}>
        <Controller
          name="unitPrice"
          control={control}
          disabled
          render={({ field }) => (
            <StyledTextField
              {...field}
              variant="standard"
              size="small"
              type="number"
              onChange={(e) => {
                field.onChange(e);
                const value = Number(e.target.value);
                if (value != null && orderDetailQty != null) {
                  setValue("listPrice", value * orderDetailQty);
                }
              }}
              onBlur={() => {
                field.onBlur();
                handleSaveOrderDetail();
              }}
            />
          )}
        />
      </StyledTableCell>
      <StyledTableCell sx={{ width: 75 }}>
        <Controller
          name="qty"
          control={control}
          disabled
          render={({ field }) => (
            <StyledTextField
              {...field}
              variant="standard"
              size="small"
              type="number"
              onChange={(e) => {
                field.onChange(e);
                const value = Number(e.target.value);
                if (value != null && orderDetailUnitPrice != null) {
                  setValue("listPrice", value * orderDetailUnitPrice);
                }
              }}
              onBlur={() => {
                field.onBlur();
                handleSaveOrderDetail();
              }}
            />
          )}
        />
      </StyledTableCell>
      <StyledTableCell sx={{ width: 75 }}>
        <Typography variant={"caption"} fontWeight={"bold"}>
          {orderDetailListPrice}
        </Typography>
      </StyledTableCell>
      <StyledTableCell sx={{ width: 100 }}>
        <Controller
          name="status"
          control={control}
          disabled
          render={({ field }) => (
            <Autocomplete
              size="small"
              options={serviceStatuses ?? []}
              getOptionLabel={(option) => `${option?.["title_kg"] || option?.["title_ru"] || option?.title}`}
              noOptionsText="Нет данных"
              disabled
              componentsProps={{
                paper: {
                  sx: {
                    ".MuiAutocomplete-option": {
                      display: "block !important",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    },
                  },
                },
              }}
              onChange={(e, v) => field.onChange(v?.value ?? null)}
              onBlur={() => {
                field.onBlur();
                handleSaveOrderDetail();
              }}
              value={serviceStatuses?.find((item) => item?.value === field.value) ?? null}
              renderInput={(params) => <StyledTextField {...params} variant="standard" placeholder="Статус" />}
            />
          )}
        />
      </StyledTableCell>
      <StyledTableCell align="center" sx={{ width: 40, minWidth: 40 }}>
        {item?.id && <OrderDetailsTableRowActions id={item.id} disabled />}
      </StyledTableCell>
    </TableRow>
  );
}
