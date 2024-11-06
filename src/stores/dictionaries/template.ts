import { create } from "zustand";
import { persist } from "zustand/middleware";
import { http } from "@/utils/http";

export interface TemplateType {
  id: number;
  name: string;
}

export interface DocumentType {
  success: boolean;
  data: {
    downloadUrl: null;
    editUrl: string;
    viewUrl: string;
    fileName: string;
    pdfUrl: string;
  };
  document: string;
}

const initialStore = {
  loading: false,
  error: null,
  total: null,
  templates: [],
  document: null,
};

export const useTemplateStore = create(
  persist<{
    templates: TemplateType[];
    document: DocumentType | null;
    error: string | null;
    total: string | null;
    loading: boolean;
    getTemplate: (saleOrderId: number) => Promise<void>;
    getDocument: (templateId: number, saleOrderId: number) => Promise<DocumentType>;
  }>(
    (set, get) => ({
      ...initialStore,
      getTemplate: async (saleOrderId: number) => {
        set({ loading: true });
        try {
          const response = await http("/ws/template/" + saleOrderId, {
            method: "GET",
          });

          if (response.ok) {
            const data = await response.json();
            if (data.codeStatus === 200) set({ error: null, templates: data.object });
            else throw new Error(data.data?.message ?? data.data);
            set({ loading: false });
          } else {
            throw new Error(`${response.status} ${response.statusText}`);
          }
        } catch (e: any) {
          set({ error: e?.message });
        }
      },
      getDocument: async (templateId: number, saleOrderId: number) => {
        set({ loading: true });
        try {
          const response = await http(`/ws/template/${templateId}/saleorder/${saleOrderId}`, {
            method: "GET",
          });

          set({ loading: false });
          if (response.ok) {
            const data = await response.json();
            if (data.codeStatus === 200) {
              set({ error: null, document: data.object });
              return data.object;
            } else throw new Error(data.data?.message ?? data.data);
          } else {
            throw new Error(`${response.status} ${response.statusText}`);
          }
        } catch (e: any) {
          set({ error: e?.message });
        }
      },
    }),
    {
      name: "useTemplateStore",
    }
  )
);
