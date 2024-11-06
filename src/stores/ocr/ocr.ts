import { create } from "zustand";
import { http } from "@/utils/http";
import { TOcrChatModel } from "@/models/ocr/ocr";

const initialStore = {
  ocrRouteLoading: false,
  ocrTicketLoading: false,
  loading: false,
  error: null,
};

export const useOcrStore = create<{
  ocrRouteLoading: boolean;
  ocrTicketLoading: boolean;
  error: string | null;
  ocrRouteAndReservation: (id: number, body: FormData) => Promise<any>;
  ocrTicketDetails: (body: FormData) => Promise<TOcrChatModel[]>;
}>((set) => ({
  ...initialStore,
  ocrRouteAndReservation: async (id: number, body: FormData) => {
    try {
      set({ ocrRouteLoading: true });
      const response = await http(`/ws/ocr/image/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: body,
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          return data.data;
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ ocrRouteLoading: false });
    }
  },
  ocrTicketDetails: async (body: FormData) => {
    try {
      set({ ocrTicketLoading: true });
      const response = await http(`/ws/ocr/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: body,
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          return data.data;
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ ocrTicketLoading: false });
    }
  },
}));
