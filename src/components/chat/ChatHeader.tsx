"use client";
import React, { memo, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Stack,
  Tab,
  styled,
  Grid,
  Typography,
  Card,
  Skeleton,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import Tabs from "@mui/material/Tabs";
import { grey } from "@mui/material/colors";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InstagramIcon from "@mui/icons-material/Instagram";
import TelegramIcon from "@mui/icons-material/Telegram";
import { MoreVert } from "@mui/icons-material";
import theme from "@/styles/theme";
import { useChatStore } from "@/stores/chat/chat";
import { isProduction } from "@/utils/utils";
import { useRouter } from "next/navigation";
import { getChatClientName } from "./helpers/helpers";
import ContentPasteGoIcon from "@mui/icons-material/ContentPasteGo";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import CallIcon from "@mui/icons-material/Call";
import TransferClient from "./elements/TransferClient";

import { ColleaguesModel, chatType } from "@/models/chat/chat";
import CommentIcon from "@mui/icons-material/Comment";
import ContactProfile from "./elements/ContactProfile";
import ChatCommentary from "./elements/ChatCommentary";
import { CommentaryVariant, useChatCommentary } from "@/stores/chat/chatCommentary";
import AddCommentIcon from "@mui/icons-material/AddComment";
interface CommunicationMethod {
  id: number;
  icon: React.ReactElement;
  label: string;
  click: () => void;
}

const ContactInfoBox = styled(Box)({
  borderRadius: "6px",
  border: "1px solid #C2C6CA",
  padding: theme.spacing(2),
  display: "flex",
  marginBottom: 2,
  height: "77px",
  marginRight: "10px",
});

const ContactName = styled("p")({
  margin: 0,
  ...theme.typography,
  fontSize: 16,
  fontWeight: 600,
  paddingBottom: 0,
});

const ContactDesposition = styled("p")({
  fontSize: 14,
  color: grey[600],
  padding: 0,
  margin: 0,
});

const ChatButton = styled(Button)({
  textTransform: "none",
});

const ContactCommunicationMethods: CommunicationMethod[] = [
  {
    id: 1,
    icon: <WhatsAppIcon sx={{ color: "#00E510", width: "25px", height: "25px" }} />,
    label: "Whatsapp",
    click: () => {},
  },
  {
    id: 2,
    icon: <CallIcon sx={{ color: "#3f51b5", width: "25px", height: "25px" }} />,
    label: "Instagram",
    click: () => {},
  },
  {
    id: 3,
    icon: <TelegramIcon sx={{ color: "#00B0F2", width: "25px", height: "25px" }} />,
    label: "Telegram",
    click: () => {},
  },
];

type ChatBoxProps = {
  order: boolean;
  page: string;
};

export type ContactInfoType = {
  name: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  commentary: string;
};

const ChatHeader = ({ order, page, ...props }: ChatBoxProps) => {
  const [selectedCommunicationMethod, setSelectedCommunicationMethod] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const {
    chat,
    chats,
    sendEvent,
    currentUserId,
    chatloading,
    messageLoading,
    selectedContactGroup,
    loadingTemplateMessage,
    setLoadingTemplateMessage,
    setCompletedLoading,
    completedLoading,
    setMessageLoading,
  } = useChatStore((state) => state);
  const [activeChat, setActiveChat] = useState<chatType>(null);
  const [complete, setComplete] = useState<boolean>(false);
  const [orderPageAddress, setOrderPageAddress] = useState<string>("");
  const router = useRouter();
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [openContactCommentary, setOpenContactCommentary] = useState<boolean>(false);
  const chatCommentaryStory = useChatCommentary();

  const handleOpenContactCommentary = () => {
    setOpenContactCommentary(true);
  };

  const handleCloseContactCommentary = () => {
    setOpenContactCommentary(false);
  };

  const [form, setForm] = useState<ContactInfoType>({
    name: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    commentary: "",
  });
  const [contactInfo, setContactInfo] = useState<ContactInfoType>({
    name: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    commentary: "",
  });
  const open = Boolean(anchorEl);
  const id = open ? "simple-popper" : undefined;

  useEffect(() => {
    if (contactInfo) {
      setForm({
        ...contactInfo,
      });
    }
  }, [contactInfo]);

  useEffect(() => {
    if (activeChat && selectedContactGroup === 0) {
      setContactInfo({
        name:
          (selectedContactGroup === 0 && activeChat?.appeal?.client?.firstName) || activeChat?.appeal?.firstName || "",
        lastName:
          (selectedContactGroup === 0 && activeChat?.appeal?.client?.lastName) || activeChat?.appeal?.name || "",
        email:
          (selectedContactGroup === 0 && activeChat?.appeal?.client?.email) || activeChat.appeal?.importOrigin || "",
        dateOfBirth:
          (selectedContactGroup === 0 && activeChat?.appeal?.client?.dateOfBirth) ||
          activeChat.appeal?.processInstanceId ||
          "",
        commentary: (selectedContactGroup === 0 && activeChat?.commentary) || "",
      });
    }
  }, [activeChat]);

  useEffect(() => {
    if (page === "/chat") {
      setCurrentUrl("chat");
    }
    if (page === "/dashboard") {
      setCurrentUrl("dashboard");
    }
    if (page === "/orders") {
      setCurrentUrl("orders");
    }
  }, []);

  useEffect(() => {
    if (chat && chat.id && !order) {
      let activeClientChat = chats[0].find((el) => el?.id === chat.id);
      let activeCollegusChat = chats[1].find((el) => el?.id === chat.id);
      if (activeClientChat) {
        let findCompleteChat = chat?.completedUsers?.find((el) => el?.id === currentUserId?.id);
        if (findCompleteChat) {
          setComplete(true);
        } else {
          setComplete(false);
        }
        setActiveChat(chat);
      }
      if (activeCollegusChat) {
        setActiveChat(activeCollegusChat);
      }
    }
    if (order && chat && chat.id) {
      sendEvent({ event: "getChatorderpage", data: { chat: chat } });
      let findCompleteChat = chat?.completedUsers?.find((el) => el?.id === currentUserId?.id);
      if (findCompleteChat) {
        setComplete(true);
      } else {
        setComplete(false);
      }
      setActiveChat(chat);
    }
    setOrderPageAddress(() => {
      return isProduction
        ? `/foms/front/orders.html?appeal=${chat?.appeal?.id}&chat=${chat?.id}&prev=${currentUrl}`
        : `/orders?appeal=${chat?.appeal?.id}&chat=${chat?.id}&prev=${currentUrl}`;
    });
    if (chat?.saleOrder) {
      setOrderPageAddress(() => {
        return isProduction
          ? `/foms/front/orders.html?appeal=${chat?.appeal?.id}&chat=${chat?.id}&id=${chat?.saleOrder?.id}&prev=${currentUrl}`
          : `/orders?appeal=${chat?.appeal?.id}&chat=${chat?.id}&id=${chat?.saleOrder?.id}&prev=${currentUrl}`;
      });
    }
  }, [chat]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCommunicationMethodChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedCommunicationMethod(newValue);
  };

  const completeClient = (url?: string) => {
    setMessageLoading(true);
    // setCompletedLoading(true);
    sendEvent({ event: "completeClient", data: { chat, currentUserId } });
    if (url) {
      router.back();
    }
  };

  const onClickClientCard = (address: string) => {
    router.push(address);
  };

  return (
    <Card sx={{ py: order ? 0.5 : 1.5, px: 1 }}>
      <Grid container alignItems="center" spacing={1}>
        <Grid item>
          <Stack direction="row" spacing={1} alignItems="center">
            {!order && messageLoading && <Skeleton variant="circular" sx={{ width: "30px", height: "30px" }} />}
            {!order && messageLoading && (
              <Box>
                <Skeleton
                  variant="text"
                  sx={{ fontSize: "16px", fontWeight: "600", padding: 0, margin: 0, width: "130px", height: "30px" }}
                />
                <Skeleton
                  variant="text"
                  sx={{ padding: 0, margin: 0, fontWeight: 600, width: "130px", height: "30px" }}
                />
              </Box>
            )}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {!order && !messageLoading && (
              <Avatar sx={{ width: "30px", height: "30px", fontSize: 13 }}>{getChatClientName(chat)}</Avatar>
            )}
            {!order && !messageLoading && (
              <Box
                onClick={() => {
                  if (activeChat?.appeal) {
                    handleOpenContactCommentary();
                  }
                }}
                sx={{ cursor: "pointer" }}
              >
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontSize: "12px", fontWeight: "600", padding: 0, margin: 0 }}
                >
                  {activeChat?.appeal ? activeChat?.phoneNumber : activeChat?.fullName}
                </Typography>
                <Typography sx={{ padding: 0, margin: 0, fontWeight: 600, fontSize: 12 }} color="#3f51b5">
                  {contactInfo.name + " " + contactInfo.lastName}
                </Typography>
                {activeChat?.appeal && <Typography fontSize={12}>{contactInfo.commentary.slice(0, 50)}...</Typography>}
              </Box>
            )}
          </Stack>
        </Grid>
        {activeChat?.appeal && messageLoading && (
          <Box sx={{ flexGrow: 1 }}>
            <Stack direction="row">
              <Button>
                <Skeleton variant="rounded" width={30} height={30} />
              </Button>
              <Button>
                <Skeleton variant="rounded" width={30} height={30} />
              </Button>
              <Button>
                <Skeleton variant="rounded" width={30} height={30} />
              </Button>
            </Stack>
          </Box>
        )}
        {activeChat?.appeal && !messageLoading && (
          <Grid item flexGrow={1} alignItems="center">
            <Tabs
              value={selectedCommunicationMethod}
              onChange={handleCommunicationMethodChange}
              aria-label="contact communication methods"
            >
              {ContactCommunicationMethods.map((method: CommunicationMethod) => (
                <Tab icon={method.icon} key={method.id} sx={{ padding: "5px", minWidth: "60px" }} />
              ))}
            </Tabs>
          </Grid>
        )}
        {activeChat?.appeal && (
          <Grid item sx={{ display: { xs: "none", md: "none", lg: "block" } }}>
            {!order && !complete && messageLoading && (
              <Button>
                <Skeleton variant="rounded" sx={{ width: "120px", height: "30px" }} />
              </Button>
            )}
            {order && !complete && messageLoading && (
              <Button>
                <Skeleton variant="rounded" sx={{ width: "120px", height: "30px" }} />
              </Button>
            )}
            {!order && !complete && messageLoading && (
              <Button>
                <Skeleton variant="rounded" sx={{ width: "120px", height: "30px" }} />
              </Button>
            )}
            {!order && activeChat?.appeal && !complete && !messageLoading && (
              <Button variant="outlined" color="error" sx={{ marginRight: "10px" }} onClick={() => completeClient()}>
                <DonutLargeIcon sx={{ width: "18px", height: "18px", marginRight: "4px" }} />
                <Typography fontSize={8.5}>Завершить</Typography>
                {completedLoading && <CircularProgress size={18} sx={{ marginLeft: "10px" }} />}
              </Button>
            )}

            {order && activeChat?.appeal && !complete && !messageLoading && (
              <Button
                variant="outlined"
                color="error"
                sx={{ marginRight: "10px" }}
                onClick={() => completeClient(isProduction ? `/foms/front/appeals.html` : `/appeals`)}
              >
                <DonutLargeIcon sx={{ width: "18px", height: "18px", marginRight: "4px" }} />
                <Typography fontSize={8.5}>Завершить</Typography>
              </Button>
            )}
            {!order && activeChat?.appeal && !complete && !messageLoading && (
              <Button
                variant="outlined"
                sx={{ fontSize: 11, marginRight: "10px" }}
                onClick={() => chatCommentaryStory.handleOpenChatCommentary(CommentaryVariant.sendCommentary)}
              >
                <AddCommentIcon sx={{ width: "18px", height: "18px", marginRight: "4px" }} />
                <Typography fontSize={8.5} fontWeight={500}>
                  Оставить Комментарии
                </Typography>
              </Button>
            )}
            {!order && activeChat?.appeal && !complete && !messageLoading && (
              <Button variant="outlined" sx={{ fontSize: 11 }}>
                <ContentPasteGoIcon sx={{ width: "18px", height: "18px", marginRight: "4px" }} />
                <Typography fontSize={8.5} fontWeight={500}>
                  Перейти в карточку
                </Typography>
              </Button>
            )}
            {messageLoading && (
              <IconButton sx={{ ml: "15px" }}>
                <Skeleton variant="circular" width={28} height={28} />
              </IconButton>
            )}
            {!messageLoading && (
              <Button variant="outlined" sx={{ marginLeft: "10px", marginRight: "10px" }}>
                <CallIcon
                  sx={{
                    width: "18px",
                    height: "18px",
                    marginRight: "4px",
                  }}
                />
                <Typography fontSize={8.5} fontWeight={500}>
                  Позвонить
                </Typography>
              </Button>
            )}
            {messageLoading && (
              <IconButton>
                <Skeleton variant="rounded" width={28} height={28} />
              </IconButton>
            )}
            {activeChat?.appeal && !complete && !messageLoading && <TransferClient variant={1} />}
          </Grid>
        )}
        <Grid item sx={{ display: { xs: "block", md: "block", lg: "none" } }}>
          {activeChat?.appeal && (
            <IconButton aria-describedby={id} onClick={handleClick}>
              <MoreVert />
            </IconButton>
          )}
        </Grid>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          {!order && activeChat?.appeal && !complete && !messageLoading && (
            <MenuItem onClick={() => completeClient()}>
              <DonutLargeIcon sx={{ width: "18px", height: "18px", marginRight: "4px", color: "#CC5F5F" }} />
              <Typography fontSize={12} fontWeight={500} sx={{ color: "#CC5F5F" }}>
                Завершить
              </Typography>
            </MenuItem>
          )}
          {order && activeChat?.appeal && !complete && !messageLoading && (
            <MenuItem onClick={() => completeClient(isProduction ? `/foms/front/appeals.html` : `/appeals`)}>
              <DonutLargeIcon sx={{ width: "18px", height: "18px", marginRight: "4px", color: "#CC5F5F" }} />
              <Typography fontSize={12} fontWeight={500} sx={{ color: "#CC5F5F" }}>
                Завершить
              </Typography>
            </MenuItem>
          )}
          {!order && activeChat?.appeal && !complete && !messageLoading && (
            <MenuItem
              sx={{ fontSize: 11, marginRight: "10px" }}
              onClick={() => chatCommentaryStory.handleOpenChatCommentary(CommentaryVariant.sendCommentary)}
            >
              <AddCommentIcon sx={{ width: "18px", height: "18px", marginRight: "4px", color: "#5570F1" }} />
              <Typography fontSize={12} fontWeight={500} sx={{ color: "#5570F1" }}>
                Оставить Комментарии
              </Typography>
            </MenuItem>
          )}
          {!order && activeChat?.appeal && !complete && !messageLoading && (
            <MenuItem>
              <ContentPasteGoIcon sx={{ width: "18px", height: "18px", marginRight: "4px", color: "#5570F1" }} />
              <Typography fontSize={12} fontWeight={500} sx={{ color: "#5570F1" }}>
                Перейти в карточку
              </Typography>
            </MenuItem>
          )}
          {!chatloading && (
            <MenuItem>
              <CallIcon
                sx={{
                  width: "18px",
                  height: "18px",
                  marginRight: "4px",
                  color: "#5570F1",
                }}
              />
              <Typography fontSize={12} fontWeight={500} sx={{ color: "#5570F1" }}>
                Позвонить
              </Typography>
            </MenuItem>
          )}
          {activeChat?.appeal && !complete && !messageLoading && (
            <MenuItem>
              <TransferClient variant={2} />
            </MenuItem>
          )}
        </Menu>
        <ContactProfile
          openModal={openContactCommentary}
          contactInfo={contactInfo}
          form={form}
          activeChat={activeChat}
          setForm={setForm}
          handleCloseModal={handleCloseContactCommentary}
        />
        <ChatCommentary
          openModal={chatCommentaryStory.openChatCommentary}
          handleCloseModal={chatCommentaryStory.handleCloseChatCommentary}
        />
      </Grid>
    </Card>
  );
};
export default memo(ChatHeader);
