import { create } from "zustand";
import { http } from "@/utils/http";

interface FetchResponseBody<D = any> {
  status?: number;
  data?: D;
}

type TOrderDetailsInvoiceStoreModel = {
  loading: boolean;
  error: string | null;
  fetchInvoiceId: ({
    saleOrderId,
    currencyId,
    languageCode,
  }: {
    saleOrderId: number;
    currencyId: number;
    companyId: number;
    languageCode: string;
  }) => Promise<number | null>;
  fetchPdf: ({
    saleOrderId,
    className,
    template,
  }: {
    saleOrderId: number;
    className?: string;
    template?: string;
  }) => Promise<FetchResponseBody | null>;
  signPdf: ({ fileName, userId }: { fileName: string; userId?: number }) => Promise<FetchResponseBody | null>;
};

export const useOrderDetailsInvoiceStore = create<TOrderDetailsInvoiceStoreModel>((set) => ({
  loading: false,
  error: null,
  fetchInvoiceId: async ({ saleOrderId, currencyId, languageCode, companyId }) => {
    try {
      set({ loading: true });

      const response = await http(`/ws/export/tmp-doc/${saleOrderId}`, {
        method: "POST",
        body: JSON.stringify({
          currId: currencyId,
          lang: languageCode,
          companyId: companyId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          set(() => ({ error: null, loading: false }));
          return data.data?.id;
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ loading: false });
    }

    return null;
  },
  fetchPdf: async ({
    saleOrderId,
    className = "com.axelor.apps.sale.db.SaleOrder",
    template = "invoiceForPayment.docx",
  }) => {
    try {
      set({ loading: true });

      const response = await http(
        `/ws/document/prepare?objectId=${saleOrderId}&className=${className}&template=${template}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          set(() => ({ error: null, loading: false }));
          return data;
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ loading: false });
    }

    return null;
  },
  signPdf: async ({ fileName }) => {
    try {
      set({ loading: true });

      const response = await http(`/ws/document/conversion?fileName=${fileName}`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          set(() => ({ error: null, loading: false }));
          return data;
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ loading: false });
    }

    return null;
  },
}));
