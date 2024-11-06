"use client";
import { create } from "zustand";
import { http } from "@/utils/http";

const initialStore = {
  error: null,
  orders: null,
  loading: false,
  ordersTotal: 0,
  destinations: null,
};

export const usePersonalAreaOrdersStore = create<{
  loading: boolean;
  ordersTotal: number;
  error: string | null;
  orders: Record<string, any>[] | null;
  destinations: Record<string, number> | null;
  fetchOrders: (requestBody: Record<string, any> | null) => Promise<void>;
  clearStore: () => void;
}>((set) => ({
  ...initialStore,
  fetchOrders: async (requestBody) => {
    if (requestBody) {
      set({ orders: null, loading: true });
      try {
        const response = await http("/ws/rest/com.axelor.apps.base.db.Product/search", {
          method: "POST",
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status == 0 && data.total > 0) set({ orders: data.data, ordersTotal: data.total });
        } else {
          throw new Error(`${response.status} ${response.statusText}`);
        }
      } catch (e: any) {
        set({ error: e?.message || "An error occurred" });
      } finally {
        set({ loading: false });
      }
    }
  },
  clearStore: () => {
    set(initialStore);
  },
}));
