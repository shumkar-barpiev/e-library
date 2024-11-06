import { create } from "zustand";
import { http } from "@/utils/http";
import { TOrderSuggestionModel } from "@/models/orders/order-suggestion";

const initialStore = {
  loading: false,
  error: null,
  items: null,
};

export const useOrderSuggestionStore = create<{
  loading: boolean;
  error: string | null;
  items: TOrderSuggestionModel[] | null;
  fetchItems: (id: number) => Promise<void>;
  clearStore: () => void;
}>((set) => ({
  ...initialStore,
  fetchItems: async (id: number) => {
    set({ loading: true });
    try {
      const response = await http("/ws/rest/com.axelor.apps.directories.db.Hint/search", {
        method: "POST",
        body: JSON.stringify({
          data: {
            _domain: "self.service.id = :serviceId",
            _domainContext: {
              serviceId: id,
            },
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          set(() => ({ error: null, items: data.data }));
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message, items: null });
    } finally {
      set({ loading: false });
    }
  },
  clearStore: () => {
    set(initialStore);
  },
}));
