"use client";
import { create } from "zustand";
import { TModelFilters } from "@/types/model";
import { http } from "@/utils/http";
import { TAppealModel } from "@/models/appeals/appeal";
import { MessageType } from "@/models/chat/chat";
import { chatStoresEvent } from "@/models/chat/chat";

const initialStore = {
  loading: false,
  error: null,
  total: null,
  items: null,
  item: null,
  appeals: [],
  socket: null,
  pingPong: "",
  socketInterval: null,
  newMessageClient: null,
  newMessageTone: null,
};

export type appealType = {
  id: number;
  name: string;
  firstMessage: MessageType | null;
  lastMessage: MessageType | null;
  chat: {
    id: number;
  } | null;
  lastUser: {
    id: number;
    fullName: string;
    code: string;
  } | null;
  phoneNumber: string;
  createdOn: any;
  updatedOn: any;
  saleOrder: {
    fullName: string;
    id: number;
    soStatus: string;
    version: number;
  } | null;
  loading: boolean;
};

export const useAppealsStore = create<{
  loading: boolean;
  error: string | null;
  total: number | null;
  item: TAppealModel | null;
  items: TAppealModel[] | null;
  appeals: appealType[];
  socket: any;
  pingPong: string;
  socketInterval: any;
  newMessageClient: HTMLAudioElement | null;
  newMessageTone: HTMLAudioElement | null;
  setAppealLoading: (appeal: appealType) => void;
  setNewMessageClient: (newAudio: HTMLAudioElement) => void;
  setNewMessageTone: (newAudio: HTMLAudioElement) => void;
  setItem: (item: TAppealModel | null) => void;
  getItems: (filters?: TModelFilters) => TAppealModel[] | null;
  fetchItems: (filters?: TModelFilters) => Promise<TAppealModel[] | null>;
  fetchItem: (id: number, signal: AbortSignal) => Promise<TAppealModel | null>;
  updateItem: (item: TAppealModel) => Promise<TAppealModel | null>;
  createAppeal: ({
    name,
    phoneNumber,
    status,
  }: {
    name: string;
    phoneNumber: string;
    status: string;
  }) => Promise<TAppealModel | null>;
  existenceCheckAppeal: ({ phoneNumber }: { phoneNumber: string }) => Promise<TAppealModel | null>;
  createChatAppeal: ({
    fromNumber,
    appealId,
    currentUserId,
  }: {
    fromNumber: string;
    appealId: number;
    currentUserId: { id: number };
  }) => Promise<any>;
  clearStore: () => void;
  startSocket: () => void;
  sendEvent: ({}: chatStoresEvent) => void;
  disconnect: () => void;
}>((set, get) => ({
  ...initialStore,
  setAppealLoading: (appeal) => {
    set({
      appeals: get().appeals.map((elappeal) => {
        if (elappeal.id === appeal.id) {
          return { ...elappeal, loading: true };
        }
        return appeal;
      }),
    });
  },
  setNewMessageClient: (newAudio: HTMLAudioElement) => {
    set({ newMessageClient: newAudio });
  },
  setNewMessageTone: (newAudio: HTMLAudioElement) => {
    set({ newMessageTone: newAudio });
  },
  setItem: (item: TAppealModel | null) => {
    set({ item });
  },
  getItems: (filters?: TModelFilters) => {
    if (!get().loading) get().fetchItems(filters);
    return get().items;
  },
  fetchItems: async () => {
    set({ loading: true });
    try {
      const response = await http("/ws/rest/com.axelor.apps.msg.db.Appeal", {
        method: "POST",
        body: JSON.stringify({
          offset: 0,
          limit: 12,
          sortBy: ["-updatedOn"],
          data: {
            _domain: "self.status = :status",
            _domainContext: {
              status: 1,
            },
          },
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          set({ appeals: data.data });
          return data.data;
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message, total: null, items: null });
    } finally {
      set({ loading: false });
    }
  },
  fetchItem: async (id: number, signal: AbortSignal) => {
    set({ loading: true });
    try {
      const response = await http(`/ws/rest/com.axelor.apps.msg.db.Appeal/${id}`, { signal });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0 && data.hasOwnProperty("data")) {
          set({ item: data.data[0], error: null });
          return data.data[0];
        } else {
          throw new Error(data.data?.message ?? "No data");
        }
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message, item: null });
    } finally {
      set({ loading: false });
    }
  },
  updateItem: async (item: TAppealModel) => {
    set({ loading: true });
    try {
      const response = await http(`/ws/rest/com.axelor.apps.msg.db.Appeal/${item.id}`, {
        method: "POST",
        body: JSON.stringify({ data: item }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          set({ item: data.data[0] });
          return data.data[0];
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message, total: null });
    } finally {
      set({ loading: false });
    }
  },
  createAppeal: async ({ name, phoneNumber, status }) => {
    set({ loading: true });
    try {
      let data = {
        data: {
          name,
          phoneNumber,
          status,
        },
      };
      const response = await http(`/ws/rest/com.axelor.apps.msg.db.Appeal`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          // set({ item: data.data[0] });
          return data.data[0];
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message, total: null });
    } finally {
      set({ loading: false });
    }
  },
  existenceCheckAppeal: async ({ phoneNumber }: { phoneNumber: string }) => {
    set({ loading: true });
    try {
      let data = {
        offset: 0,
        limit: 1,
        sortBy: ["-updatedOn"],
        data: {
          _domain: "self.phoneNumber = :phoneNumber",
          _domainContext: {
            phoneNumber,
          },
        },
      };

      const response = await http(`/ws/rest/com.axelor.apps.msg.db.Appeal/search`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          // set({ item: data.data[0] });
          return data.data[0];
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message, total: null });
    } finally {
      set({ loading: false });
    }
  },
  createChatAppeal: async ({
    fromNumber,
    appealId,
    currentUserId,
  }: {
    fromNumber: string;
    appealId: number;
    currentUserId: { id: number };
  }) => {
    set({ loading: true });
    try {
      let data = {
        data: {
          fromNumber,
          typeChats: 1,
          appeal: {
            id: appealId,
          },
          members: [currentUserId],
        },
      };
      const response = await http(`/ws/rest/com.axelor.apps.msg.db.Chat`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          // set({ item: data.data[0] });
          return data.data[0];
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      set({ error: e?.message, total: null });
    } finally {
      set({ loading: false });
    }
  },
  clearStore: () => {
    set(initialStore);
  },
  startSocket: () => {
    // set({ loading: true });
    if (
      !get().socket ||
      get().socket?.readyState === WebSocket.CLOSED ||
      get().socket?.readyState === WebSocket.CLOSING
    ) {
      let s = new WebSocket("wss://" + process.env.NEXT_PUBLIC_CHAT_URL + "/appeals");
      s.onopen = async function () {
        s.send(JSON.stringify({ event: "Ping" }));
        get().socketInterval = setInterval(() => {
          s.send(JSON.stringify({ event: "Ping" }));
          set({ pingPong: "Ping" });
          setTimeout(() => {
            let pingPong = get().pingPong;
            if (pingPong === "Ping") {
              s.close();
            } else {
            }
          }, 2000);
        }, 10000);
        s.send(JSON.stringify({ event: "AllAppeals" }));
      };

      s.onmessage = function (event: any) {
        let data: any = JSON.parse(event.data);
        switch (data.event) {
          case "PONG":
            set({ pingPong: "PONG" });
            break;
          case "AllAppeals":
            if (data.appeals.length > 0) {
              set({
                appeals: data.appeals.map((appeal: appealType) => {
                  return { ...appeal, loading: false };
                }),
              });
            }
            set({ loading: false });
            break;
          case "newMessageAppeal":
            set({
              appeals: get().appeals.map((appeal) => {
                if (appeal?.chat?.id === data.newMessage.chat.id) {
                  return { ...appeal, lastMessage: data.newMessage };
                }
                return appeal;
              }),
            });
            get().newMessageTone?.play();
            break;
          case "workAppeal":
            set({ appeals: get().appeals.filter((el) => el.id !== data.appeal.id) });
            break;
          case "newAppeal":
            let newAppeals = get().appeals;
            newAppeals?.unshift({ ...data.newAppeal, loading: false });
            newAppeals?.sort((a: appealType, b: appealType) => {
              if (a?.lastMessage && b?.lastMessage) {
                return a?.updatedOn - b?.updatedOn;
              }
              return 0;
            });
            set({ appeals: [...newAppeals] });
            get().newMessageClient?.play();
            break;
          case "newAllAppeals":
            break;
        }
      };

      s.onclose = function (event: CloseEvent) {
        clearInterval(get().socketInterval);
        setInterval(() => {
          get().startSocket();
        }, 3000);
        console.log("Соединение прервано");
      };

      s.onerror = function () {
        console.log("error");
      };
      set(() => ({ socket: s }));
    }
  },
  sendEvent: ({ event, data }: chatStoresEvent) => {
    if (get().socket?.readyState === WebSocket.OPEN) {
      get().socket.send(JSON.stringify({ event: event, data }));
    } else {
      console.error("WebSocket connection is not open.");
    }
  },
  disconnect: () => {
    get().socket?.close();
  },
}));
