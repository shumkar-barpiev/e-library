"use client";

import Card from "@mui/material/Card";
import OrderDetailsTable from "./OrderDetailsTable";
import OrderDetailsActions, { EOrderDetailsFilters } from "./OrderDetailsActions";
import OrderDetailsPagination from "./OrderDetailsPagination";
import { useOrderDetailsStore } from "@/stores/orders/order-details";
import { useEffect, useState } from "react";
import { TCriteriaList, TModelFilters } from "@/types/model";
import { TOrderModel } from "@/models/orders/order";
import { useOrderStore } from "@/stores/orders/orders";
import { useServicesStore } from "@/stores/dictionaries/services";
import { useAllOrderDetailsStore } from "@/stores/orders/all-orders-details";
import { useSearchParams } from "next/navigation";
import OrdersTable from "../OrdersTable";

const initialFilters: (orderId: TOrderModel["id"]) => TModelFilters = (orderId) => ({
  page: 1,
  pageSize: 3,
  fields: [
    "qty",
    "status",
    "service",
    "product",
    "ocrImage",
    "unitPrice",
    "listPrice",
    "saleOrder",
    "description",
    "productName",
    "reservation",
    "listPriceCur",
    "product.name",
    "numberInvoice",
    "product.route",
    "preOrderFromTo",
    "product.tNumber",
    "product.pSurname",
    "product.resNumber",
    "product.numberInvoice",
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

export default function OrderDetails() {
  const searchParams = useSearchParams();

  const [appealId, setAppealId] = useState<number>();
  const [pageTotal, setPageTotal] = useState(1);
  const [activeTab, setActiveTab] = useState("orderDetails");
  const [filters, setFilters] = useState<TModelFilters>();

  const orderStore = useOrderStore();
  const serviceTypesStore = useServicesStore();
  const orderDetailsStore = useOrderDetailsStore();
  const allOrderDetailsStore = useAllOrderDetailsStore();

  const orderId = orderStore.item?.id;

  const handleChangePagination = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleFilter = (type: EOrderDetailsFilters, searchText?: string | number) => {
    if (!orderId) return;

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
    setAppealId(parseInt(searchParams.get("appeal") || ""));
  }, []);

  useEffect(() => {
    if (!orderId) return;
    serviceTypesStore.fetchItems({ translate: true });
  }, []);

  useEffect(() => {
    if (activeTab === "allOrderDetails") {
      allOrderDetailsStore.fetchItems({
        ...filters,
        criteria: [
          {
            operator: "and",
            criteria: [
              {
                fieldName: "saleOrder.appeal.id",
                operator: "=",
                value: appealId as number,
              },
              {
                fieldName: "status",
                operator: "=",
                value: "paid",
              },
            ],
          },
        ],
      });
    }
    if (activeTab === "orderDetails" && filters) {
      orderDetailsStore.fetchItems(filters);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!orderId) return;
    orderDetailsStore.fetchItems(filters);
    allOrderDetailsStore.fetchItems({
      ...filters,
      criteria: [
        {
          operator: "and",
          criteria: [
            {
              fieldName: "saleOrder.appeal.id",
              operator: "=",
              value: appealId as number,
            },
            {
              fieldName: "status",
              operator: "=",
              value: "paid",
            },
          ],
        },
      ],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    if (!orderId) return;
    setFilters({ ...initialFilters(orderId) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (orderId && orderDetailsStore.dirty) orderDetailsStore.getItems(filters);
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
    if (!orderId) return;
    const filters = initialFilters(orderId);
    orderDetailsStore.fetchItems(filters).then(() => {
      setFilters(filters);
    });
  }, [orderId]);

  return (
    <Card sx={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", gap: 1, p: 1 }}>
      <OrderDetailsActions
        activeTab={activeTab}
        totalOrderDetails={orderDetailsStore.total}
        totalAllOrderDetails={allOrderDetailsStore.total}
        setActiveTab={setActiveTab}
        onFilter={handleFilter}
      />
      {activeTab === "allOrderDetails" ? (
        <OrdersTable />
      ) : (
        <>
          <OrderDetailsTable items={orderDetailsStore.items} isLoading={orderDetailsStore.loading} orderId={orderId} />
          <OrderDetailsPagination
            page={filters?.page}
            total={pageTotal}
            isLoading={orderDetailsStore.loading}
            onChange={handleChangePagination}
          />
        </>
      )}
    </Card>
  );
}
