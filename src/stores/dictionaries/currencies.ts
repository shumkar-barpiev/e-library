import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dateDifference } from "@/utils/date";
import { replaceFilters } from "@/utils/axelor-api";
import { http } from "@/utils/http";
import { TModelFilters } from "@/types/model";
import { TCurrencyModel } from "@/models/dictionaries/currency";

const initialStore = {
  date: null,
  loading: false,
  error: null,
  total: null,
  items: null,
};

export const useCurrenciesStore = create(
  persist<{
    date: Date | null;
    loading: boolean;
    error: string | null;
    total: number | null;
    items: TCurrencyModel[] | null;
    getItems: (filters?: TModelFilters) => TCurrencyModel[] | null;
    fetchItems: (filters?: TModelFilters) => Promise<void>;
    clearStore: () => void;
  }>(
    (set, get) => ({
      ...initialStore,
      getItems: (filters?: TModelFilters) => {
        const date = get().date;
        const loading = get().loading;

        if (!loading && (date == null || dateDifference(new Date(date)) > 1)) {
          get().fetchItems(filters);
        }

        return get().items;
      },
      fetchItems: async (filters?: TModelFilters) => {
        set({ loading: true });
        try {
          const _filters = replaceFilters(filters);
          const response = await http("/ws/rest/com.axelor.apps.base.db.Currency/search", {
            method: "POST",
            body: JSON.stringify(_filters),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.status === 0) set({ error: null, total: data.total, items: data.data });
            else throw new Error(data.data?.message ?? data.data);
          } else {
            throw new Error(`${response.status} ${response.statusText}`);
          }
        } catch (e: any) {
          set({ error: e?.message });
        } finally {
          set({ date: new Date(), loading: false });
        }
      },
      clearStore: () => {
        set(initialStore);
      },
    }),
    { name: "currenciesDictionary" }
  )
);
