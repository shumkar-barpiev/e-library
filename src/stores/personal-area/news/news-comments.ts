import { create } from "zustand";
import { http } from "@/utils/http";

const initialStore = {
  error: null,
  newsTotal: 0,
  comments: null,
  loading: false,
  loadingNews: false,
};

type NewsCommentsStoreType = {
  loading: boolean;
  newsTotal: number;
  loadingNews: boolean;
  error: string | null;
  clearStore: () => void;
  comments: Record<string, any>[] | null;
  deleteComment: (commentId: number, callback: (data: any) => void) => Promise<void>;
  deleteReplyComment: (commentId: number, callback: (data: any) => void) => Promise<void>;
  replyComment: (requestBody: Record<string, any>, callback: (data: any) => void) => Promise<void>;
  createComment: (requestBody: Record<string, any>, callback: (data: any) => void) => Promise<void>;
};

export const useUserNewsCommentsStore = create<NewsCommentsStoreType>((set) => ({
  ...initialStore,

  createComment: async (requestBody, callback) => {
    set({ loading: true });
    try {
      const response = await http("/ws/rest/com.axelor.apps.mycrm.db.Comment", {
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

  replyComment: async (requestBody, callback) => {
    set({ loading: true });
    try {
      const response = await http("/ws/rest/com.axelor.apps.mycrm.db.ReplyComment", {
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

  deleteComment: async (commentId, callback) => {
    set({ loading: true });
    try {
      const response = await http(`/ws/rest/com.axelor.apps.mycrm.db.Comment/${commentId}`, {
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

  deleteReplyComment: async (commentId, callback) => {
    set({ loading: true });
    try {
      const response = await http(`/ws/rest/com.axelor.apps.mycrm.db.ReplyComment/${commentId}`, {
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

  clearStore: () => {
    set(initialStore);
  },
}));
