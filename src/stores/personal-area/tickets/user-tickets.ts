"use client";
import { create } from "zustand";
import { http } from "@/utils/http";
import { MANAGER_ROLES, AGENTS_ROLES } from "@/components/account/personal-area/_helpers/roles";

const initialStore = {
  loading: false,
  loadingAllTickets: false,
  loadingAllAccounts: false,
  error: null,
  chats: null,
  tickets: null,
  accounts: null,
  destinations: null,
  ticketsTotal: 0,
};

export const usePersonalAreaTicketsStore = create<{
  loading: boolean;
  ticketsTotal: number;
  loadingAllTickets: boolean;
  loadingAllAccounts: boolean;
  tickets: Record<string, any>[] | null;
  accounts: Record<string, any>[] | null;
  destinations: Record<string, number> | null;
  error: string | null;
  clearStore: () => void;
  fetchAllAccount: (callback: (data: any) => void) => Promise<void>;
  fetchAllTickets: (requestBody: Record<string, any>) => Promise<void>;
  fetchTypeOfPassengers: (callback: (data: any) => void) => Promise<void>;
  updateTicket: (requestBody: Record<string, any>, callback: (data: any) => void) => Promise<void>;
  fetchIncomeSum: (requestBody: Record<string, any>, callback: (data: any) => void) => Promise<void>;
  fetchAllSales: (requestBody: Record<string, any> | null, callback: (data: any) => void) => Promise<void>;
  fetchTicketsByPnrNumber: (requestBody: Record<string, any>, callback: (data: any) => void) => Promise<void>;
}>((set, get) => ({
  ...initialStore,

  fetchTypeOfPassengers: async (callback) => {
    try {
      set({ loading: true });
      const response = await http("/ws/selection/foms.ticket.passenger.type", {
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
      set({ error: e?.message || "An error occurred" });
    } finally {
      set({ loading: false });
    }
  },

  fetchAllTickets: async (requestBody) => {
    set({ tickets: null, ticketsTotal: 0, loadingAllTickets: true });

    try {
      const response = await http("/ws/rest/com.axelor.apps.mycrm.db.AirFile/search", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status == 0 && data.total > 0) {
          set({ tickets: data.data, ticketsTotal: data.total });
        }
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message || "An error occurred" });
    } finally {
      set({ loadingAllTickets: false });
    }
  },

  fetchTicketsByPnrNumber: async (requestBody, callback) => {
    try {
      set({ loading: true });
      const response = await http("/ws/rest/com.axelor.apps.mycrm.db.AirFile/search", {
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
      set({ error: e?.message || "An error occurred" });
    } finally {
      set({ loading: false });
    }
  },

  fetchIncomeSum: async (requestBody, callback) => {
    try {
      set({ loading: true });
      const response = await http("/ws/airfile/filter", {
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
      set({ error: e?.message || "An error occurred" });
    } finally {
      set({ loading: false });
    }
  },

  fetchAllSales: async (requestBody, callback) => {
    let primaryCriteria: Record<string, any>[] = [
      {
        fieldName: "roles.name",
        operator: "=",
        value: "Admin",
      },
    ];

    MANAGER_ROLES.forEach((roleName) => {
      const criteria = {
        fieldName: "roles.name",
        operator: "=",
        value: `${roleName}`,
      };

      primaryCriteria.push(criteria);
    });

    AGENTS_ROLES.forEach((roleName) => {
      const criteria = {
        fieldName: "roles.name",
        operator: "=",
        value: `${roleName}`,
      };

      primaryCriteria.push(criteria);
    });

    const secondaryRequest = {
      offset: 0,
      fields: ["id", "fullName", "name"],
      ...(primaryCriteria && {
        data: {
          operator: "or",
          criteria: primaryCriteria,
        },
      }),
    };

    try {
      const response = await http("/ws/rest/com.axelor.auth.db.User/search", {
        method: "POST",
        ...(!!requestBody ? { body: JSON.stringify(requestBody) } : { body: JSON.stringify(secondaryRequest) }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) callback(data); // Используем строгую проверку на равенство
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message || "An error occurred" });
    }
  },

  fetchAllAccount: async (callback) => {
    set({ loadingAllAccounts: true });
    try {
      const response = await http("/ws/rest/com.axelor.apps.base.db.Partner/search", {
        method: "POST",
        body: JSON.stringify({
          offset: 0,
          fields: ["id", "fullName", "name"],
          data: {
            criteria: [
              {
                fieldName: "partnerTypeSelect",
                operator: "=",
                value: "1",
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
      set({ error: e?.message || "An error occurred" });
    } finally {
      set({ loadingAllAccounts: false });
    }
  },

  updateTicket: async (requestBody: Record<string, any>, callback: Function) => {
    try {
      set({ loading: true });
      const response = await http(`/ws/airfile/update`, {
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
