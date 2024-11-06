import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dateDifference } from "@/utils/date";
import { replaceFilters } from "@/utils/axelor-api";
import { TModelFilters } from "@/types/model";
import { TCountryModel } from "@/models/dictionaries/country";
import { http } from "@/utils/http";

export const useCountriesStore = create(
  persist<{
    date: Date | null;
    loading: boolean;
    error: string | null;
    total: number | null;
    items: TCountryModel[] | null;
    getItems: (filters?: TModelFilters) => TCountryModel[] | null;
    fetchItems: (filters?: TModelFilters) => Promise<void>;
  }>(
    (set, get) => ({
      date: null,
      loading: false,
      error: null,
      total: null,
      items: null,
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
          const response = await http("/ws/rest/com.axelor.apps.base.db.Country/search", {
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
    }),
    { name: "countriesDictionary" }
  )
);
