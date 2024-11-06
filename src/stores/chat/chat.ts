"use client";
import { http } from "@/utils/http";
import { create } from "zustand";
import {
  ClientType,
  ColleaguesModel,
  ContactlastMessage,
  MemberType,
  addChatContactsType,
  chatStoresEvent,
  chatType,
  clientContactType,
  departMentType,
  httpStatusEnum,
  statusMessageEnum,
  successMessageEnum,
  templateType,
} from "@/models/chat/chat";
import { getStatusTemplate } from "@/components/chat/helpers/helpers";
import { MessageType, templateButton } from "@/models/chat/chat";

type chatStores = {
  pingPong: string;
  chatloading: boolean;
  messageLoading: boolean;
  loadingTemplateMessage: boolean;
  addClientLoading: boolean;
  transferLoading: boolean;
  templateLoading: boolean;
  completedLoading: boolean;
  sendMessageLoading: boolean;
  status: { variant: statusMessageEnum; value: httpStatusEnum };
  errorMessage: string | null;
  successMessage: successMessageEnum | null;
  currentUserId: {
    id: number;
  } | null;
  socket: any;
  chats: [ClientType[], ColleaguesModel[]];
  chatsLoading: boolean;
  chat: chatType;
  messages: MessageType[];
  messagesTotal: number | null;
  answerSelectMessage: MessageType | null;
  scrollTop: any;
  contacts: addChatContactsType | null;
  departMents: departMentType[];
  clients: clientContactType[];
  socketInterval: any;
  selectedContactGroup: number;
  newMessageTone: HTMLAudioElement | null;
  newMessageToneCollega: HTMLAudioElement | null;
  templates: templateType[];
  createSuccessTemplate: templateType | null;
  setAddClientLoading: (value: boolean) => void;
  setTransferLoading: (value: boolean) => void;
  setSendMessageLoading: (value: boolean) => void;
  setLoadingTemplateMessage: (value: boolean) => void;
  setChatsLoading: (value: boolean) => void;
  setStatus: (variant: statusMessageEnum, value: httpStatusEnum) => void;
  setCompletedLoading: (value: boolean) => void;
  setMessageLoading: (value: boolean) => void;
  setChatLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
  setSuccess: (value: successMessageEnum | null) => void;
  setContacts: (value: addChatContactsType | null) => void;
  setScrollTop: (value: number | null) => void;
  setAnswerSelectMessage: (value: MessageType | null) => void;
  setNewMessageTone: (newAudio: HTMLAudioElement) => void;
  setNewMessageToneCollega: (newAudio: HTMLAudioElement) => void;
  setSelectedContactGroups: (num: number) => void;
  getCurrentUserId: () => void;
  startSocket: () => void;
  disconnect: () => void;
  sendEvent: ({}: chatStoresEvent) => void;
  getCall: (id: number) => any;
  setChat: (newChat: chatType) => void;
};

export const useChatStore = create<chatStores>()((set, get) => ({
  pingPong: "",
  chatloading: true,
  messageLoading: true,
  loadingTemplateMessage: false,
  addClientLoading: false,
  transferLoading: false,
  templateLoading: true,
  completedLoading: false,
  sendMessageLoading: false,
  status: { variant: statusMessageEnum.noStatus, value: httpStatusEnum.noStatus },
  errorMessage: null,
  successMessage: null,
  currentUserId: null,
  socket: null,
  chats: [[], []],
  chatsLoading: false,
  chat: null,
  messages: [],
  messagesTotal: null,
  answerSelectMessage: null,
  scrollTop: null,
  contacts: null,
  departMents: [],
  clients: [],
  socketInterval: null,
  selectedContactGroup: 1,
  newMessageTone: null,
  newMessageToneCollega: null,
  templates: [],
  createSuccessTemplate: null,
  setAddClientLoading: (value) => {
    set({ addClientLoading: value });
  },
  setTransferLoading: (value) => {
    set({ transferLoading: value });
  },
  setSendMessageLoading: (value) => {
    set({ sendMessageLoading: value });
  },
  setLoadingTemplateMessage: (value: boolean) => {
    set({ loadingTemplateMessage: value });
  },
  setChatsLoading: (value: boolean) => {
    set({ chatsLoading: value });
  },
  setCompletedLoading: (value) => {
    set({ completedLoading: value });
  },
  setMessageLoading: (value) => {
    set({ messageLoading: value });
  },
  getCurrentUserId: async () => {
    const response = await http("/ws/user/id", {
      method: "GET",
    });
    if (response.ok) {
      let jsondata = await response.json();
      let currentUser = jsondata.data;
      set({ currentUserId: currentUser });
    } else {
      set({ currentUserId: null });
    }
  },
  setNewMessageTone: (newAudio: HTMLAudioElement) => {
    set({ newMessageTone: newAudio });
  },
  setNewMessageToneCollega: (newAudio: HTMLAudioElement) => {
    set({ newMessageToneCollega: newAudio });
  },
  setChat: async (newChat: chatType) => {
    set({ chat: newChat, chatloading: true, messageLoading: true });
  },
  setSelectedContactGroups: (num: number) => {
    set({ selectedContactGroup: num });
  },
  setChatLoading: (value: boolean) => {
    set({ chatloading: value });
  },
  setStatus: (variant: statusMessageEnum, value: httpStatusEnum) => {
    set({ status: { variant, value } });
  },
  setError: (value: string | null) => {
    set({ errorMessage: value });
  },
  setSuccess: (value: successMessageEnum | null) => {
    set({ successMessage: value });
  },
  setContacts: (value: addChatContactsType | null) => {
    set({ contacts: value });
  },
  setScrollTop: (value: number | null) => {
    set({ scrollTop: value });
  },
  setAnswerSelectMessage: (value: MessageType | null) => {
    set({ answerSelectMessage: value });
  },
  startSocket: () => {
    // set({ loading: true });
    if (
      !get().socket ||
      get().socket?.readyState === WebSocket.CLOSED ||
      get().socket?.readyState === WebSocket.CLOSING
    ) {
      let s = new WebSocket("wss://" + process.env.NEXT_PUBLIC_CHAT_URL + "/ws");
      s.onopen = async function () {
        s.send(JSON.stringify({ event: "Ping" }));
        get().socketInterval = setInterval(() => {
          s.send(JSON.stringify({ event: "Ping" }));
          set({ pingPong: "Ping" });
          setTimeout(() => {
            let pingPong = get().pingPong;
            if (pingPong === "Ping") {
              // console.log("close");
              s.close();
            } else {
              // console.log("соединение есть!");
            }
          }, 2000);
        }, 10000);
        get().getCurrentUserId();
      };

      s.onmessage = function (event: any) {
        let data: any = JSON.parse(event.data);
        switch (data.event) {
          case "PONG":
            set({ pingPong: "PONG" });
            break;
          case "allChats":
            set({ chatsLoading: false });
            let Colleagues: ColleaguesModel[] = data.Colleagues;
            let Clients: ClientType[] = data.Clients;
            Colleagues?.sort((a: ColleaguesModel, b: ColleaguesModel) => {
              if (a?.lastMessage && b?.lastMessage) {
                return b?.lastMessage?.timestamp - a?.lastMessage?.timestamp;
              } else if (!a?.lastMessage && !b?.lastMessage) {
                // Оба объекта не имеют lastMessage, оставляем их на своих местах
                return 0;
              } else if (!a?.lastMessage) {
                // a не имеет lastMessage, перемещаем его вниз
                return 1;
              } else if (!b?.lastMessage) {
                // b не имеет lastMessage, перемещаем его вниз
                return -1;
              }
              return 0;
            });

            Clients?.sort((a: ClientType, b: ClientType) => {
              if (a?.lastMessage && b?.lastMessage) {
                return b?.lastMessage?.timestamp - a?.lastMessage?.timestamp;
              } else if (!a?.lastMessage && !b?.lastMessage) {
                // Оба объекта не имеют lastMessage, оставляем их на своих местах
                return 0;
              } else if (!a?.lastMessage) {
                // a не имеет lastMessage, перемещаем его вниз
                return 1;
              } else if (!b?.lastMessage) {
                // b не имеет lastMessage, перемещаем его вниз
                return -1;
              }
              return 0;
            });
            if (Clients?.length > 0) {
              set({ selectedContactGroup: 0 });
            }
            if (data.activeUserSearch) {
              set({ selectedContactGroup: 1 });
            }
            set({ chats: [Clients, Colleagues] });
            break;
          case "close":
            s.close();
            break;
          case "getChat":
            set({ chat: data.chat, chatloading: false });
            get().sendEvent({
              event: "getChatMessages",
              data: {
                chat: data.chat,
                limit: 40,
              },
            });
            break;
          case "getChatMessages":
            // set({ messageLoading: true });
            let isRead = data.messages.find((message: MessageType) => {
              if (message.flags && message.flags.length > 0) {
                let flags = message.flags;
                let result = flags.find((flag) => flag.userId === get().currentUserId?.id && !flag.isRead);
                return result;
              }
            });
            // let activeChat = get().chats[0];
            // if (isRead) {
            // console.log("isRead: ", isRead);
            // console.log("chat: ", get().chat)
            // console.log("currentUserId: ", get().currentUserId)

            s.send(
              JSON.stringify({
                event: "isReadMessages",
                data: {
                  chat: { id: get().chat?.id },
                  user: get().currentUserId,
                },
              })
            );
            // }
            set({ messages: data.messages, messagesTotal: data.total, scrollTop: data.scrollTop });
            setTimeout(() => {
              set({ messageLoading: false });
            }, 500);
            break;
          case "unreadMessageCount":
            let newColleguesChats: any = get().chats[1].map((el) => {
              if (el?.id === data.chat?.id) {
                return { ...el, unreadMessageCount: 0 };
              }
              return el;
            });
            let newClientsChats: any = get().chats[0].map((el) => {
              if (el?.id === data.chat?.id) {
                return { ...el, unreadMessageCount: 0 };
              }
              return el;
            });
            set({ chats: [newClientsChats, newColleguesChats] });
            break;
          case "newMessage":
            if (data.newMessage) {
              set({ messageLoading: true });
              let newMessage: MessageType = data.newMessage;
              let currentChat: chatType = get().chat;
              let newMessages: MessageType[] = get().messages;
              let collegaChat = get().chats[1].find((el) => el?.id === newMessage.chat.id);
              if (!collegaChat) {
                get().sendEvent({ event: "currentUser", data: { currentUserId: get().currentUserId } });
              }
              let newColleguesChats: ColleaguesModel[] = get().chats[1].map((el) => {
                if (el?.id === newMessage.chat.id && !newMessage.appeal) {
                  if (el?.id !== get().chat?.id) {
                    el.unreadMessageCount++;
                  } else {
                    s.send(
                      JSON.stringify({
                        event: "isReadMessages",
                        data: {
                          chat: { id: get().chat?.id },
                          user: get().currentUserId,
                        },
                      })
                    );
                  }
                  return { ...el, lastMessage: newMessage as ContactlastMessage };
                }
                return el;
              });

              newColleguesChats?.sort((a: ColleaguesModel, b: ColleaguesModel) => {
                if (a?.lastMessage && b?.lastMessage) {
                  return b?.lastMessage?.timestamp - a?.lastMessage?.timestamp;
                } else if (!a?.lastMessage && !b?.lastMessage) {
                  // Оба объекта не имеют lastMessage, оставляем их на своих местах
                  return 0;
                } else if (!a?.lastMessage) {
                  // a не имеет lastMessage, перемещаем его вниз
                  return 1;
                } else if (!b?.lastMessage) {
                  // b не имеет lastMessage, перемещаем его вниз
                  return -1;
                }
                return 0;
              });

              if (currentChat?.id === newMessage.chat.id) {
                newMessages.unshift(data.newMessage);
              }
              if (newMessage.messageAuthor?.id !== get().currentUserId?.id) {
                get().newMessageToneCollega?.play();
              }
              set({
                messages: [...newMessages],
                chats: [get().chats[0], newColleguesChats],
                messageLoading: false,
                sendMessageLoading: false,
              });
            }
            break;
          case "getContacts":
            set({ contacts: data.contacts });
            break;
          case "DepartMents":
            set({ departMents: data.departMents });
            break;
          case "getClients":
            set({ clients: data.clients });
            break;
          case "newChat":
            if (data.newChat) {
              if (!data.newChat.appeal) {
                let member: MemberType = data.newChat.members.filter(
                  (el: { $version: number; code: string; fullName: string; id: number }) =>
                    el.id !== get().currentUserId?.id
                )[0];
                // let newColleguesChat: ColleaguesModel = {
                //   appeal: null,
                //   id: data.newChat.id,
                //   code: member.code,
                //   fullName: member.fullName,
                //   collegaId: member.id,
                //   lastMessage: null,
                //   unreadMessageCount: 0,
                //   status: data.newChat.status
                // };
                set({ chats: [get().chats[0], [...get().chats[1], data.newChat]], chat: data.newChat });
              }
            }
            if (data.chat) {
              set({ chat: data.chat });
            }
            break;
          case "newMessageAppeal":
            if (data.newMessage) {
              let newMessage: MessageType = data.newMessage;
              let currentChat: chatType = get().chat;
              let newMessages: MessageType[] = get().messages;
              let clientChat = get().chats[0].find((el) => el?.id === newMessage.chat.id);
              let newClientsChats: ClientType[] = get().chats[0].map((el: ClientType) => {
                if (el?.id === newMessage.chat.id && newMessage.appeal) {
                  if (el?.id !== get().chat?.id) {
                    el.unreadMessageCount++;
                  } else {
                    s.send(
                      JSON.stringify({
                        event: "isReadMessages",
                        data: {
                          chat: { id: get().chat?.id },
                          user: get().currentUserId,
                        },
                      })
                    );
                  }
                  if (el.fullName === "" || el.phoneNumber === "") {
                    if (el?.id === get().chat?.id) {
                      get().sendEvent({
                        event: "getChat",
                        data: {
                          activeChat: get().chat,
                        },
                      });
                    }
                    return {
                      ...el,
                      appeal: newMessage.appeal,
                      phoneNumber: newMessage.appeal.phoneNumber,
                      fullName: newMessage.appeal.name,
                      lastMessage: newMessage as ContactlastMessage,
                    };
                  }
                  return { ...el, lastMessage: newMessage as ContactlastMessage };
                }
                return el;
              });

              newClientsChats?.sort((a: ClientType, b: ClientType) => {
                if (a?.lastMessage && b?.lastMessage) {
                  return b?.lastMessage?.timestamp - a?.lastMessage?.timestamp;
                } else if (!a?.lastMessage && !b?.lastMessage) {
                  // Оба объекта не имеют lastMessage, оставляем их на своих местах
                  return 0;
                } else if (!a?.lastMessage) {
                  // a не имеет lastMessage, перемещаем его вниз
                  return 1;
                } else if (!b?.lastMessage) {
                  // b не имеет lastMessage, перемещаем его вниз
                  return -1;
                }
                return 0;
              });

              if (currentChat?.id === newMessage.chat.id) {
                newMessages.unshift(data.newMessage);
              }
              set({ messages: [...newMessages], chats: [newClientsChats, get().chats[1]], sendMessageLoading: false });
              if (newMessage.messageAuthor?.id !== get().currentUserId?.id) {
                get().newMessageTone?.play();
              }
            }
            break;
          case "newWorkAppeal":
            let clients: ClientType[] = get().chats[0];

            let findAppeal = clients.find((el) => el.id === data.newClient.id);
            if (findAppeal) {
              clients = clients.map((el) => {
                if (el.id === findAppeal?.id) {
                  return { ...data.newClient, unreadMessageCount: el.unreadMessageCount };
                }
                return el;
              });
              // let findMember = data.newClient.members.find((el: any) => el?.id === get().currentUserId?.id);
              // if (findMember) {
              //   set({ chat: data.newClient });
              // }
              if (get().chat && get().chat?.id === data.newClient.id) {
                set({ chat: data.newClient });
              }
              if (get().chat && get().chat?.id === data.newClient.id && data.status === "openChat") {
                get().sendEvent({
                  event: "getChat",
                  data: {
                    activeChat: data.newClient,
                  },
                });
                set({ selectedContactGroup: 0 });
              }
              if (data.status === "appeals") {
                get().sendEvent({
                  event: "getChat",
                  data: {
                    activeChat: data.newClient,
                  },
                });
                set({ selectedContactGroup: 0 });
              }
            } else {
              clients.unshift(data.newClient);
              get().sendEvent({
                event: "getChat",
                data: {
                  activeChat: data.newClient,
                },
              });
              set({ selectedContactGroup: 0 });
            }

            set({
              chats: [[...clients], get().chats[1]],
              completedLoading: false,
              messageLoading: false,
              addClientLoading: false,
            });

            break;
          case "transferClient":
            let userClients: ClientType[] = get().chats[0];
            let transferChat: ClientType = data.transferChat;

            let findAppeal1 = userClients.find((el) => el.id === transferChat.id);
            if (findAppeal1) {
              userClients = userClients.map((el) => {
                if (el.id === findAppeal1?.id) {
                  if (el?.id !== get().chat?.id) {
                    el.unreadMessageCount++;
                    el.lastMessage = data.transferMessage;
                  } else {
                    s.send(
                      JSON.stringify({
                        event: "isReadMessages",
                        data: {
                          chat: { id: get().chat?.id },
                          user: get().currentUserId,
                        },
                      })
                    );
                  }
                  return {
                    ...transferChat,
                    unreadMessageCount: el.unreadMessageCount,
                    lastMessage: data.transferMessage,
                  };
                }
                return el;
              });
            } else {
              userClients.unshift(transferChat);
            }
            if (get().chat?.id === transferChat.id) {
              let currentMessages = get().messages;
              currentMessages.unshift(data.transferMessage);
              set({ messages: [...currentMessages] });
            }

            if (data.transferChat.id === get().chat?.id) {
              set({ chat: transferChat as unknown as chatType });
            }

            set({ chats: [[...userClients], get().chats[1]], transferLoading: false });
            console.log("userClients: ", get().chats[0]);
            break;
          case "chatOrderPage":
            if (event.chat) {
              set({ chat: event.chat });
            }
            break;
          case "statuses":
            let newMessage: MessageType = data.newMessage;
            let currentChat: chatType = get().chat;
            let ClientsChats: ClientType[] = get().chats[0];
            let newStatus = data.status;
            if (newMessage.chat.id === currentChat?.id) {
              set({
                messages: get().messages.map((el) => {
                  if (el.id === newMessage.id) {
                    return { ...el, status: newStatus, messageSecretKey: newMessage.messageSecretKey };
                  }
                  return el;
                }),
              });
            }
            let clientsChats: any = ClientsChats.map((el: ClientType) => {
              if (el?.id === newMessage.chat.id) {
                return { ...el, lastMessage: { ...el.lastMessage, status: newStatus } };
              }
              return el;
            });
            console.log("clientsChats: ", clientsChats);
            set({ chats: [clientsChats, get().chats[1]] });
            break;
          case "getTemplate":
            let templates = data.templates;
            let newTemplates = get().templates;
            newTemplates = [];
            templates.forEach((template: any) => {
              let templateHeader = template.components.find((el: any) => el.type === "HEADER");
              let templateBody = template.components.find((el: any) => el.type === "BODY");
              let templateFooter = template.components.find((el: any) => el.type === "FOOTER");
              let templateButtons = template.components.find((el: any) => el.type === "BUTTONS");
              let newTemplate: templateType = {
                id: template.id,
                name: template.name,
                header: templateHeader ? templateHeader.text : "",
                body: templateBody.text,
                footer: templateFooter ? templateFooter.text : "",
                status: getStatusTemplate(template.status),
                category: template.category,
                language: template.language,
                buttons: templateButtons?.buttons ?? null,
              };
              newTemplates.push(newTemplate);
            });
            set({ templateLoading: false, templates: newTemplates });
            break;
          case "createTemplate":
            let response = data.response;
            if (response.success) {
              let successTemplate = response.success;
              let templateHeader = successTemplate.components.find((el: any) => el.type === "HEADER");
              let templateBody = successTemplate.components.find((el: any) => el.type === "BODY");
              let templateFooter = successTemplate.components.find((el: any) => el.type === "FOOTER");
              let templateButtons = successTemplate.components.find((el: any) => el.type === "BUTTONS");
              let template: templateType = {
                id: successTemplate.id,
                name: successTemplate.name,
                header: templateHeader ? templateHeader.text : "",
                body: templateBody.text,
                footer: templateFooter ? templateFooter.text : "",
                status: getStatusTemplate(successTemplate.status),
                category: successTemplate.category,
                language: successTemplate.language,
                buttons: templateButtons?.buttons ?? null,
              };
              set({
                createSuccessTemplate: template,
                status: { variant: statusMessageEnum.createTemplate, value: httpStatusEnum.success },
                successMessage: successMessageEnum.createTemplate,
              });
            }
            if (response.error) {
              set({
                status: { variant: statusMessageEnum.createTemplate, value: httpStatusEnum.success },
                errorMessage: response.error.message,
              });
            }
            break;
          case "updateTemplate":
            let responseUpdate = data.response;
            if (responseUpdate.success) {
              let successTemplate = responseUpdate.success;
              let templateHeader = successTemplate.components.find((el: any) => el.type === "HEADER");
              let templateBody = successTemplate.components.find((el: any) => el.type === "BODY");
              let templateFooter = successTemplate.components.find((el: any) => el.type === "FOOTER");
              let templateButtons = successTemplate.components.find((el: any) => el.type === "BUTTONS");
              let template: templateType = {
                id: successTemplate.id,
                name: successTemplate.name,
                header: templateHeader ? templateHeader.text : "",
                body: templateBody.text,
                footer: templateFooter ? templateFooter.text : "",
                status: getStatusTemplate(successTemplate.status),
                category: successTemplate.category,
                language: successTemplate.language,
                buttons: templateButtons?.buttons ?? null,
              };
              set({
                createSuccessTemplate: template,
                status: { variant: statusMessageEnum.updateTemplate, value: httpStatusEnum.success },
                successMessage: successMessageEnum.updateTemplate,
              });
            }
            if (responseUpdate.error) {
              console.log(responseUpdate);
              set({
                status: { variant: statusMessageEnum.updateTemplate, value: httpStatusEnum.success },
                errorMessage: responseUpdate.error.message,
              });
            }
            break;
          case "deleteTemplate":
            let responseDelete = data.response;
            if (responseDelete.success) {
              set({
                status: { variant: statusMessageEnum.deleteTemplate, value: httpStatusEnum.success },
                successMessage: successMessageEnum.deleteTemplate,
              });
            }
            if (responseDelete.error) {
              set({
                status: { variant: statusMessageEnum.deleteTemplate, value: httpStatusEnum.error },
                errorMessage: responseDelete.error.message,
              });
            }
            break;
          case "updateAppealInfo":
            let newChat = data.newChat;
            let clientChats: ClientType[] = get().chats[0].map((item: ClientType) => {
              if (item.id === newChat.id && item.appeal) {
                return {
                  ...item,
                  fullName: newChat.name,
                  appeal: {
                    ...item.appeal,
                    name: newChat.appeal.name,
                    client: {
                      ...newChat.appeal.client,
                    },
                  },
                };
              }
              return item;
            });
            if (get().chat?.id === newChat.id) {
              set({ chat: newChat });
            }
            set({
              chats: [[...clientChats], [...get().chats[1]]],
              loadingTemplateMessage: false,
            });
            break;
          case "updateCommentary":
            if (get().chat?.id === data.newMessage.chat.id) {
              let newMessages = get().messages.map((message) => {
                if (message.id === data.newMessage.id) {
                  console.log(message);
                  console.log(data.newMessage.id);
                  return { ...data.newMessage };
                }
                return message;
              });
              set({ messages: [...newMessages], loadingTemplateMessage: false });
            }

            break;
          case "onlineChat":
            set({
              chats: [
                [...get().chats[0]],
                get().chats[1].map((collega) => {
                  if (collega.id === data.chat.id) {
                    return { ...collega, status: data.chat.status };
                  }
                  return collega;
                }),
              ],
            });
            break;
          case "offlineChat":
            set({
              chats: [
                [...get().chats[0]],
                get().chats[1].map((collega) => {
                  if (collega.id === data.chat.id) {
                    return { ...collega, status: data.chat.status };
                  }
                  return collega;
                }),
              ],
            });
            break;
          case "userTyping":
            if (!data.chat.appeal) {
              set({
                chats: [
                  [...get().chats[0]],
                  get().chats[1].map((collega) => {
                    if (collega.id === data.chat.id) {
                      if (data.isTyping) {
                        return { ...collega, isTyping: [data.member] };
                      }
                      if (!data.isTyping) {
                        console.log(collega);
                        return {
                          ...collega,
                          isTyping: collega.isTyping.filter((isTypeUser) => isTypeUser.id !== data.member.id),
                        };
                      }
                    }
                    return collega;
                  }),
                ],
              });
            }
            if (data.chat.id === get().chat?.id) {
              if (data.isTyping) {
                let currentChat = get().chat;
                if (currentChat) {
                  currentChat = { ...currentChat, isTyping: [...currentChat.isTyping, data.member] };
                  set({ chat: currentChat });
                }
              }
              if (!data.isTyping) {
                let currentChat = get().chat;
                if (currentChat) {
                  currentChat = {
                    ...currentChat,
                    isTyping: currentChat.isTyping.filter((el) => el.id !== data.member.id),
                  };
                  set({ chat: currentChat });
                }
              }
            }
            break;
        }
      };

      s.onclose = function (event: CloseEvent) {
        clearInterval(get().socketInterval);
        setTimeout(() => {
          get().startSocket();
        }, 3000);
        console.log("Соединение прервано");
      };

      s.onerror = function () {
        console.log("error");
      };

      set({ socket: s });
    }
  },
  sendEvent: ({ event, data }: chatStoresEvent) => {
    if (get().socket?.readyState === WebSocket.OPEN) {
      get().socket.send(JSON.stringify({ event: event, data }));
    } else {
      console.error("WebSocket connection is not open.");
    }
  },
  getCall: async (id: number) => {
    try {
      let body = {
        offset: 0,
        limit: 1,
        fields: ["id", "type", "status", "duration", "recordId", "responsible", "secondUser", "user", "phoneNumber"],
        sortBy: ["-createdOn"],
        data: {
          _domain: "self.id = :id",
          _domainContext: {
            id: id,
          },
        },
      };
      let response = await http("/ws/rest/com.axelor.apps.mycrm.db.Call/search", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) {
          return data.data[0];
        } else throw new Error(data.data?.message ?? data.data);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      return error.message;
    }
  },

  onMessage: (event: any) => {
    let data: any = JSON.stringify(event.data);
    if (data.event === "close") {
      get().socket.close();
    }
  },
  disconnect: () => {
    get().socket?.close();
  },
}));
