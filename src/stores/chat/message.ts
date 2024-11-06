"use client";
import { MessageType } from "@/models/chat/chat";
import { http } from "@/utils/http";
import { create } from "zustand";

interface useMessageType {
  getMessageSeckretKey: (messageSecretKey: string) => Promise<MessageType>;
  // getAnserPrevMessage: (id: number) => Promise<MessageType>;
}

export const useMessage = create<useMessageType>()((set, get) => ({
  getMessageSeckretKey: async (messageSecretKey: string) => {
    try {
      let body = {
        offset: 0,
        limit: 1,
        sortBy: ["-createdOn"],
        fields: [
          "fileSize",
          "fileName",
          "fileId",
          "fileType",
          "messageSecretKey",
          "type",
          "body",
          "timestamp",
          "fromNumber",
          "operatorName",
          "messageAuthor",
          "chat",
          "appeal",
          "transfer",
          "transfer.fromTr",
          "flags",
          "status",
          "appealType",
          "messageType",
          "prevMessageSecretKey",
          "prevMessageId",
          "caption",
          "messageCall.id",
          "messageCall.type",
          "messageCall.status",
          "messageCall.recordId",
          "messageCall.duration",
          "messageCall.user",
        ],
        data: {
          criteria: [
            {
              fieldName: "messageSecretKey",
              operator: "=",
              value: messageSecretKey,
            },
          ],
        },
      };
      let response = await http(`/ws/rest/com.axelor.message.db.Message/search`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (response.ok) {
        let data = await response.json();
        if (data.data) {
          return data;
        } else {
          return null;
        }
      }
    } catch (error: any) {
      console.log(error);
    }
  },
  // getAnserPrevMessage: (id: number) => {

  // }
}));
