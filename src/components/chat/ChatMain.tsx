"use client";
import { Box, Button, CircularProgress, LinearProgress, Stack, Typography } from "@mui/material";
import ChatMessage from "./elements/ChatMessage";
import { messageTypeEnum, MessageType } from "@/models/chat/chat";
import { ChatBoxProps } from "@/models/chat/chat";
import { useChatStore } from "@/stores/chat/chat";
import { memo, useEffect, useRef, useState } from "react";
import theme from "@/styles/theme";
import AnswerMessage from "./elements/AnswerMessage";
import CustomSpinner from "./elements/spinner";

function getMessageDate(timeStamp: number) {
  let date = parseTimeStamp(timeStamp);
  if (date.length > 5) {
    return { type: messageTypeEnum.DATE, text: date };
  } else {
    return { type: "time", text: date };
  }
}

function parseTimeStamp(timeStamp: number) {
  let date = new Date(timeStamp * 1000);
  let today = new Date();
  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    return `${getTwoNumber(date.getHours())}:${getTwoNumber(date.getMinutes())}`;
  } else {
    return date.toLocaleDateString("ru-RU", { hour: "numeric", minute: "numeric", second: "numeric", hour12: false });
  }
}

function getTwoNumber(number: number) {
  if (number < 10) {
    return `0${number}`;
  }
  return number;
}

function ShowDate({ body, type, ...props }: { body: string; type: messageTypeEnum.DATE | messageTypeEnum.TODAY }) {
  return (
    <Stack direction="row" justifyContent="center" mb={1}>
      <Box
        sx={{
          background: "#fff",
          zIndex: 2,
          padding: "8px 14px",
          borderRadius: "5px",
          color: "#8d8d8d",
          fontSize: "12px",
          boxShadow: theme.shadows[2],
        }}
      >
        <Typography fontSize={10}>{body}</Typography>
      </Box>
    </Stack>
  );
}

const ChatMain = ({ order, ...props }: ChatBoxProps) => {
  const {
    chat,
    sendEvent,
    messages,
    messagesTotal,
    answerSelectMessage,
    currentUserId,
    scrollTop,
    setScrollTop,
    messageLoading,
  } = useChatStore((state) => state);
  const container = useRef<any>(null);
  const [total, setTotal] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(40);

  useEffect(() => {
    if (messages.length > 0 && messagesTotal && messages.length < messagesTotal) {
      setTotal(true);
    } else {
      setTotal(false);
    }
  }, [messages, messagesTotal]);

  useEffect(() => {
    setLimit(40);
  }, [chat, sendEvent]);

  useEffect(() => {
    if (messages.length > 0 && scrollTop) {
      container.current.scrollTop = container.current.scrollHeight - scrollTop;
      setScrollTop(null);
    } else {
      container.current.scrollTop = container.current.scrollHeight;
    }
  }, [messages]);

  let height = order ? "530px" : "100vh";

  useEffect(() => {
    if (chat && limit > 40) {
      sendEvent({
        event: "getChatMessages",
        data: {
          chat,
          limit,
          scrollTop: container.current.scrollHeight,
        },
      });
    }
  }, [limit]);

  const onClickGetMessages = () => {
    if (chat) {
      setLimit(limit + 40);
    }
  };

  return (
    <Box
      sx={{
        background: "#f5f5f5",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Stack
        ref={container}
        style={{ height: `calc(${height} - 165px)`, overflow: "auto" }}
        direction="column"
        padding={2}
      >
        {total && <Button onClick={onClickGetMessages}>Загрузить еше!</Button>}
        {messages
          .slice()
          .reverse()
          .reduce((acc, message: MessageType, idx, arr: MessageType[]) => {
            let messageTimeStamp = getMessageDate(message.timestamp);
            let nextMessage = arr[idx + 1] ? arr[idx + 1] : null;
            const isFirstInGroup = idx === 0 || nextMessage?.messageAuthor?.id !== message.messageAuthor?.id;
            if (messageTimeStamp.type === messageTypeEnum.DATE) {
              let messageTimeStampArr = messageTimeStamp.text.split(",");
              let messageDate = messageTimeStampArr[0];
              let newMessagesDate = acc.some(
                (el) => el && el.props && el.props.type === messageTypeEnum.DATE && el.props.body === messageDate
              );
              if (!newMessagesDate) {
                return acc
                  .concat(<ShowDate key={Math.random() * 1000} body={messageDate} type={messageTypeEnum.DATE} />)
                  .concat(<ChatMessage key={message.id} isFirstInGroup={isFirstInGroup} message={message} />);
              }
            } else {
              let today = acc.some((el) => el && el.props && el.props.type === messageTypeEnum.TODAY);
              if (!today) {
                return acc
                  .concat(<ShowDate key={Math.random() * 1000} body="СЕГОДНЯ" type={messageTypeEnum.TODAY} />)
                  .concat(<ChatMessage key={message.id} isFirstInGroup={isFirstInGroup} message={message} />);
              }
            }
            return acc.concat(<ChatMessage key={message.id} isFirstInGroup={isFirstInGroup} message={message} />);
          }, [] as JSX.Element[])}
        {messageLoading && (
          <Stack
            sx={{ position: "absolute", right: 0, left: 0, top: 0, bottom: 0, background: "#f5f5f5", zIndex: 100 }}
            alignItems="center"
            justifyContent="center"
            direction="row"
          >
            <CircularProgress />
          </Stack>
        )}
      </Stack>
      {answerSelectMessage && <AnswerMessage />}
    </Box>
  );
};

export default memo(ChatMain);
