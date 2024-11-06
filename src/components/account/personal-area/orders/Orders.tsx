"use client";

import { Box } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { TUserModel } from "@/models/user/user";
import OrdersTableFilter from "./OrdersTableFilter";
import { useEffect, useState, useContext } from "react";
import { useRemarkerStore } from "@/stores/remark/remark";
import { usePersonalAreaOrdersStore } from "@/stores/personal-area/orders/user-orders";
import OrderDetailsTable from "@/components/account/personal-area/orders/OrderDetailsTable";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";

export const ORDERS_LIMIT = 8;

const initialRequestBody = {
  limit: ORDERS_LIMIT,
  fields: [
    "name", // Имя
    "serFee", // Комиссия
    "service", // Услуга
    "tIsDate", // Дата оформления
    "tNumber", // Номер документа
    "pSurname", // Фамилия
    "unitPrice", // Итого
    "srvcStatus", // Статус
    "unitPriceCur", // Валюта итого
    "numberInvoice", // Номер инвойса
  ],
  sortBy: ["-createdOn"],
};

const Orders = () => {
  const remarkStore = useRemarkerStore();
  const ordersStore = usePersonalAreaOrdersStore();
  const currentUserContext = useContext(CurrentUserContext);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [filter, setFilter] = useState<Record<string, any> | null>(null);
  const [currentUser, setCurrentUser] = useState<TUserModel | null>(null);
  const [userOrdersPagination, setUserOrdersPagination] = useState<number>(1);
  const [statuses, setStatuses] = useState<Record<string, any>[] | null>(null);
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);

  const setFilterParams = (data: Record<string, any> | null) => {
    setUserOrdersPagination(1);
    setFilter(data);
  };

  const setPaginationParams = (pageNumber: number) => {
    setUserOrdersPagination(pageNumber);
  };

  const getPrimaryCriteria = (userRole: string) => {
    return userRole === "SUBAGENT"
      ? { fieldName: "account.accountNo", operator: "=", value: currentUser?.organization?.accountNo }
      : null;
  };

  const statusesCallback = (data: Record<string, any>) => {
    if (data.status == 0) {
      setStatuses(data.data);
    } else enqueueSnackbar("Что то пошло не так", { variant: "error" });
  };

  useEffect(() => {
    remarkStore.fetchStatusAirfile(statusesCallback);
  }, []);

  useEffect(() => {
    if (currentUserContext?.currentUser) setCurrentUser(currentUserContext?.currentUser);
    if (currentUserContext?.userRoles) setCurrentUserRoles(currentUserContext?.userRoles);
  }, [currentUserContext]);

  useEffect(() => {
    if (!!currentUser?.id) {
      let criteria: Record<string, any> = [];
      const offset = (userOrdersPagination - 1) * ORDERS_LIMIT;
      if (filter) criteria.push(filter);

      const userRole = !!(currentUserRoles?.isManager || currentUserRoles?.isAdmin)
        ? "MANAGER"
        : currentUserRoles?.isSubagent
          ? "SUBAGENT"
          : null;

      if (userRole) {
        const primaryCriteria = getPrimaryCriteria(userRole);
        if (primaryCriteria) criteria.push(primaryCriteria);
      }

      criteria.push({
        operator: "or",
        criteria: [
          { fieldName: "service.type", operator: "=", value: "air.tickets" },
          { fieldName: "service.type", operator: "=", value: "emd" },
        ],
      });

      const requestBody = {
        offset: offset,
        ...initialRequestBody,
        data: {
          criteria: [
            {
              operator: "and",
              criteria: criteria,
            },
          ],
        },
      };
      setLoadingOrders(true);
      ordersStore.fetchOrders(requestBody).then(() => {
        setLoadingOrders(false);
      });
    }

    return () => {
      ordersStore.clearStore();
    };
  }, [currentUser, filter, userOrdersPagination]);

  return (
    <Box sx={{ overflowX: "auto", maxHeight: "100%", height: "auto" }}>
      <Box sx={{ display: "flex", flexDirection: "column", height: { xs: "auto", md: "100vh" }, minWidth: "100%" }}>
        <OrdersTableFilter setFilter={setFilterParams} statuses={statuses} />
        <OrderDetailsTable
          loading={loadingOrders}
          ordersPagination={userOrdersPagination}
          setOrdersPagination={setPaginationParams}
        />
      </Box>
    </Box>
  );
};

export default Orders;
