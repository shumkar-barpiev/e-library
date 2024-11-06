import { create } from "zustand";
import { TModelFilters } from "@/types/model";
import { replaceFilters } from "@/utils/axelor-api";
import { http } from "@/utils/http";
import { TOrderDetailModel } from "@/models/orders/order-detail";

const initialStore = {
  loading: false,
  error: null,
  total: null,
  items: null,
  dirty: false,
};

export const useAllOrderDetailsStore = create<{
  loading: boolean;
  error: string | null;
  total: number | null;
  items: TOrderDetailModel[] | null;
  dirty: boolean;
  fetchItems: (filters?: TModelFilters, callback?: Function) => Promise<void>;
  setDirty: (item: boolean) => void;
  clearStore: () => void;
}>((set, get) => ({
  ...initialStore,
  fetchItems: async (filters?: TModelFilters, callback?: Function) => {
    set({ loading: true });
    try {
      const _filters = replaceFilters(filters);
      const response = await http("/ws/rest/com.axelor.apps.sale.db.SaleOrderLine/search", {
        method: "POST",
        body: JSON.stringify(_filters),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          if (callback != null) callback(data.data);
          else set(() => ({ error: null, total: data.total, items: data.data, dirty: false }));
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message, total: null, items: null, dirty: false });
    } finally {
      set({ loading: false });
    }
  },
  setDirty: (item: boolean = false) => {
    set({ dirty: item });
  },
  clearStore: () => {
    set(initialStore);
  },
}));
