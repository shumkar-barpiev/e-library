"use client";

import { memo, useCallback, useState } from "react";
import { Box, Menu, MenuItem, Stack, Typography, ListItemIcon, ListItemText, Avatar } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Time } from "./Time";
import { ReadMark } from "./ReadMarker";
import { Photo } from "@/components/chat/elements/Photo";
import { FileView } from "@/components/chat/elements/FileView";
import { AudioPlayer } from "@/components/chat/elements/AudioPlayer";
import theme, { inter } from "@/styles/theme";
import { useChatStore } from "@/stores/chat/chat";
import CreateTaskDialog from "@/components/task/CreateTaskDialog";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ErrorIcon from "@mui/icons-material/Error";
import Tooltip from "@mui/material/Tooltip";
import { getChatClientName, getMessageAuthorName } from "../helpers/helpers";

import { MessageType, appelTypeEnum, messageTypeEnum } from "@/models/chat/chat";
import TemplateMessage from "./TemplateMessage";
import TransferMessage from "./TransferMessage";
import ChatMessagePopup from "./ChatMessagePopup";
import VideoPlayer from "./VideoPlayer";
import Call from "./Call";
import CallIcon from "@mui/icons-material/Call";
import DialerSipIcon from "@mui/icons-material/DialerSip";
import { useMessage } from "@/stores/chat/message";
interface ChatMessageProps {
  message: MessageType;
  isFirstInGroup: boolean;
}

const domain = process.env.NEXT_PUBLIC_API_URL + "foms";

const errors: { [key: string]: string } = {
  "131047":
    "Более 24 часов прошло с того момента, как получатель в последний раз отправил сообщение на номер отправителя.",
  "131026":
    "Номер телефона получателя отсутствует в WhatsApp.Получатель не принял новые версии Пользовательского соглашения и Политики конфиденциальности.",
  "131042": "Проблема с оплатой права бизнеса",
  "190": "срок действия сеанса истек",
};

const ChatMessage = ({ message, isFirstInGroup }: ChatMessageProps) => {
  const [openNewTaskPopup, setOpenNewTaskPopup] = useState(false);
  const useMessageStore = useMessage();
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const { currentUserId, chat, messages } = useChatStore((state) => state);
  let { body, type, messageAuthor, timestamp, status, appealType, prevMessageSecretKey } = message;
  const bgColor =
    messageAuthor?.id === currentUserId?.id && type !== messageTypeEnum.TRANSFER
      ? "#DCF7C5"
      : messageAuthor?.id === currentUserId?.id && type === messageTypeEnum.TRANSFER
        ? "#dcf7c580"
        : "#fff";

  let align: string;
  if ((messageAuthor && type === messageTypeEnum.TRANSFER) || (messageAuthor && type === messageTypeEnum.COMMENTARY)) {
    align = "center";
  } else if (
    (messageAuthor && type !== messageTypeEnum.TRANSFER) ||
    (type === messageTypeEnum.CALL && message["messageCall.type"] === "outgoing")
  ) {
    align = "flex-end";
  } else if (type === messageTypeEnum.CALL && message["messageCall.type"] === "incoming") {
    align = "flex-start";
  } else {
    align = "flex-start";
  }

  if (!chat?.appeal && messageAuthor?.id !== currentUserId?.id) {
    align = "flex-start";
  }

  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;

  // const isEmail = emailRegex.test(m);
  // const bgColor = isMe ? "#DCF7C5" : "#fff";

  // const content = isEmail ? (
  //   <a href={`mailto:${m}`} style={{ color: "#027EB5", textDecoration: "none" }}>
  //     {m}
  //   </a>
  // ) : (
  //   <p style={{ margin: 0, padding: 0, fontSize: "0.875rem" }}>{m}</p>
  // );
  const renderMessage = ({ message }: { message: MessageType }) => {
    return (
      <Box>
        {message.messageAuthor && message.type !== messageTypeEnum.CALL && (
          <Box>
            {type !== messageTypeEnum.TRANSFER && (
              <Stack direction="row" alignItems="center" sx={{ marginBottom: "5px" }}>
                <Avatar sx={{ width: "20px", height: "20px", marginRight: "10px", fontSize: 8 }}>
                  {getMessageAuthorName(message.messageAuthor)}
                </Avatar>
                <Typography fontWeight={500} fontSize={12} color="#3f51b5">
                  {message.messageAuthor.fullName}
                </Typography>
                {
                  <Stack
                    direction="row"
                    flexGrow={1}
                    sx={{ minWidth: "30px", marginTop: "-10px" }}
                    justifyContent="flex-end"
                    alignItems="start"
                  >
                    <ChatMessagePopup message={message} />
                  </Stack>
                }
              </Stack>
            )}
            {message.prevAnswerMessage && (
              <Stack
                direction="row"
                sx={{
                  p: 1,
                  boxShadow: 0,
                  borderRadius: 2,
                  bgcolor: "rgba(0,0,0,0.1)",
                  width: "100%",
                  marginBottom: "10px",
                }}
              >
                {renderAnswerMessage({ message: message.prevAnswerMessage })}
              </Stack>
            )}
            {message.type === messageTypeEnum.AUDIO && (
              <AudioPlayer src={process.env.NEXT_PUBLIC_API_URL + "/foms/ws/dms/inline/" + message.fileId} />
            )}
            {message.type === messageTypeEnum.IMAGE && <Photo message={message} />}
            {message.type === messageTypeEnum.DOCUMENT && <FileView message={message} />}
            {message.type === messageTypeEnum.VIDEO && <VideoPlayer message={message} />}
            {message.type === messageTypeEnum.TEXT && (
              <Typography fontSize={11.5} sx={{ marginLeft: "30px", marginRight: "30px" }}>
                <pre style={{ fontFamily: inter.style.fontFamily, textWrap: "wrap" }}>{message.body}</pre>
              </Typography>
            )}
            {message.type === messageTypeEnum.TEMPLATE && <TemplateMessage body={message.body} />}

            {message.type === messageTypeEnum.TRANSFER && <TransferMessage message={message} />}
            {message.type === messageTypeEnum.COMMENTARY && (
              <Box>
                <Typography fontSize={11.5} sx={{ marginLeft: "30px", marginRight: "30px" }}>
                  <pre style={{ fontFamily: inter.style.fontFamily, textWrap: "wrap" }}>{message.body}</pre>
                </Typography>
              </Box>
            )}
          </Box>
        )}
        {message.appeal && !message.messageAuthor && message.type !== messageTypeEnum.CALL && (
          <Box>
            <Stack direction="row" alignItems="center" sx={{ marginBottom: "5px" }}>
              <Avatar sx={{ width: "20px", height: "20px", marginRight: "10px", fontSize: 8 }}>
                {getChatClientName(chat)}
              </Avatar>
              <Stack direction="row" spacing={1}>
                <Typography fontWeight={500} fontSize={12} color="#3f51b5">
                  {chat?.appeal?.client?.fullName || message.appeal.name}
                </Typography>
                <Typography fontSize={10} fontWeight={500}>
                  {chat?.appeal?.client?.mobilePhone || chat?.phoneNumber}
                </Typography>
              </Stack>
              <Stack
                direction="row"
                flexGrow={1}
                sx={{ minWidth: "30px", marginTop: "-10px" }}
                justifyContent="flex-end"
                alignItems="start"
              >
                <ChatMessagePopup message={message} />
              </Stack>
            </Stack>
            {message.prevAnswerMessage && (
              <Stack
                direction="row"
                sx={{
                  p: 1,
                  boxShadow: 0,
                  borderRadius: 2,
                  bgcolor: "rgba(0,0,0,0.1)",
                  width: "100%",
                  marginBottom: "10px",
                }}
              >
                {renderAnswerMessage({ message: message.prevAnswerMessage })}
              </Stack>
            )}
            {message.type === messageTypeEnum.AUDIO && (
              <AudioPlayer src={process.env.NEXT_PUBLIC_API_URL + "/foms/ws/dms/inline/" + message.fileId} />
            )}
            {message.type === messageTypeEnum.IMAGE && <Photo message={message} />}
            {message.type === messageTypeEnum.DOCUMENT && <FileView message={message} />}
            {message.type === messageTypeEnum.VIDEO && <VideoPlayer message={message} />}
            {message.type === messageTypeEnum.TEXT && (
              <Typography fontSize={11.5} sx={{ marginLeft: "30px", marginRight: "30px" }}>
                {<pre style={{ fontFamily: inter.style.fontFamily, textWrap: "wrap" }}>{message.body}</pre>}
              </Typography>
            )}
          </Box>
        )}
        {message.type === messageTypeEnum.CALL && <Call message={message} />}
        <Box>
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            spacing="4px"
            sx={{ marginLeft: "10px" }}
          >
            <Time timestamp={timestamp} formatStr="HH:mm" />
            {messageAuthor?.id === currentUserId?.id &&
              type !== messageTypeEnum.TRANSFER &&
              type !== messageTypeEnum.CALL &&
              type !== messageTypeEnum.COMMENTARY && <ReadMark status={status} appealType={appealType} />}
            {errors[message.status] && (
              <Tooltip title={errors[message.status]}>
                <ErrorIcon sx={{ color: "red" }} />
              </Tooltip>
            )}
          </Stack>
        </Box>
      </Box>
    );
  };

  const renderAnswerMessage = useCallback(({ message }: { message: MessageType }) => {
    return (
      <Box sx={{ position: "relative", paddingLeft: "15px" }}>
        <Box
          sx={{ position: "absolute", width: "5px", bgcolor: "#3f51b5", top: "-7px", left: "0px", bottom: "-7px" }}
        ></Box>
        {message.messageAuthor && (
          <Box sx={{ width: "100%" }}>
            {type !== messageTypeEnum.TRANSFER && (
              <Stack direction="row" alignItems="center" sx={{ marginBottom: "5px" }}>
                <Typography fontWeight={600} fontSize="11px" color="#3f51b5">
                  {message.messageAuthor.fullName}
                </Typography>
              </Stack>
            )}
            {message.type === messageTypeEnum.AUDIO && (
              <AudioPlayer src={process.env.NEXT_PUBLIC_API_URL + "/foms/ws/dms/inline/" + message.fileId} />
            )}
            {message.type === messageTypeEnum.IMAGE && <Photo message={message} answer />}
            {message.type === messageTypeEnum.DOCUMENT && <FileView message={message} answer />}
            {message.type === messageTypeEnum.VIDEO && <VideoPlayer message={message} answer />}
            {message.type === messageTypeEnum.TEXT && (
              <Typography fontSize={11.5} sx={{ marginLeft: "10px" }}>
                <pre style={{ fontFamily: inter.style.fontFamily, textWrap: "wrap" }}>{message.body}</pre>
              </Typography>
            )}
            {message.type === messageTypeEnum.TEMPLATE && <TemplateMessage body={message.body} />}

            {message.type === messageTypeEnum.TRANSFER && <TransferMessage message={message} />}
          </Box>
        )}
        {!message.messageAuthor && !message.appeal && (
          <AudioPlayer src={process.env.NEXT_PUBLIC_API_URL + "/foms/ws/dms/inline/" + message.fileId} />
        )}
        {message.appeal && !message.messageAuthor && (
          <Box>
            <Stack direction="row" alignItems="center" sx={{ marginBottom: "5px" }}>
              <Stack direction="row" spacing={1}>
                <Typography fontWeight={600} fontSize="11px" color="#3f51b5">
                  {chat?.appeal?.client.fullName || message.appeal.name}
                </Typography>
                <Typography fontSize="11px" fontWeight={500}>
                  {chat?.appeal?.client.mobilePhone || chat?.phoneNumber}
                </Typography>
              </Stack>
            </Stack>
            {message.type === messageTypeEnum.AUDIO && (
              <AudioPlayer src={process.env.NEXT_PUBLIC_API_URL + "/foms/ws/dms/inline/" + message.fileId} />
            )}
            {message.type === messageTypeEnum.IMAGE && <Photo message={message} answer />}
            {message.type === messageTypeEnum.VIDEO && <VideoPlayer message={message} answer />}
            {message.type === messageTypeEnum.DOCUMENT && <FileView message={message} answer />}
            {message.type === messageTypeEnum.TEXT && (
              <Typography fontSize={11.5} sx={{ marginLeft: "10px" }}>
                {<pre style={{ fontFamily: inter.style.fontFamily, textWrap: "wrap" }}>{message.body}</pre>}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  }, []);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null
    );
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  return (
    <Box sx={{ direction: "column" }}>
      <Stack direction="column">
        <Box>
          <Stack
            direction="row"
            justifyContent={align}
            sx={{ position: "relative", maxWidth: "100%" }}
            onContextMenu={handleContextMenu}
          >
            {appealType === appelTypeEnum.whatsapp && type !== messageTypeEnum.TRANSFER && message.messageAuthor && (
              <Box sx={{ marginRight: "10px" }}>
                <Stack direction="column" justifyContent="flex-end" sx={{ height: "100%", paddingBottom: "10px" }}>
                  <WhatsAppIcon sx={{ color: "#00E510", width: "25px", height: "25px" }} />
                </Stack>
              </Box>
            )}
            {type === messageTypeEnum.CALL && message["messageCall.type"] === "outgoing" && (
              <Box sx={{ marginLeft: "10px" }}>
                <Stack direction="column" justifyContent="flex-end" sx={{ height: "100%", paddingBottom: "10px" }}>
                  <DialerSipIcon
                    sx={{
                      color: message["messageCall.status"] === "answered" ? "green" : "red",
                      width: "25px",
                      height: "25px",
                      marginRight: "10px",
                    }}
                  />
                </Stack>
              </Box>
            )}

            <Box
              sx={{
                bgcolor: bgColor,
                padding: 1,
                borderRadius: 2,
                marginBottom: 1,
                boxShadow: theme.shadows[2],
                maxWidth: "90%",
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-end",
                position: "relative",
              }}
            >
              <Menu
                open={contextMenu !== null}
                onClose={handleContextMenuClose}
                anchorReference="anchorPosition"
                anchorPosition={
                  contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
                }
              >
                <MenuItem
                  onClick={() => {
                    setOpenNewTaskPopup(true);
                    handleContextMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <AddIcon />
                  </ListItemIcon>
                  <ListItemText>Создать задачу</ListItemText>
                </MenuItem>
              </Menu>
              <CreateTaskDialog
                text={body}
                fromUserId={messageAuthor?.id}
                dialogState={[openNewTaskPopup, setOpenNewTaskPopup]}
              />
              {renderMessage({ message })}
            </Box>
            {appealType === appelTypeEnum.whatsapp && type !== messageTypeEnum.TRANSFER && !message.messageAuthor && (
              <Box sx={{ marginLeft: "10px" }}>
                <Stack direction="column" justifyContent="flex-end" sx={{ height: "100%", paddingBottom: "10px" }}>
                  <WhatsAppIcon sx={{ color: "#00E510", width: "25px", height: "25px" }} />
                </Stack>
              </Box>
            )}

            {type === messageTypeEnum.CALL && message["messageCall.type"] === "incoming" && (
              <Box sx={{ marginLeft: "10px" }}>
                <Stack direction="column" justifyContent="flex-end" sx={{ height: "100%", paddingBottom: "10px" }}>
                  <DialerSipIcon
                    sx={{
                      color: message["messageCall.status"] === "answered" ? "green" : "red",
                      width: "25px",
                      height: "25px",
                    }}
                  />
                </Stack>
              </Box>
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default memo(ChatMessage);
