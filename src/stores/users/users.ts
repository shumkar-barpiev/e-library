import { create } from "zustand";
import { http } from "@/utils/http";
import { TUserModel } from "@/models/user/user";

const initialStore = {
  loading: false,
  error: null,
};

export const useUserStore = create<{
  loading: boolean;
  error: string | null;
  deleteItem: (id: TUserModel["id"]) => Promise<void>;
  fetchItem: (id: number) => Promise<TUserModel | null>;
  createItem: (data: TUserModel) => Promise<TUserModel | null>;
  updateItem: (item: TUserModel) => Promise<TUserModel | null>;
  fetchAllUsers: (callback: (data: any) => void) => Promise<void>;
  fetchUser: (id: number | null, callback: (data: any) => void) => Promise<void>;
  getCurrentUserId: (callback: (data: Record<string, any>) => void) => Promise<void>;
  fetchUserProfileImage: (id: number | null, callback: (data: any) => void) => Promise<void>;
  getUserBonus: (requestBody: Record<string, any>, callback: (data: any) => void) => Promise<void>;
  updateUserProfile: (requestBody: Record<string, any>, callback: (data: any) => void) => Promise<void>;
  clearStore: () => void;
}>((set) => ({
  ...initialStore,
  fetchItem: async (id: number) => {
    try {
      set({ loading: true });

      const response = await http(`/ws/rest/com.axelor.apps.base.db.Partner/${id}`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          return data.data[0] ?? null;
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

  updateItem: async (item: TUserModel) => {
    set({ loading: true });
    try {
      const response = await http("/ws/rest/com.axelor.apps.base.db.Partner", {
        method: "POST",
        body: JSON.stringify({
          data: item,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          return data.data[0];
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

  createItem: async (data) => {
    set({ loading: true });
    try {
      const response = await http("/ws/rest/com.axelor.apps.base.db.Partner", {
        method: "POST",
        body: JSON.stringify({
          data: data,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          return data.data[0];
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

  deleteItem: async (id: TUserModel["id"]) => {
    set({ loading: true });
    try {
      const response = await http(`/ws/rest/com.axelor.apps.base.db.Partner/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status !== 0) {
          throw new Error(data.data?.message ?? data.data);
        }
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchUser: async (id: number | null, callback: Function) => {
    try {
      set({ loading: true });
      const response = await http(`/ws/rest/com.axelor.auth.db.User/${id}/fetch`, {
        method: "POST",
        body: JSON.stringify({
          fields: [
            "employee",
            "group",
            "email",
            "roles",
            "image",
            "language",
            "homeAction",
            "activeCompany",
            "partner.balance",
            "partner.lastName",
            "partner.firstName",
            "partner.softSkill",
            "partner.middleName",
            "electronicSignature",
            "partner.responsibility",
            "partner.companyDepartment",
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

  fetchAllUsers: async (callback) => {
    set({ loading: true });
    try {
      const response = await http(`/ws/rest/com.axelor.auth.db.User/search`, {
        method: "POST",
        body: JSON.stringify({
          offset: 0,
          fields: ["partner"],
        }),
      });

      if (response.ok) {
        let data = await response.json();
        callback(data);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchUserProfileImage: async (id: number | null, callback: Function) => {
    set({ loading: true });
    try {
      const response = await http(`/ws/user/profile/photo/${id}`, {
        method: "GET",
      });

      if (response.ok) {
        let data = await response.text();
        callback(data);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ loading: false });
    }
  },

  getCurrentUserId: async (callback: Function) => {
    const response = await http("/ws/user/id", {
      method: "GET",
    });
    if (response.ok) {
      let data = await response.json();
      callback(data);
    }
  },

  updateUserProfile: async (requestBody: Record<string, any>, callback: Function) => {
    try {
      set({ loading: true });

      const response = await http(`/ws/v2/rest/com.axelor.auth.db.User`, {
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

  getUserBonus: async (requestBody, callback) => {
    try {
      set({ loading: true });

      const response = await http("/ws/bonus/filter", {
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

  clearStore: () => {
    set(initialStore);
  },
}));
