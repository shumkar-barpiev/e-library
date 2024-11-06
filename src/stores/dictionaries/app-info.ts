import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dateDifference } from "@/utils/date";
import { TAppInfoModel } from "@/models/dictionaries/app-info";
import { http } from "@/utils/http";

const initialStore = {
  date: null,
  loading: false,
  error: null,
  data: null,
};

export const useAppInfoStore = create(
  persist<{
    date: Date | null;
    loading: boolean;
    error: string | null;
    data: TAppInfoModel | null;
    get: () => TAppInfoModel | null;
    fetch: () => Promise<void>;
    clearStore: () => void;
  }>(
    (set, get) => ({
      ...initialStore,
      get: () => {
        const date = get().date;
        const loading = get().loading;

        if (!loading && (date == null || dateDifference(new Date(date)) > 1)) {
          get().fetch();
        }

        return get().data;
      },
      fetch: async () => {
        set({ loading: true });
        try {
          const response = await http("/ws/app/info", { method: "GET" });

          if (response.ok) {
            const data = await response.json();
            set(() => ({ error: null, data }));
          } else {
            throw new Error(`${response.status} ${response.statusText}`);
          }
        } catch (e: any) {
          set({ error: e?.message, data: null });
        } finally {
          set({ date: new Date(), loading: false });
        }
      },
      clearStore: () => {
        set(initialStore);
      },
    }),
    { name: "appInfoDictionary" }
  )
);
