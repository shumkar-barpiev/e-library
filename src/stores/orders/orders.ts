import { create } from "zustand";
import { http } from "@/utils/http";
import { TOrderModel } from "@/models/orders/order";
import { TUserModel } from "@/models/user/user";
import { TCurrencyModel } from "@/models/dictionaries/currency";
import { replaceFilters } from "@/utils/axelor-api";
import { TModelFilters } from "@/types/model";

const initialStore = {
  loading: false,
  error: null,
  item: null,
  items: null,
  total: null,
  sum: null,
};

export const useOrderStore = create<{
  loading: boolean;
  error: string | null;
  item: TOrderModel | null;
  items: TOrderModel[] | null;
  total: number | null;
  sum: number | null;
  deleteItem: (id: TOrderModel["id"]) => Promise<void>;
  saveItem: (item: TOrderModel) => Promise<TOrderModel>;
  fetchSum: (orderId: TOrderModel["id"]) => Promise<void>;
  getItems: (filters?: TModelFilters) => TOrderModel[] | null;
  fetchItems: (filters?: TModelFilters, callback?: Function) => Promise<void>;
  fetchItem: (id: number, signal?: AbortSignal) => Promise<TOrderModel | null>;
  updateSaleOrderSeq: (requestBody: Record<string, any>) => Promise<Record<string, any> | null>;
  fetchInvoiceNumber: (orderId: TOrderModel["id"] | null) => Promise<Record<string, any> | null>;
  createPayment: (requestBody: Record<string, any>, callback: (data: Record<string, any>) => void) => Promise<void>;
  createItem: (data: {
    appeal: { id: number };
    clientPartner: { id: TUserModel["id"] };
    currency: TCurrencyModel;
  }) => Promise<TOrderModel | null>;
  clearStore: () => void;
}>((set, get) => ({
  ...initialStore,
  fetchInvoiceNumber: async (orderId) => {
    try {
      set({ loading: true });

      const response = await http(`/ws/electronic-sequence/sale-order/${orderId}`, {
        method: "GET",
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ loading: false });
    }
    return null;
  },

  updateSaleOrderSeq: async (requestBody) => {
    try {
      set({ loading: true });

      const response = await http(`/ws/electronic-sequence/sale-order`, {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ loading: false });
    }
    return null;
  },

  fetchItem: async (id: number, signal?: AbortSignal) => {
    try {
      set({ loading: true });

      const response = await http(`/ws/rest/com.axelor.apps.sale.db.SaleOrder/${id}`, { signal });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0 && data.hasOwnProperty("data")) {
          set({ item: data.data[0], error: null });
          return data.data[0];
        } else {
          throw new Error(data.data?.message ?? "No data");
        }
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ loading: false });
    }
  },

  getItems: (filters?: TModelFilters) => {
    if (!get().loading) get().fetchItems(filters);

    return get().items;
  },

  fetchItems: async (filters?: TModelFilters, callback?: Function) => {
    set({ loading: true });
    try {
      const _filters = replaceFilters(filters);
      const response = await http("/ws/rest/com.axelor.apps.sale.db.SaleOrder/search", {
        method: "POST",
        body: JSON.stringify(_filters),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          if (callback != null) callback(data.data);
          else set(() => ({ error: null, total: data.total, items: data.data }));
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message, total: null, items: null });
    } finally {
      set({ loading: false });
    }
  },

  fetchSum: async (orderId) => {
    set({ loading: true });

    try {
      const response = await http(`/ws/order/${orderId}`, { method: "POST" });

      if (response.ok) {
        const data = await response.json();
        set({ sum: parseFloat(data) || 0 });
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ sum: 0 });
    } finally {
      set({ loading: false });
    }
  },

  saveItem: async (item: TOrderModel) => {
    set({ loading: true });
    try {
      const response = await http("/ws/v2/rest/com.axelor.apps.sale.db.SaleOrder", {
        method: "POST",
        body: JSON.stringify({
          data: item,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          set({ item: data.data[0] });
          return data.data[0];
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ loading: false });
    }
  },

  createPayment: async (requestBody, callback) => {
    try {
      const response = await http("/ws/order/payments", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        callback(data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ loading: false });
    }
  },

  createItem: async (data) => {
    set({ loading: true });
    try {
      const response = await http("/ws/rest/com.axelor.apps.sale.db.SaleOrder", {
        method: "POST",
        body: JSON.stringify({
          data: {
            id: null,
            version: null,
            company: { id: 1 },
            creationDate: new Date().toISOString(),
            ...data,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          set({ item: data.data[0], error: null });
          return data.data[0];
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ loading: false });
    }
    return null;
  },

  deleteItem: async (id: TOrderModel["id"]) => {
    try {
      set({ loading: true });

      const response = await http(`/ws/rest/com.axelor.apps.sale.db.SaleOrder/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          set(() => ({ item: null }));
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set(() => ({ item: null }));
    } finally {
      set({ loading: false });
    }
  },

  clearStore: () => {
    // set(initialStore);
  },
}));
