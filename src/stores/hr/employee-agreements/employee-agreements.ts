import { create } from "zustand";
import { http } from "@/utils/http";

const initialStore = {
  error: null,
  loading: false,
  agreementsTotal: 0,
  reloadAgreementsTable: false,
};

type AgreementsStoreType = {
  loading: boolean;
  error: string | null;
  clearStore: () => void;
  agreementsTotal: number;
  reloadAgreementsTable: boolean;
  setReloadAgreementsTable: (value: boolean) => void;
  fetchDepartments: (callback: (data: any) => void) => Promise<void>;
  fetchTemplatesType: (callback: (data: any) => void) => Promise<void>;
  fetchEmployeeStages: (callback: (data: any) => void) => Promise<void>;
  deleteAgreement: (agreementId: number, callback: (data: any) => void) => Promise<void>;
  fetchAgreementById: (agreementId: number, callback: (data: any) => void) => Promise<void>;
  getDocument: (params: Record<string, any>, callback: (data: any) => void) => Promise<void>;
  generateDocument: (params: Record<string, any>, callback: (data: any) => void) => Promise<void>;
  fetchTemplate: (requestBody: Record<string, any>, callback: (data: any) => void) => Promise<void>;
  fetchEmployees: (requestBody: Record<string, any>, callback: (data: any) => void) => Promise<void>;
  createAgreement: (requestBody: Record<string, any>, callback: (data: any) => void) => Promise<void>;
  fetchAgreements: (requestBody: Record<string, any>, callback: (data: any) => void) => Promise<void>;
};

export const useEmployeeAgreementsStore = create<AgreementsStoreType>((set) => ({
  ...initialStore,

  setReloadAgreementsTable: (value: boolean) => set({ reloadAgreementsTable: value }),

  fetchDepartments: async (callback) => {
    try {
      set({ loading: true });
      const response = await http("/ws/rest/com.axelor.auth.db.Group/search", {
        method: "POST",
        body: JSON.stringify({
          fields: ["id", "name", "code"],
          data: {
            _domain: "self.code != 'SUBA'",
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

  fetchEmployeeStages: async (callback) => {
    try {
      set({ loading: true });
      const response = await http("/ws/selection/base.user.form.step.select", {
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

  fetchEmployees: async (requestBody, callback) => {
    try {
      set({ loading: true });
      const response = await http("/ws/rest/com.axelor.auth.db.User/search", {
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

  fetchAgreementById: async (agreementId, callback) => {
    set({ loading: true });
    try {
      const response = await http(`/ws/rest/com.axelor.apps.hr.db.EmploymentContract/${agreementId}/fetch`, {
        method: "POST",
        body: JSON.stringify({
          fields: [
            "id",
            "partner",
            "dmsFile",
            "fullName",
            "template",
            "createdOn",
            "createdBy",
            "employeeUser",
            "conversation",
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

  deleteAgreement: async (agreementId, callback) => {
    try {
      set({ loading: true });
      const response = await http(`/ws/rest/com.axelor.apps.hr.db.EmploymentContract/${agreementId}`, {
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

  getDocument: async (params, callback) => {
    try {
      set({ loading: true });
      const response = await http(`/ws/dms/inline/${params?.documentId}`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.arrayBuffer();
        const byteArray = new Uint8Array(data);
        callback(byteArray);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message });
    } finally {
      set({ loading: false });
    }
  },

  generateDocument: async (params, callback) => {
    try {
      set({ loading: true });
      const response = await http(`/ws/template/${params?.templateId}/model/${params?.agreementId}`, {
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

  fetchTemplatesType: async (callback) => {
    try {
      set({ loading: true });
      const response = await http("/ws/selection/select-template-rule-type", {
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

  fetchTemplate: async (requestBody, callback) => {
    try {
      set({ loading: true });
      const response = await http("/ws/rest/com.axelor.apps.base.db.TemplateRule/search", {
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

  createAgreement: async (requestBody, callback) => {
    try {
      set({ loading: true });
      const response = await http("/ws/rest/com.axelor.apps.hr.db.EmploymentContract", {
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

  fetchAgreements: async (requestBody, callback) => {
    try {
      set({ loading: true });
      const response = await http("/ws/rest/com.axelor.apps.hr.db.EmploymentContract/search", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        set({ agreementsTotal: data.total, reloadAgreementsTable: false });
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
