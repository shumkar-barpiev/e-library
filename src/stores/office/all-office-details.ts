import { create } from "zustand";
import { http } from "@/utils/http";
import { TOfficeModel } from "@/models/office/office-detail";

type StoreState = {
  loading: boolean;
  loadingAllOffices: boolean;
  error: string | null;
  total: number | null;
  offices: TOfficeModel[] | null;
  dirty: boolean;
  fetchAllOffices: () => Promise<void>;
  updateUserOffice: (requestBody: Record<string, any>, callback: (data: any) => void) => Promise<void>;
  clearStore: () => void;
};

export const useAllOfficeDetailsStore = create<StoreState>((set, get) => ({
  loading: false,
  loadingAllOffices: false,
  error: null,
  total: null,
  offices: null,
  dirty: false,

  fetchAllOffices: async () => {
    set({ loadingAllOffices: true });
    try {
      const response = await http(`/ws/rest/com.axelor.apps.base.db.Company`, { method: "GET" });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 0) {
        set({ offices: data.data });
      } else {
        throw new Error(data.data?.message ?? "Unknown error");
      }
    } catch (error: unknown) {
      set({ error: (error as Error).message, total: null, offices: null, dirty: false });
    } finally {
      set({ loadingAllOffices: false });
    }
  },

  updateUserOffice: async (requestBody: Record<string, any>, callback: (data: any) => void) => {
    set({ loading: true });
    try {
      const response = await http(`/ws/v2/rest/com.axelor.auth.db.User`, {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 0) {
        callback(data);
      } else {
        throw new Error(data.data?.message ?? "Unknown error");
      }
    } catch (error: unknown) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  clearStore: () =>
    set({
      loading: false,
      error: null,
      total: null,
      offices: null,
    }),
}));
