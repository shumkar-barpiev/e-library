import { create } from "zustand";
import { TModelFilters } from "@/types/model";
import { TOrderUserTaskModel } from "@/models/orders/order-user-task";
import { replaceFilters } from "@/utils/axelor-api";
import { http } from "@/utils/http";

export const useOrderUserTaskStore = create<{
  loading: boolean;
  items: TOrderUserTaskModel[] | null;
  fetch: (filters?: TModelFilters) => Promise<TOrderUserTaskModel[] | null>;
  store: (saleOrderId: number, task: TOrderUserTaskModel) => Promise<boolean>;
  complete: (task: TOrderUserTaskModel) => Promise<void>;
  delete: (task: TOrderUserTaskModel) => Promise<boolean>;
  clearStore: () => void;
}>((set, get) => ({
  loading: false,
  items: null,
  fetch: async (filters?: TModelFilters) => {
    try {
      set({ loading: true });

      const _filters = replaceFilters(filters);
      const response = await http("/ws/rest/com.axelor.apps.mycrm.db.SaleOrderTask/search", {
        method: "POST",
        body: JSON.stringify(_filters),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          set(() => ({ items: data.data }));
        }
      }
    } catch (e: any) {
      console.log(e?.message);
      set(() => ({ items: null }));
    } finally {
      set({ loading: false });
    }
    return get().items;
  },
  store: async (saleOrderId: number, task: TOrderUserTaskModel) => {
    try {
      set({ loading: true });

      const response = await http(`/ws/v2/rest/com.axelor.apps.mycrm.db.SaleOrderTask`, {
        method: "POST",
        body: JSON.stringify({
          data: {
            ...task,
            saleOrder: { id: saleOrderId },
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.status === 0;
      }
    } catch (e: any) {
      console.log(e?.message);
    } finally {
      set({ loading: false });
    }

    return false;
  },
  complete: async (task: TOrderUserTaskModel) => {
    try {
      const response = await http(`/ws/v2/rest/com.axelor.apps.mycrm.db.SaleOrderTask`, {
        method: "POST",
        body: JSON.stringify({
          data: {
            id: task.id,
            isComplete: !task.isComplete,
          },
        }),
      });

      if (response.ok) {
        // TODO: handle response
      }
    } catch (e: any) {
      console.log(e?.message);
    }
  },
  delete: async (task: TOrderUserTaskModel) => {
    try {
      const response = await http(`/ws/rest/com.axelor.apps.mycrm.db.SaleOrderTask/${task.id}`, {
        method: "DELETE",
      });
      return response.ok;
    } catch (e: any) {
      console.log(e?.message);
      return false;
    }
  },
  clearStore: () => set(() => ({ items: null })),
}));
