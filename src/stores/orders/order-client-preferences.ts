import { create } from "zustand";
import { TOrderClientPreferenceModel } from "@/models/orders/order-client-preference";
import { http } from "@/utils/http";

export const useOrderClientPreferenceStore = create<{
  loading: boolean;
  items: TOrderClientPreferenceModel[] | null;
  fetch: (signal?: AbortSignal) => Promise<TOrderClientPreferenceModel[] | null>;
  updatePreferences: (id: number, preferences: TOrderClientPreferenceModel[], signal?: AbortSignal) => Promise<void>;
}>((set, get) => ({
  loading: false,
  items: null,
  fetch: async (signal?: AbortSignal) => {
    try {
      set({ loading: true });

      const response = await http("/ws/rest/com.axelor.apps.directories.db.Preference/search", {
        signal,
        method: "POST",
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          set(() => ({ items: data.data }));
        }
      }
    } catch (e: any) {
      console.log(e?.message);
    } finally {
      set({ loading: false });
    }

    return get().items;
  },
  updatePreferences: async (id: number, preferences: TOrderClientPreferenceModel[], signal?: AbortSignal) => {
    try {
      set({ loading: true });

      const response = await http(`/ws/v2/rest/com.axelor.apps.sale.db.SaleOrder`, {
        signal,
        method: "POST",
        body: JSON.stringify({
          data: {
            id: id,
            preference: preferences.map((p) => ({ id: p.id })),
          },
        }),
      });

      if (response.ok) {
        // TODO: handle response
      }
    } catch (e: any) {
      console.log(e?.message);
    } finally {
      set({ loading: false });
    }
  },
}));
