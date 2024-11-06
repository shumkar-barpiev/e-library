import { create } from "zustand";
import { http } from "@/utils/http";

const initialStore = {
  loading: false,
  error: null,
};

export const useUserAttendanceStore = create<{
  loading: boolean;
  error: string | null;
  getUserAttendance: (callback: (data: Record<string, any>) => void) => Promise<void>;
  fetchAttendanceAppeals: (callback: (data: Record<string, any>) => void) => Promise<void>;
  fetchUserAttendanceById: (id: number, callback: (data: Record<string, any>) => void) => Promise<void>;
  createAttendance: (requestBody: Record<string, any>, callback: (data: Record<string, any>) => void) => Promise<void>;

  clearStore: () => void;
}>((set) => ({
  ...initialStore,
  getUserAttendance: async (callback) => {
    try {
      set({ loading: true });
      const response = await http(`/ws/attendances`, {
        method: "GET",
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

  fetchUserAttendanceById: async (id, callback) => {
    set({ loading: true });
    try {
      const response = await http(`/ws/rest/com.axelor.apps.mycrm.db.Attendance/${id}/fetch`, {
        method: "POST",
        body: JSON.stringify({
          fields: ["id", "date", "comingTime", "leaveTime", "conversation", "employeeId"],
        }),
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

  fetchAttendanceAppeals: async (callback) => {
    set({ loading: true });
    try {
      const response = await http("/ws/rest/com.axelor.apps.mycrm.db.WorkScheduleLine/search", {
        method: "POST",
        body: JSON.stringify({
          data: {
            _domain: "self.conversation is not empty",
          },
        }),
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

  createAttendance: async (requestBody, callback) => {
    set({ loading: true });
    try {
      const response = await http("/ws/rest/com.axelor.apps.mycrm.db.Attendance", {
        method: "PUT",
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
