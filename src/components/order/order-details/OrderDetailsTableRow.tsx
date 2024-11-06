"use client";

import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { TOrderModel } from "@/models/orders/order";
import { zodResolver } from "@hookform/resolvers/zod";
import { TProductModel } from "@/models/products/product";
import { useProductsStore } from "@/stores/products/products";
import { useServicesStore } from "@/stores/dictionaries/services";
import { useSettingsStore } from "@/stores/dictionaries/settings";
import ProductsSelector from "@/components/product/ProductsSelector";
import { StyledTableCell } from "@/components/other/StyledTableCell";
import { StyledTextField } from "@/components/other/StyledTextField";
import { useOrderDetailsStore } from "@/stores/orders/order-details";
import { useCurrenciesStore } from "@/stores/dictionaries/currencies";
import OrderDetailsTableRowActions from "./OrderDetailsTableRowActions";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import { useServiceStatusesStore } from "@/stores/dictionaries/service-statuses";
import { OrderDetailModel, TOrderDetailModel } from "@/models/orders/order-detail";
import { AutocompletePopperProps } from "@/components/other/AutocompletePopperProps";
import OrderDetailsFileCell from "@/components/order/order-details/OrderDetailsFileCell";
import { usePersonalAreaTicketsStore } from "@/stores/personal-area/tickets/user-tickets";
import { Autocomplete, TableRow, TextField, Stack, Button, Typography } from "@mui/material";

export default function OrderDetailsTableRow({
  orderId,
  serviceId,
  item,
  readOnly,
  isLoading = false,
}: {
  orderId: TOrderModel["id"];
  serviceId: number;
  item?: TOrderDetailModel | null;
  readOnly?: boolean;
  isLoading?: boolean;
}) {
  const { control, formState, getValues, watch, setValue } = useForm<TOrderDetailModel>({
    mode: "onBlur",
    defaultValues: {
      id: item?.id,
      saleOrder: { id: orderId },
      description: item?.description ?? "",
      productName: item != null ? (item as any)["product.tNumber"] : "",
      numberInvoice: item?.numberInvoice ?? "",
      product: {
        id: item?.product?.id ?? 0,
        name: item != null ? ((item as any)["product.name"] ?? "") : "",
        pSurname: item != null ? ((item as any)["product.pSurname"] ?? "") : "",
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

  const productId = watch("product.id");
  const productName = watch("product.name");
  const productService = watch("productName");
  const productPSurname = watch("product.pSurname");
  const orderDetailId = watch("id");
  const orderDetailListPriceCur = watch("listPriceCur");
  const orderDetailDescription = watch("description");
  const orderDetailListPrice = watch("listPrice");
  const orderDetailUnitPrice = watch("unitPrice");
  const orderDetailQty = watch("qty");
  const orderDetailStatus = watch("status");
  const numberInvoice = watch("numberInvoice");

  const userTicketStore = usePersonalAreaTicketsStore();
  const [productInputValue, setProductInputValue] = useState("");

  const settings = useSettingsStore((state) => state.getItems());
  const services = useServicesStore((state) => state.getItems({ pageSize: 0, sortBy: ["id"] }));
  const serviceStatuses = useServiceStatusesStore((state) => state.getItems({ translate: true }));
  const currencies = useCurrenciesStore((state) =>
    state.getItems({
      criteria: [{ fieldName: "isBase", operator: "=", value: true }],
    })
  );

  const orderDetailsStore = useOrderDetailsStore((state) => state);
  const productsStore = useProductsStore((state) => state);

  const checkNumericInput = (inputVal: string) => {
    const regex = /^\d*\.?\d*$/;
    return regex.test(inputVal);
  };

  const getServiceBreadcrumbs = (id: number) => {
    let result = "";

    if (services == null) return result;

    let parent: number | undefined = id;

    while (parent != null) {
      const found = services.find((f) => f?.id === parent);
      parent = found?.parent?.id;
      result = (parent != null ? " -> " : "") + (found?.["$t:name"] ?? found?.name ?? "") + result;
    }

    return result;
  };

  const handleSaveOrderDetail = async () => {
    const df = formState.dirtyFields;

    if (
      df.product?.id ||
      df.product?.name ||
      df.product?.pSurname ||
      df.listPriceCur ||
      df.description ||
      df.numberInvoice ||
      df.listPrice ||
      df.unitPrice ||
      df.qty ||
      df.status
    ) {
      await orderDetailsStore.saveItem({
        id: orderDetailId,
        saleOrder: { id: orderId },
        description: orderDetailDescription,
        productName: `${productId}`,
        numberInvoice: `${numberInvoice}`,
        ...(serviceId === settings?.at(0)?.serviceForProductSelector?.id && productId != 0
          ? {
              product: {
                id: productId,
                name: productName,
                pSurname: productPSurname,
              },
            }
          : {}),
        service: { id: serviceId },
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

  const handleSelectedProducts = async (items: TProductModel[]) => {
    const pnrNumbers = items.map((item) => item.pnrNumber);
    const allSame = pnrNumbers.every((pnr) => pnr === pnrNumbers[0]);

    try {
      const savePromises = items.map((item, i) => {
        const id = item?.id;
        const orderDetail: TOrderDetailModel = {
          productName: `${id}`,
          saleOrder: { id: orderId },
          product: { id },
          service: { id: serviceId },
          listPriceCur: item?.unitPriceCur,
          status: "notPaid",
          unitPrice: item?.unitPrice,
          listPrice: item?.unitPrice,
        };

        if (i === 0) orderDetail.id = orderDetailId;

        return orderDetailsStore.saveItem(orderDetail);
      });

      await Promise.all(savePromises);

      if (allSame && !!item?.numberInvoice) {
        const requestBody = {
          numberPNR: pnrNumbers[0],
          numberInvoice: item?.numberInvoice,
        };

        userTicketStore.updateTicket(requestBody, (data: Record<string, any>) => {
          if (!(data.codeStatus == 200)) {
            enqueueSnackbar("Номер заказа не удалось обновить!", { variant: "error" });
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
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

  readOnly = readOnly || serviceStatuses?.find((item) => item?.value === orderDetailStatus)?.value === "paid";
  const isAirService = services?.find((f) => f?.id === serviceId)?.type === "air.tickets";

  return (
    <TableRow key={item?.id}>
      <StyledTableCell sx={{ width: 200 }}>
        {serviceId === settings?.at(0)?.serviceForProductSelector?.id && (
          <Stack direction="row" alignItems="center">
            <Controller
              name="product.id"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  size="small"
                  options={productsStore.items ?? []}
                  filterOptions={(options) => options}
                  getOptionLabel={(option) =>
                    option.tNumber ?? (item != null ? ((item as any)["product.tNumber"] ?? "") : "")
                  }
                  isOptionEqualToValue={(option, value) => option.id === value}
                  noOptionsText="Нет данных"
                  loadingText="Загрузка..."
                  loading={productsStore.loading}
                  disabled={isLoading}
                  readOnly
                  onInputChange={(e, value) => setProductInputValue(value)}
                  onChange={(e, v) => handleProductChange(v, field)}
                  onBlur={() => {
                    field.onBlur();
                    handleSaveOrderDetail();
                  }}
                  value={field.value as any}
                  renderInput={(params) => <StyledTextField {...params} variant="standard" placeholder="Авиа" />}
                  sx={{ width: "100%" }}
                />
              )}
            />

            <ProductsSelector
              serviceId={serviceId}
              isLoading={isLoading}
              disabled={readOnly}
              onSubmit={handleSelectedProducts}
              hasSaleOrderLineNumberInvoice={!!item?.numberInvoice}
            />
          </Stack>
        )}

        {serviceId !== settings?.at(0)?.serviceForProductSelector?.id && (
          <Button color="secondary" disabled={isLoading} sx={{ minWidth: 50, textAlign: "left" }}>
            {getServiceBreadcrumbs(serviceId)}
          </Button>
        )}
      </StyledTableCell>

      <StyledTableCell sx={{ width: 150 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Controller
            name="product.name"
            control={control}
            disabled={isLoading || readOnly || isAirService}
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
            disabled={isLoading || readOnly || isAirService}
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
          {(item as any)?.["product.resNumber"] != null && (
            <Typography variant="body2">
              <b>Бронь:</b> {(item as any)["product.resNumber"]}
            </Typography>
          )}
          {(item as any)?.["product.route"] != null && (
            <Typography variant="body2">
              <b>Маршрут:</b> {(item as any)["product.route"]}
            </Typography>
          )}
        </Stack>

        <Controller
          name="description"
          control={control}
          disabled={isLoading || readOnly}
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

      <StyledTableCell sx={{ width: 120 }}>
        <Controller
          name="numberInvoice"
          control={control}
          disabled={isLoading || readOnly || [11, 12].includes(`${item?.numberInvoice}`.length)}
          render={({ field }) => (
            <StyledTextField
              {...field}
              variant="standard"
              size="small"
              multiline
              placeholder="Номер заказа"
              onBlur={() => {
                field.onBlur();
                handleSaveOrderDetail();
              }}
              sx={{ width: "100%" }}
            />
          )}
        />
      </StyledTableCell>

      <StyledTableCell sx={{ width: 120 }}>
        {isAirService && <OrderDetailsFileCell item={item} isLoading={isLoading} disabled={readOnly || !!productId} />}
      </StyledTableCell>

      <StyledTableCell sx={{ width: 80 }}>
        <Controller
          name="listPriceCur"
          control={control}
          disabled={isLoading}
          render={({ field }) => (
            <Autocomplete
              size="small"
              forcePopupIcon={false}
              options={currencies ?? []}
              filterOptions={(options) => options}
              getOptionLabel={(option) => `${option?.["$t:name"]}`}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              noOptionsText="Нет данных"
              disabled={isLoading || readOnly || isAirService}
              onChange={(e, v) => field.onChange(v ?? null)}
              onBlur={() => {
                field.onBlur();
                handleSaveOrderDetail();
              }}
              value={field.value}
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
          disabled={isLoading || readOnly || isAirService}
          render={({ field }) => (
            <StyledTextField
              {...field}
              variant="standard"
              size="small"
              type="text"
              inputProps={{
                min: 0,
                pattern: "^\\d*\\.?\\d*$",
              }}
              onChange={(e) => {
                if (checkNumericInput(e.target.value)) {
                  field.onChange(e);
                  const value = Number(e.target.value);

                  if (value != null && orderDetailQty != null) {
                    setValue("listPrice", value * orderDetailQty);
                  }
                } else {
                  e.preventDefault();
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
          disabled={isLoading || readOnly || isAirService}
          render={({ field }) => (
            <StyledTextField
              {...field}
              size="small"
              variant="standard"
              onChange={(e) => {
                if (checkNumericInput(e.target.value)) {
                  field.onChange(e);
                  const value = Number(e.target.value);
                  if (value != null && orderDetailUnitPrice != null) {
                    setValue("listPrice", value * orderDetailUnitPrice);
                  }
                } else {
                  e.preventDefault();
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
          disabled={isLoading}
          render={({ field }) => (
            <Autocomplete
              size="small"
              forcePopupIcon={false}
              options={serviceStatuses ?? []}
              getOptionLabel={(option) => `${option?.["title_kg"] || option?.["title_ru"] || option?.title}`}
              noOptionsText="Нет данных"
              disabled={isLoading || (isAirService && !!productId) || readOnly}
              onChange={(e, v) => field.onChange(v?.value ?? null)}
              onBlur={() => {
                field.onBlur();
                handleSaveOrderDetail();
              }}
              value={serviceStatuses?.find((item) => item?.value === field.value) ?? null}
              renderInput={(params) => <StyledTextField {...params} variant="standard" placeholder="Статус" />}
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
            />
          )}
        />
      </StyledTableCell>

      {!readOnly && (
        <StyledTableCell align="center" sx={{ width: 40, minWidth: 40 }}>
          {item?.id && <OrderDetailsTableRowActions id={item.id} disabled={isLoading} />}
        </StyledTableCell>
      )}
    </TableRow>
  );
}
