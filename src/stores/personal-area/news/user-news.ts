import { create } from "zustand";
import { http } from "@/utils/http";

const initialStore = {
  news: null,
  error: null,
  newsTotal: 0,
  loading: false,
  loadingNews: false,
};

type NewsStoreType = {
  loading: boolean;
  newsTotal: number;
  loadingNews: boolean;
  error: string | null;
  clearStore: () => void;
  news: Record<string, any>[] | null;
  fetchAllNews: (requestBody: Record<string, any>) => Promise<void>;
  fetchNewsById: (newsId: number, callback: (data: any) => void) => Promise<void>;
  deleteNews: (newsId: number | null, callback: (data: any) => void) => Promise<void>;
  createNews: (requestBody: Record<string, any>, callback: (data: any) => void) => Promise<void>;
  updateNews: (requestBody: Record<string, any>, callback: (data: any) => void) => Promise<void>;
  confirmTheNewsFollower: (requestBody: Record<string, any>, callback: (data: any) => void) => Promise<void>;
};

export const useUserNewsStore = create<NewsStoreType>((set) => ({
  ...initialStore,

  fetchAllNews: async (requestBody) => {
    set({ news: null, loading: true });
    try {
      const response = await http("/ws/rest/com.axelor.apps.mycrm.db.Publication/search", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status == 0 && data.total > 0) {
          set({ newsTotal: data.total, news: data.data });
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchNewsById: async (newsId, callback) => {
    set({ loading: true });
    try {
      const response = await http(`/ws/rest/com.axelor.apps.mycrm.db.Publication/${newsId}/fetch`, {
        method: "POST",
        body: JSON.stringify({
          fields: [
            "image",
            "video",
            "forWhom",
            "pubTopic",
            "createdBy",
            "comments",
            "createdOn",
            "pubStatus",
            "attachment",
            "description",
            "trackablePub",
            "viewHistories",
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          callback(data);
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ loading: false });
    }
  },

  createNews: async (requestBody, callback) => {
    set({ loading: true });
    try {
      const response = await http("/ws/rest/com.axelor.apps.mycrm.db.Publication", {
        method: "PUT",
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          callback(data);
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ loading: false });
    }
  },

  updateNews: async (requestBody, callback) => {
    set({ loading: true });
    try {
      const response = await http("/ws/v2/rest/com.axelor.apps.mycrm.db.Publication", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        callback(data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ loading: false });
    }
  },

  deleteNews: async (newsId, callback) => {
    set({ loading: true });
    try {
      const response = await http(`/ws/rest/com.axelor.apps.mycrm.db.Publication/${newsId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          callback(data);
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ loading: false });
    }
  },

  confirmTheNewsFollower: async (requestBody, callback) => {
    set({ loading: true });
    try {
      const response = await http("/ws/rest/com.axelor.apps.mycrm.db.PublicationViewHistory", {
        method: "PUT",
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          callback(data);
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ loading: false });
    }
  },

  clearStore: () => {
    set(initialStore);
  },
}));
