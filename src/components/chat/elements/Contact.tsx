"use client";
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import { Time } from "./Time";
import { ReadMark } from "./ReadMarker";
import { useChatStore } from "@/stores/chat/chat";
import { grey } from "@mui/material/colors";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { Description } from "@mui/icons-material";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import { getContactName } from "../helpers/helpers";
import { useEffect, useState } from "react";
import ContentPasteGoIcon from "@mui/icons-material/ContentPasteGo";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import DeleteIcon from "@mui/icons-material/Delete";
import { ClientType, ColleaguesModel, chatType, messageTypeEnum } from "@/models/chat/chat";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import TransferWithinAStationIcon from "@mui/icons-material/TransferWithinAStation";
import AdjustIcon from "@mui/icons-material/Adjust";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import CreateIcon from "@mui/icons-material/Create";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

export function Contact({ contact }: { contact: ClientType | ColleaguesModel }) {
  const { sendEvent, chat, currentUserId, setChat } = useChatStore((state) => state);
  const [toTr, setToTr] = useState<
    {
      id: number;
      fullName: string;
      code: string;
    }[]
  >([]);

  const [toTrCurrentUser, setToTrCurrentUser] = useState<{
    id: number;
    fullName: string;
    code: string;
  } | null>(null);

  const [members, setMembers] = useState<
    {
      code: string;
      fullName: string;
      id: number;
      version: number;
    }[]
  >([]);

  useEffect(() => {
    if ("appeal" in contact && "members" in contact) {
      setMembers(
        contact.members.filter((el) => {
          let member:
            | {
                code: string;
                fullName: string;
                id: number;
                version: number;
              }
            | undefined = contact.completedUsers?.find((complUser) => complUser.id === el.id);
          if (!member) {
            return el;
          }
        })
      );
    }
  }, [contact]);

  const [anchorElTransfer, setAnchorElTransfer] = useState<HTMLButtonElement | null>(null);

  const onMouseEnterTransferIcon = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    setAnchorElTransfer(event.currentTarget);
  };

  const handleCloseTransferIcon = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    setAnchorElTransfer(null);
  };

  const onClickSupportAgent = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (anchorElTransfer) {
      setAnchorElTransfer(e.currentTarget);
    }
    e.stopPropagation();
  };

  const openTransfer = Boolean(anchorElTransfer);
  const idTransfer = openTransfer ? "simple-popover" : undefined;

  useEffect(() => {
    if (contact && "appeal" in contact && contact?.appeal?.transfer && contact?.appeal?.transfer?.length > 0) {
      setToTr(contact.appeal.transfer[0].toTr);
    }
  }, [contact]);

  useEffect(() => {
    let findCurrentUser = toTr.find((el) => el.id === currentUserId?.id);
    if (findCurrentUser) {
      setToTrCurrentUser(findCurrentUser);
    }
  }, [toTr]);

  const activeChat = {
    id: contact ? contact.id : null,
  };

  const onClickListItem = () => {
    setChat(activeChat as chatType);
    sendEvent({ event: "getChat", data: { activeChat, currentUserId } });
  };

  const onContextMenu = (event: any) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <>
      <ListItemButton
        key={contact?.id}
        sx={{
          borderBottom: "1px solid #9e9e9e3d",
          gap: "10px",
          backgroundColor: chat?.id === contact?.id ? grey[300] : "#fff",
        }}
        onClick={onClickListItem}
        onContextMenu={onContextMenu}
      >
        <Avatar sx={{ width: "35px", height: "35px", fontSize: 13 }} alt="Profile Picture">
          {getContactName(contact)}
        </Avatar>
        <ListItemText
          sx={{ display: "flex", flexDirection: "column", gap: "5px" }}
          primaryTypographyProps={{ fontWeight: 600 }}
          primary={
            <Stack direction="row" justifyContent="space-between" gap="5px">
              {"appeal" in contact ? (
                <Box component="span">
                  <Stack direction="row" spacing={1}>
                    <Typography
                      fontSize={12}
                      fontWeight={500}
                      color="#3f51b5"
                      title={contact?.appeal?.client?.fullName ?? contact.fullName}
                    >
                      {contact?.appeal?.client?.fullName?.slice(0, 10) ?? contact.fullName.slice(0, 10)}
                      {(contact?.appeal?.client?.fullName && contact?.appeal?.client?.fullName.length > 10) ||
                      contact.fullName.length > 10
                        ? "..."
                        : ""}
                    </Typography>
                    <Typography>
                      {"status" in contact && contact.status === "Онлайн" && (
                        <FiberManualRecordIcon sx={{ color: "green", width: "15px" }} />
                      )}
                      {"status" in contact && contact.status === "Оффлайн" && (
                        <AdjustIcon sx={{ width: "15px", color: "c#c#c#" }} />
                      )}
                    </Typography>
                    {"isTyping" in contact && contact.isTyping.length > 0 && (
                      <Box sx={{ background: "#bbdefb", padding: "5px", borderRadius: "5px" }}>
                        <Stack direction="row" alignItems="center">
                          <Typography sx={{ fontSize: 12 }}>Печатает...</Typography>
                          {/* <CreateIcon sx={{ width: '15px', color: "#ba68c8" }} /> */}
                        </Stack>
                      </Box>
                    )}

                    <Typography fontWeight="500" fontSize={12}>
                      {contact?.appeal?.client?.mobilePhone ?? contact.phoneNumber}
                    </Typography>
                  </Stack>
                </Box>
              ) : (
                <Box component="span">{contact?.fullName.slice(0, 30)}</Box>
              )}
              <Box sx={{ flexGrow: 1 }}>
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  sx={{ marginRight: "0px", marginTop: "7px" }}
                  alignItems="center"
                >
                  <Badge badgeContent={contact.unreadMessageCount} color="primary"></Badge>
                </Stack>
              </Box>
              <Box component="span" fontWeight={400} fontSize={14} color="#8E8E93">
                {contact?.lastMessage && <Time timestamp={contact.lastMessage.timestamp} formatStr="HH:mm" />}
              </Box>
              {"appeal" in contact && contact.appeal && (
                <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
                  <Box>
                    <IconButton
                      style={{ zIndex: 1301 }}
                      onMouseEnter={onMouseEnterTransferIcon}
                      onMouseLeave={handleCloseTransferIcon}
                      // onClick={onClickSupportAgent}
                    >
                      <Badge badgeContent={members.length}>
                        <SupportAgentIcon sx={{ color: "#3f51b5" }} />
                      </Badge>
                    </IconButton>
                    <Popover
                      id={idTransfer}
                      open={openTransfer}
                      anchorEl={anchorElTransfer}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                    >
                      {members.length > 0 &&
                        members.map((el) => {
                          return (
                            <Box key={el.id} sx={{ position: "relative", zIndex: 13500 }}>
                              <Typography sx={{ p: 1, fontSize: 11 }}>{el.fullName}</Typography>
                            </Box>
                          );
                        })}
                      {members.length === 0 && (
                        <Box sx={{ position: "relative", zIndex: 13500 }}>
                          <Typography sx={{ p: 1, fontSize: 11 }}>no data</Typography>
                        </Box>
                      )}
                    </Popover>
                  </Box>
                </Stack>
              )}
            </Stack>
          }
          secondary={
            <Box component="span" sx={{ display: "flex", alignItems: "center", gap: "2px" }}>
              {contact?.lastMessage?.messageAuthor?.id === currentUserId?.id && (
                <ReadMark status={contact?.lastMessage?.status} appealType={contact?.lastMessage?.appealType} />
              )}
              <Box
                component="span"
                sx={{
                  display: "block",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {contact?.lastMessage?.type === messageTypeEnum.TEXT && (
                  <Typography fontSize={11}>{contact?.lastMessage?.body.slice(0, 40) + "..."}</Typography>
                )}
                {contact?.lastMessage?.type === messageTypeEnum.IMAGE && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <PhotoCameraIcon sx={{ width: "18px", height: "18px" }} /> <Typography>Фото</Typography>
                  </Stack>
                )}
                {contact?.lastMessage?.type === messageTypeEnum.DOCUMENT && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Description sx={{ width: "18px", height: "18px" }} />{" "}
                    <Typography fontSize={11}>{contact.lastMessage.fileName}</Typography>
                  </Stack>
                )}
                {contact?.lastMessage?.type === messageTypeEnum.AUDIO && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <KeyboardVoiceIcon sx={{ width: "18px", height: "18px" }} /> <Typography>Аудио</Typography>
                  </Stack>
                )}
                {contact?.lastMessage?.type === messageTypeEnum.TEMPLATE && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography fontSize={11}>{JSON.parse(contact?.lastMessage?.body).body}</Typography>
                  </Stack>
                )}
                {contact.lastMessage?.type === messageTypeEnum.TRANSFER && (
                  <Stack>
                    <Typography>Вам передали чат</Typography>
                  </Stack>
                )}
              </Box>
            </Box>
          }
        />
      </ListItemButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <MenuItem onClick={handleClose}>
          <ContentPasteGoIcon sx={{ marginRight: "10px", color: grey[500] }} /> Перейти в карточку
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <DonutLargeIcon sx={{ marginRight: "10px", color: grey[500] }} />
          Завершить
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <DeleteIcon sx={{ marginRight: "10px", color: grey[500] }} />
          Удалить
        </MenuItem>
      </Menu>
    </>
  );
}

// {"appeal" in contact && contact?.appeal?.transfer && contact?.appeal?.transfer?.length > 0 && (
//   <Stack direction="row" alignItems="center" spacing={1}>
//     <Typography fontSize={12}>{contact.appeal?.transfer[0].fromTr?.fullName}</Typography>
//     <KeyboardBackspaceIcon sx={{ position: "relative", rotate: "180deg", color: "#3f51b5" }} />
//     {toTrCurrentUser ? (
//       <Typography fontSize={12}>Вам</Typography>
//     ) : (
//       <Box>
//         <IconButton
//           style={{ zIndex: 1301 }}
//           onMouseEnter={onMouseEnterTransferIcon}
//           onMouseLeave={handleCloseTransferIcon}
//         >
//           {/* <TransferWithinAStationIcon sx={{ color: "#3f51b5" }} /> */}
//           <SupportAgentIcon sx={{ color: "#3f51b5" }} />
//         </IconButton>
//         <Popover
//           id={idTransfer}
//           open={openTransfer}
//           anchorEl={anchorElTransfer}
//           onClose={handleClose}
//           anchorOrigin={{
//             vertical: "bottom",
//             horizontal: "right",
//           }}
//         >
//           {/* {toTr.map((el) => (
//             <Box key={el.id} sx={{ position: "relative", zIndex: 13500 }}>
//               <Typography sx={{ p: 1, fontSize: 11 }}>{el.fullName}</Typography>
//             </Box>
//           ))} */}
//           {contact.members.map((el) => {
//             let member = contact.completedUsers.find(elCompl => elCompl.id === el.id);
//             if (!member) {
//               return <Box key={el.id} sx={{ position: "relative", zIndex: 13500 }}>
//                 <Typography sx={{ p: 1, fontSize: 11 }}>{el.fullName}</Typography>
//               </Box>
//             }
//           })}
//         </Popover>
//       </Box>
//     )}
//   </Stack>
// )}
