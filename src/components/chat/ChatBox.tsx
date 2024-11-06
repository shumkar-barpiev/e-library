"use client";
import { Box, Card, Grid, Snackbar, Stack } from "@mui/material";
import ChatHeader from "./ChatHeader";
import ChatFooter from "./ChatFooter";
import { useChatStore } from "@/stores/chat/chat";
import { memo, useEffect } from "react";
import ChatMain from "./ChatMain";

const ChatBox = ({ order = false, chatId, page }: { order?: boolean; chatId: number | null; page: string }) => {
  const {
    socket,
    currentUserId,
    startSocket,
    disconnect,
    sendEvent,
    chat,
    setNewMessageTone,
    setNewMessageToneCollega,
    setChatsLoading,
  } = useChatStore((state) => state);

  useEffect(() => {
    let newMessageTone = new Audio();
    newMessageTone.controls = true;
    newMessageTone.src = "audio/new_message_tone.mp3";
    let newMessageToneCollega = new Audio();
    newMessageToneCollega.controls = true;
    newMessageToneCollega.src = "audio/odnoklassniki_-_zvuk_soobscheniy.mp3";
    setNewMessageTone(newMessageTone);
    setNewMessageToneCollega(newMessageToneCollega);
  }, []);

  useEffect(() => {
    startSocket();
    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    if (currentUserId && socket?.readyState === WebSocket.OPEN) {
      if (!chatId) {
        setChatsLoading(true);
        sendEvent({ event: "currentUser", data: { currentUserId: currentUserId, connect: true } });
      }
      if (chatId) {
        sendEvent({
          event: "getChat",
          data: {
            activeChat: { id: chatId },
            currentUserId,
            connect: true,
          },
        });
      }
    }
  }, [currentUserId]);

  return (
    <Grid item flexGrow={1} sx={{ position: "relative" }}>
      <Card>
        {order && (
          <Stack direction="column" flexWrap="nowrap">
            <ChatHeader order={order} page={page} />
            <ChatMain order={order} />
            <ChatFooter order={order} />
            <Snackbar />
          </Stack>
        )}
        {!order && chat && (
          <Stack direction="column" flexWrap="nowrap">
            <ChatHeader order={order} page={page} />
            <ChatMain order={order} />
            <ChatFooter order={order} />
            <Snackbar />
          </Stack>
        )}
      </Card>
    </Grid>
  );
};

export default memo(ChatBox);
