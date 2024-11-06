"use client";

import Card from "@mui/material/Card";
import { useOrderDetailsStore } from "@/stores/orders/order-details";
import { useEffect, useState } from "react";
import { TCriteriaList, TModelFilters } from "@/types/model";
import { TOrderModel } from "@/models/orders/order";
import { useOrderStore } from "@/stores/orders/orders";
import { EOrderDetailsFilters } from "@/components/order/order-details/OrderDetailsActions";
import OrderDetailsPagination from "@/components/order/order-details/OrderDetailsPagination";
import DashboardDetailsTable from "@/components/dashboard/dashboard-details/DashboardDetailsTable";
import DashboardDetailsActions from "@/components/dashboard/dashboard-details/DashboardDetailsActions";

const initialFilters: (orderId: TOrderModel["id"]) => TModelFilters = (orderId) => ({
  page: 1,
  pageSize: 3,
  fields: [
    "description",
    "listPrice",
    "status",
    "listPriceCur",
    "unitPrice",
    "saleOrder",
    "productName",
    "product",
    "service",
    "product.subService",
    "product.tNumber",
    "product.name",
    "product.pSurname",
    "product.route",
    "product.resNumber",
    "reservation",
    "preOrderFromTo",
  ],
  criteria: [
    {
      operator: "and",
      criteria: [
        {
          fieldName: "saleOrder.id",
          operator: "=",
          value: orderId as number,
        },
      ],
    },
  ],
});

let timer: ReturnType<typeof setTimeout> | null;

export default function DashboardDetails() {
  const [orderId, setOrderId] = useState<TOrderModel["id"]>();
  const [pageTotal, setPageTotal] = useState(1);
  const [filters, setFilters] = useState<TModelFilters>({
    ...initialFilters(orderId),
  });

  const serviceTypesStore = useOrderDetailsStore();
  const orderStore = useOrderStore();
  const orderDetailsStore = useOrderDetailsStore((state) => state);

  const handleChangePagination = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleFilter = (type: EOrderDetailsFilters, searchText?: string | number) => {
    if (timer != null) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      const baseFilters = initialFilters(orderId)?.criteria ?? [];

      switch (type) {
        case EOrderDetailsFilters.search:
          if (searchText) {
            (baseFilters?.at(0) as TCriteriaList)?.criteria.push({
              operator: "or",
              criteria: [
                { fieldName: "product.name", operator: "like", value: `%${searchText}%` },
                { fieldName: "product.pSurname", operator: "like", value: `%${searchText}%` },
                { fieldName: "product.route", operator: "like", value: `%${searchText}%` },
                { fieldName: "product.tNumber", operator: "like", value: `%${searchText}%` },
                { fieldName: "product.resNumber", operator: "like", value: `%${searchText}%` },
              ],
            });
          }

          setFilters((prev) => ({
            ...prev,
            page: 1,
            criteria: baseFilters,
          }));

          timer = null;
          break;
      }
    }, 500);
  };

  useEffect(() => {
    serviceTypesStore.fetchItems({ translate: true });
  }, []);

  useEffect(() => {
    if (!orderId) return;
    orderDetailsStore.getItems(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    setFilters({ ...initialFilters(orderId) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (orderDetailsStore.dirty) orderDetailsStore.getItems(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderDetailsStore.dirty]);

  useEffect(() => {
    const pageTotal =
      orderDetailsStore.total != null && filters?.pageSize != null
        ? Math.ceil(orderDetailsStore.total / filters?.pageSize)
        : 1;
    setPageTotal(pageTotal);
  }, [orderDetailsStore.total, filters?.pageSize]);

  useEffect(() => {
    if (!orderStore.item) return;

    const filters = initialFilters(orderStore.item?.id);
    orderDetailsStore.fetchItems(filters).then(() => {
      setOrderId(orderStore.item?.id);
      setFilters(filters);
    });
  }, [orderStore.item]);

  return (
    <Card sx={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", gap: 1, p: 1 }}>
      <DashboardDetailsActions totalOrderDetails={orderDetailsStore.total} orderId={orderId} onFilter={handleFilter} />
      <DashboardDetailsTable items={orderDetailsStore.items} isLoading={orderDetailsStore.loading} orderId={orderId} />
      <OrderDetailsPagination
        page={filters?.page}
        total={pageTotal}
        isLoading={orderDetailsStore.loading}
        onChange={handleChangePagination}
      />
    </Card>
  );
}
