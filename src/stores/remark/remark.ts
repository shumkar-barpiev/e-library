"use client";
import { create } from "zustand";
import { http } from "@/utils/http";
import {
  FetchRemarkType,
  Response,
  RequestBodyType,
  OperSalesType,
  StatusType,
  PaymentFormType,
} from "@/models/remark/remark";

const initialStore = {
  loading: false,
  error: null,
  chats: null,
  destinations: null,
  sales: null,
};

const getRequestBody = (key?: string) => {
  switch (key) {
    case "operSales":
      return {
        offset: 0,
        sortBy: ["fullName"],
        fields: ["fullName"],
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
    const response = await http(reqPath, {
      method: reqMethod,
      body: reqBody,
      headers: {
        "Content-Type": "application/json",
      },
    });

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

export const useRemarkerStore = create<{
  loading: boolean;
  error: string | null;
  destinations: Record<string, number> | null;
  clearStore: () => void;
  fetchRemark: (reqBody: RequestBodyType, callback: (data: Response<FetchRemarkType>) => void) => Promise<void>;
  fetchStatusAirfile: (callback: (data: Response<StatusType>) => void) => Promise<void>;
  fetchFormOfPayment: (callback: (data: Response<PaymentFormType>) => void) => Promise<void>;
  fetchOperSales: (callback: (data: Response<OperSalesType>) => void) => Promise<void>;
}>((set, get) => ({
  ...initialStore,
  fetchRemark: async (reqBody: RequestBodyType, callback: Function) => {
    set({ loading: true });
    const params = {
      reqPath: "/ws/airfile/remark",
      reqMethod: "POST",
      reqBody: JSON.stringify(reqBody),
      setterMethod: set,
    };

    performRequest(params, callback);
  },
  fetchStatusAirfile: async (callback: Function) => {
    set({ loading: true });
    const requestBody = getRequestBody();

    const params = {
      reqPath: "/ws/selection/foms.service.status.type.select",
      reqMethod: "POST",
      reqBody: JSON.stringify(requestBody),
      setterMethod: set,
    };

    performRequest(params, callback);
  },
  fetchFormOfPayment: async (callback: Function) => {
    set({ loading: true });
    const requestBody = getRequestBody();

    const params = {
      reqPath: "/ws/selection/foms.air.file.form.of.payment",
      reqMethod: "POST",
      reqBody: JSON.stringify(requestBody),
      setterMethod: set,
    };

    performRequest(params, callback);
  },
  fetchOperSales: async (callback: Function) => {
    set({ loading: true });
    const requestBody = getRequestBody("operSales");

    const params = {
      reqPath: "/ws/rest/com.axelor.auth.db.User/search",
      reqMethod: "POST",
      reqBody: JSON.stringify(requestBody),
      setterMethod: set,
    };

    performRequest(params, callback);
  },
  clearStore: () => {
    set(initialStore);
  },
}));
