"use client";
import { create } from "zustand";

const initialStore = {
  loading: false,
  error: null,
  success: null,
};

export const useCardStore = create<{
  loading: boolean;
  error: string | null;
  setLoading: (newStatus: boolean) => void;
}>((set, get) => ({
  ...initialStore,
  setLoading: (newStatus: boolean) => {
    set({ loading: newStatus });
  },
}));
