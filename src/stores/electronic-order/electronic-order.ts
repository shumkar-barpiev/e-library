"use client";
import { create } from "zustand";
import { http } from "@/utils/http";
import {
  Response,
  ShiftType,
  GetOrderNumType,
  AirlineCompanyType,
  OrderNumResponseType,
  CurrencyType,
  CurrentUserType,
  CurrentUserIdType,
  CashierType,
} from "@/models/electronic-order/electronic-order";

const initialStore = {
  loading: false,
  error: null,
  destinations: null,
};

const getRequestBody = (key?: string) => {
  switch (key) {
    case "airlineCompanies":
      return {
        offset: 0,
        sortBy: ["code"],
        fields: ["name", "code", "isBase"],
        data: {
          _domain: "self.isBase = false",
        },
      };
    default:
      return {
        translate: true,
      };
  }
};
const performRequest = async (params: Record<string, any>, callback: Function) => {
  const { reqPath, reqMethod, reqBody, setterMethod } = params;
  try {
    let response;

    if (reqMethod === "GET") {
      response = await http(reqPath, {
        method: "GET",
      });
    } else {
      response = await http(reqPath, {
        method: reqMethod,
        body: reqBody,
      });
    }

    if (response.ok) {
      const data = await response.json();
      callback(data);
    } else {
      throw new Error(`${response.status} ${response.statusText}`);
    }
  } catch (e: any) {
    setterMethod({ error: e?.message });
  } finally {
    setterMethod({ loading: false });
  }
};

export const useElectronicOrderStore = create<{
  loading: boolean;
  error: string | null;
  destinations: Record<string, number> | null;
  clearStore: () => void;
  fetchShifts: (callback: (data: Response<ShiftType>) => void) => Promise<void>;
  saveOrderNumber: (reqBody: OrderNumResponseType, callback: (data: Response) => void) => Promise<void>;
  fetchAirlineCompanies: (callback: (data: Response<AirlineCompanyType>) => void) => Promise<void>;
  fetchOrderNum: (reqBody: GetOrderNumType, callback: (data: OrderNumResponseType) => void) => Promise<void>;
  getCurrency: (callback: (data: Response<CurrencyType>) => void) => Promise<void>;
  getCashier: (currentUser: Record<string, any>, callback: (data: Response<CashierType>) => void) => Promise<void>;
  getCurrentUser: (
    currentUserId: CurrentUserIdType,
    callback: (data: Response<CurrentUserType>) => void
  ) => Promise<void>;
  createPayment: (
    { orderNum, sum, currencyId, cashierId }: { orderNum: string; sum: number; currencyId: number; cashierId: number },
    callback: (data: Response<CashierType>) => void
  ) => Promise<void>;
}>((set, get) => ({
  ...initialStore,
  fetchShifts: async (callback: Function) => {
    set({ loading: true });
    const reqBody = getRequestBody();
    const params = {
      reqPath: "/ws/selection/foms.electronic-sequence.shift",
      reqMethod: "POST",
      reqBody: JSON.stringify(reqBody),
      setterMethod: set,
    };

    performRequest(params, callback);
  },
  saveOrderNumber: async (reqBody: OrderNumResponseType, callback: Function) => {
    const params = {
      reqPath: "/ws/electronic-sequence",
      reqMethod: "POST",
      reqBody: JSON.stringify(reqBody),
      setterMethod: set,
    };

    performRequest(params, callback);
  },
  fetchAirlineCompanies: async (callback: Function) => {
    set({ loading: true });
    const requestBody = getRequestBody("airlineCompanies");

    const params = {
      reqPath: "/ws/rest/com.axelor.apps.directories.db.AirPrefix/search",
      reqMethod: "POST",
      reqBody: JSON.stringify(requestBody),
      setterMethod: set,
    };

    performRequest(params, callback);
  },
  fetchOrderNum: async (reqBody: GetOrderNumType, callback: Function) => {
    const params = {
      reqPath: `/ws/electronic-sequence/${reqBody["airlineId"]}/shift/${reqBody["shiftId"]}`,
      reqMethod: "GET",
      reqBody: {},
      setterMethod: set,
    };

    performRequest(params, callback);
  },
  getCurrency: async (callback: Function) => {
    set({ loading: true });
    let reqBody = {
      offset: 0,
      sortBy: ["code"],
      fields: ["name", "code", "isBase"],
      data: {
        _domain: "self.isBase = true",
      },
    };
    const params = {
      reqPath: "/ws/rest/com.axelor.apps.base.db.Currency/search",
      reqMethod: "POST",
      reqBody: JSON.stringify(reqBody),
      setterMethod: set,
    };

    performRequest(params, callback);
  },
  getCashier: async (currentUser, callback: Function) => {
    set({ loading: true });
    let reqBody = {
      offset: 0,
      sortBy: ["code"],
      fields: ["name", "code", "activeCompany", "roles"],
      data: {
        _domain: "self.activeCompany.id = :activeCompanyId and self.roles.name in ('Admin')",
        _domainContext: {
          activeCompanyId: currentUser?.activeCompany?.id,
        },
      },
    };
    const params = {
      reqPath: "/ws/rest/com.axelor.auth.db.User/search",
      reqMethod: "POST",
      reqBody: JSON.stringify(reqBody),
      setterMethod: set,
    };

    performRequest(params, callback);
  },
  getCurrentUser: async (currentUserId: CurrentUserIdType, callback: Function) => {
    set({ loading: true });

    const params = {
      reqPath: `/ws/rest/com.axelor.auth.db.User/${currentUserId.id}`,
      reqMethod: "GET",
      setterMethod: set,
    };

    performRequest(params, callback);
  },
  createPayment: async (
    { orderNum, sum, currencyId, cashierId }: { orderNum: string; sum: number; currencyId: number; cashierId: number },
    callback: Function
  ) => {
    set({ loading: true });
    let reqBody = {
      data: {
        sum: sum,
        currency: {
          id: currencyId,
        },
        numberInvoice: orderNum,
        cashier: {
          id: cashierId,
        },
      },
    };
    const params = {
      reqPath: "/ws/rest/com.axelor.apps.mycrm.db.Payment",
      reqMethod: "POST",
      reqBody: JSON.stringify(reqBody),
      setterMethod: set,
    };

    performRequest(params, callback);
  },
  clearStore: () => {
    set(initialStore);
  },
}));
