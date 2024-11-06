import { TOrderModel } from "@/models/orders/order";
import { TServiceModel } from "@/models/dictionaries/service";
import { OrderDetailModel, TOrderDetailModel } from "@/models/orders/order-detail";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCurrenciesStore } from "@/stores/dictionaries/currencies";
import { useServicesStore } from "@/stores/dictionaries/services";
import { useServiceStatusesStore } from "@/stores/dictionaries/service-statuses";
import { useOrderDetailsStore } from "@/stores/orders/order-details";

import { Autocomplete, TableRow, TableCell, TextField, Stack, styled, Button, Typography } from "@mui/material";
import { StyledTextField } from "@/components/other/StyledTextField";
import { StyledTableCell } from "@/components/other/StyledTableCell";
import { AutocompletePopperProps } from "@/components/other/AutocompletePopperProps";
import { useAxelorStore } from "@/stores/axelor/axelor";

import { useEffect, useState } from "react";
import { useOrderStore } from "@/stores/orders/orders";
import OrderDetailsTableRowActions from "@/components/order/order-details/OrderDetailsTableRowActions";

export default function DashboardDetailsTableRow({
  orderId,
  serviceId,
  item,
  isLoading = false,
}: {
  orderId: TOrderModel["id"];
  serviceId: number;
  item?: TOrderDetailModel | null;
  isLoading?: boolean;
}) {
  const { control, formState, watch, setValue } = useForm<TOrderDetailModel>({
    mode: "all",
    defaultValues: {
      id: item?.id,
      saleOrder: { id: orderId },
      description: item?.description ?? "",
      productName: item != null ? (item as any)["product.tNumber"] : "",
      product: {
        id: item?.product?.id ?? 0,
        name: item != null ? ((item as any)["product.name"] ?? "") : "",
        pSurname: item != null ? ((item as any)["product.pSurname"] ?? "") : "",
        service: { id: serviceId },
      },
      listPriceCur: item?.listPriceCur ?? null,
      listPrice: isNaN(Number(item?.unitPrice) * Number(item?.qty)) ? 0 : Number(item?.unitPrice) * Number(item?.qty),
      unitPrice: Number(item?.unitPrice) ?? 0,
      qty: item?.qty != null ? Math.ceil(item.qty) : 0,
      status: item?.status ?? null,
    },
    resolver: zodResolver(OrderDetailModel),
  });

  const productId = watch("product.id");
  const productName = watch("product.name");
  const productPSurname = watch("product.pSurname");
  const orderDetailId = watch("id");
  const orderDetailListPriceCur = watch("listPriceCur");
  const orderDetailDescription = watch("description");
  const orderDetailListPrice = watch("listPrice");
  const orderDetailUnitPrice = watch("unitPrice");
  const orderDetailQty = watch("qty");
  const orderDetailStatus = watch("status");

  const [serviceTypeName, setServiceTypeName] = useState("");
  const [subServices, setSubServices] = useState<TServiceModel[]>([]);

  const services = useServicesStore((state) =>
    state.getItems({ criteria: [{ fieldName: "parent.id", operator: "isNull", value: "" }] })
  );
  const servicesStore = useServicesStore((state) => state);
  const serviceStatuses = useServiceStatusesStore((state) => state.getItems({ translate: true }));
  const currencies = useCurrenciesStore((state) =>
    state.getItems({
      criteria: [{ fieldName: "isBase", operator: "=", value: true }],
    })
  );
  const axelorStore = useAxelorStore();
  const orderStore = useOrderStore((state) => state);
  const orderDetailsStore = useOrderDetailsStore((state) => state);

  const handleSaveOrderDetail = () => {
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
      orderDetailsStore.saveItem({
        id: orderDetailId,
        saleOrder: { id: orderId },
        description: orderDetailDescription,
        productName: `${productId}`,
        product: {
          id: productId,
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

  useEffect(() => {
    const finded = services?.find((f) => f?.id === serviceId);
    setServiceTypeName((finded?.["$t:name"] || finded?.name) ?? "");
  }, [serviceId, services]);

  useEffect(() => {
    servicesStore.fetchItems({ criteria: [{ fieldName: "parent.id", operator: "=", value: serviceId }] }, (data) => {
      setSubServices(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  return (
    <TableRow key={item?.id}>
      <StyledTableCell sx={{ width: 75 }}>
        <Button color="secondary" disabled={isLoading} sx={{ minWidth: 50, textAlign: "left" }}>
          {serviceTypeName}
        </Button>
      </StyledTableCell>
      <StyledTableCell sx={{ width: 150 }}>
        <Stack direction="row" gap={1}>
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
                onBlur={handleSaveOrderDetail}
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
                onBlur={handleSaveOrderDetail}
              />
            )}
          />
        </Stack>
      </StyledTableCell>
      <StyledTableCell>
        <Controller
          name="description"
          control={control}
          disabled
          render={({ field }) => (
            <TextField
              {...field}
              variant="standard"
              size="small"
              multiline
              placeholder="Описание"
              onBlur={handleSaveOrderDetail}
              sx={{ width: "100%" }}
            />
          )}
        />
      </StyledTableCell>
      <StyledTableCell />
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
              onBlur={handleSaveOrderDetail}
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
        <Typography>{orderDetailListPrice}</Typography>
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
              onChange={(e, v) => field.onChange(v?.value ?? null)}
              onBlur={handleSaveOrderDetail}
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
