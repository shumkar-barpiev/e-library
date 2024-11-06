import { create } from "zustand";
import { http } from "@/utils/http";

const initialStore = {
  error: null,
  loading: false,
};

type MetaFileStoreType = {
  loading: boolean;
  error: string | null;
  clearStore: () => void;
  getFile: (fileId: number) => Promise<Record<string, any> | null>;
  saveFile: (file: File, request: { data: { fileName: string } }) => Promise<Record<string, any> | null>;
};

export const useMetaFileStore = create<MetaFileStoreType>((set) => ({
  ...initialStore,
  getFile: async (fileId) => {
    set({ loading: true });
    try {
      const response = await http(`/ws/rest/com.axelor.meta.db.MetaFile/${fileId}/content/download`, {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.ok) {
        const data = await response.blob();
        return data;
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

  saveFile: async (file, request) => {
    set({ loading: true });
    let headers = {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    };

    const formData = new FormData();

    formData.append("file", file);
    formData.append("field", "content");
    formData.append("request", JSON.stringify(request));

    try {
      const response = await http("/ws/rest/com.axelor.meta.db.MetaFile/upload", {
        method: "POST",
        body: formData,
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
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

  clearStore: () => {
    set(initialStore);
  },
}));
