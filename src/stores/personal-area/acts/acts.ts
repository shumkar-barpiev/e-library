import { create } from "zustand";
import { http } from "@/utils/http";

const initialStore = {
  acts: null,
  error: null,
  actsTotal: 0,
  actsDone: null,
  loading: false,
  statuses: null,
  actsDoneTotal: 0,
  loadingNews: false,
};

type ActsStoreType = {
  loading: boolean;
  actsTotal: number;
  loadingNews: boolean;
  error: string | null;
  actsDoneTotal: number;
  clearStore: () => void;
  acts: Record<string, any>[] | null;
  actsDone: Record<string, any>[] | null;
  statuses: Record<string, any>[] | null;
  fetchStatuses: (callback: (data: any) => void) => Promise<void>;
  fetchAccountants: (callback: (data: any) => void) => Promise<void>;
  fetchClientTypes: (callback: (data: any) => void) => Promise<void>;
  deleteAct: (actId: number, callback: (data: any) => void) => Promise<void>;
  fetchActById: (actId: number, callback: (data: any) => void) => Promise<void>;
  getStartDateOfAct: (id: number, callback: (data: any) => void) => Promise<void>;
  fetchActLineById: (actId: number, callback: (data: any) => void) => Promise<void>;
  fetchActs: (requestBody: Record<string, any> | null, type: string) => Promise<void>;
  fetchNewCreatedActsCount: (id: number, callback: (data: any) => void) => Promise<void>;
  updateAct: (requestBody: Record<string, any>, callback: (data: any) => void) => Promise<void>;
  createAct: (requestBody: Record<string, any>, callback: (data: any) => void) => Promise<void>;
  updateActLine: (requestBody: Record<string, any>, callback: (data: any) => void) => Promise<void>;
  fetchClientGroups: (requestBody: Record<string, any>, callback: (data: any) => void) => Promise<void>;
  updateOrganizationBalance: (requestBody: Record<string, any>, callback: (data: any) => void) => Promise<void>;
};

export const useUserActsStore = create<ActsStoreType>((set) => ({
  ...initialStore,

  fetchNewCreatedActsCount: async (accountantId, callback) => {
    set({ loading: true });
    try {
      const response = await http("/ws/rest/com.axelor.apps.mycrm.db.Act/search", {
        method: "POST",
        body: JSON.stringify({
          data: {
            operator: "and",
            criteria: [
              {
                fieldName: "status",
                operator: "=",
                value: "created",
              },
              {
                fieldName: "accountant.id",
                operator: "=",
                value: `${accountantId}`,
              },
            ],
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

  fetchActs: async (requestBody, type) => {
    set({ loading: true });
    try {
      const response = await http("/ws/rest/com.axelor.apps.mycrm.db.Act/search", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          if (type === "inProgress") {
            set({ acts: data.data, actsTotal: data.total });
          }
          if (type === "done") {
            set({ actsDone: data.data, actsDoneTotal: data.total });
          }
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

  fetchActById: async (id, callback) => {
    try {
      set({ loading: true });
      const response = await http(`/ws/rest/com.axelor.apps.mycrm.db.Act/${id}/fetch`, {
        method: "POST",
        body: JSON.stringify({
          fields: [
            "id",
            "status",
            "endDate",
            "actLines",
            "startDate",
            "invNumber",
            "accountant",
            "balanceAfter",
            "organization",
            "balanceBefore",
            "chiefAccountant",
            "approvedAcc",
            "approvedSub",
          ],
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

  fetchActLineById: async (id, callback) => {
    try {
      set({ loading: true });
      const response = await http(`/ws/rest/com.axelor.apps.mycrm.db.ActLine/${id}/fetch`, {
        method: "POST",
        body: JSON.stringify({
          fields: ["id", "debit", "credit", "airFiles", "verified", "invNumber", "conversation", "whoStartedCon"],
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

  fetchStatuses: async (callback) => {
    set({ loading: true });
    try {
      const response = await http("/ws/selection/foms.atc.status.type", {
        method: "POST",
        body: JSON.stringify({
          translate: false,
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

  fetchClientTypes: async (callback) => {
    set({ loading: true });
    try {
      const response = await http("/ws/selection/directories.type.client.select", {
        method: "POST",
        body: JSON.stringify({
          translate: true,
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

  fetchClientGroups: async (requestBody, callback) => {
    set({ loading: true });
    try {
      const response = await http("/ws/rest/com.axelor.apps.directories.db.ClientGroup/search", {
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

  fetchAccountants: async (callback) => {
    set({ loading: true });
    try {
      const response = await http("/ws/rest/com.axelor.auth.db.User/search", {
        method: "POST",
        body: JSON.stringify({
          offset: 0,
          data: {
            criteria: [
              {
                operator: "or",
                criteria: [
                  {
                    fieldName: "roles.name",
                    operator: "=",
                    value: "SpecialistACC",
                  },
                  {
                    fieldName: "roles.name",
                    operator: "=",
                    value: "Finance SUB",
                  },
                ],
              },
            ],
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

  getStartDateOfAct: async (id, callback) => {
    set({ loading: true });
    try {
      const response = await http(`/ws/act/date/${id}`, {
        method: "GET",
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

  createAct: async (requestBody, callback) => {
    set({ loading: true });
    try {
      const response = await http("/ws/act/create", {
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

  deleteAct: async (actId, callback) => {
    set({ loading: true });
    try {
      const response = await http(`/ws/rest/com.axelor.apps.mycrm.db.Act/${actId}`, {
        method: "DELETE",
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

  updateActLine: async (requestBody, callback) => {
    try {
      set({ loading: true });
      const response = await http("/ws/v2/rest/com.axelor.apps.mycrm.db.ActLine", {
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

  updateAct: async (requestBody, callback) => {
    try {
      set({ loading: true });
      const response = await http("/ws/v2/rest/com.axelor.apps.mycrm.db.Act", {
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

  updateOrganizationBalance: async (requestBody, callback) => {
    try {
      set({ loading: true });
      const response = await http("/ws/v2/rest/com.axelor.apps.base.db.Partner", {
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
