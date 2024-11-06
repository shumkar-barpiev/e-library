"use client";
import { create } from "zustand";
import { http } from "@/utils/http";

type ChatType = {
  chatData: {
    whatsapp: number;
    call: number;
    telegram: number;
    instagram: number;
  };
};

type SalesType = {
  chart: Record<string, number>;
  profitIncrease: string;
};

const initialStore = {
  loading: false,
  error: null,
  total: null,
  chats: null,
  destinations: null,
  sales: null,
};

export const useDashboardStore = create<{
  loading: boolean;
  error: string | null;
  total: number | null;
  chats: ChatType | null;
  destinations: Record<string, number> | null;
  sales: SalesType | null;
  fetchChats: () => Promise<ChatType | null>;
  fetchDestinations: () => Promise<Record<string, number> | null>;
  fetchSales: () => Promise<SalesType | null>;
  clearStore: () => void;
}>((set, get) => ({
  ...initialStore,
  fetchChats: async () => {
    set({ loading: true });
    try {
      const response = await http("/ws/analytics/chat", {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          set({ chats: data.data });
          return data.data;
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message, total: null, chats: null });
    } finally {
      set({ loading: false });
    }
  },
  fetchDestinations: async () => {
    set({ loading: true });
    try {
      const response = await http("/ws/analytics/destinations", {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          set({ destinations: data.data });
          return data.data;
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message, total: null, destinations: null });
    } finally {
      set({ loading: false });
    }
  },
  fetchSales: async () => {
    set({ loading: true });
    try {
      const response = await http("/ws/analytics/sales", {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          set({ sales: data.data });
          return data.data;
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message, total: null, sales: null });
    } finally {
      set({ loading: false });
    }
  },
  clearStore: () => {
    set(initialStore);
  },
}));
