import { create } from "zustand";
import { TTaskModel } from "@/models/task/task";
import { TModelFilters } from "@/types/model";
import { replaceFilters } from "@/utils/axelor-api";
import { http } from "@/utils/http";

const initialStore = {
  loading: false,
  error: null,
  total: null,
  items: null,
};

export const useTasksStore = create<{
  loading: boolean;
  error: string | null;
  total: number | null;
  items: TTaskModel[] | null;
  getItems: (filters?: TModelFilters) => TTaskModel[] | null;
  fetchItems: (filters?: TModelFilters, callback?: Function) => Promise<void>;
  createItem: (task: TTaskModel) => Promise<TTaskModel[]>;
  clearStore: () => void;
}>((set, get) => ({
  ...initialStore,
  getItems: (filters?: TModelFilters) => {
    if (!get().loading) get().fetchItems(filters);

    return get().items;
  },
  fetchItems: async (filters?: TModelFilters, callback?: Function) => {
    set({ loading: true });
    try {
      const _filters = replaceFilters(filters);
      const response = await http("/ws/rest/com.axelor.team.db.TeamTask/search", {
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
  createItem: async (task: TTaskModel) => {
    set({ loading: true });
    try {
      const response = await http("/ws/rest/com.axelor.team.db.TeamTask", {
        method: "POST",
        body: JSON.stringify({ data: task }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) return data.data;
        else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message, total: null, items: null });
    } finally {
      set({ loading: false });
    }
  },
  clearStore: () => {
    set(initialStore);
  },
}));
