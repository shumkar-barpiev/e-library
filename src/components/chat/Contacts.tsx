"use client";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import {
  Badge,
  CircularProgress,
  CssBaseline,
  IconButton,
  InputBase,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useChatStore } from "@/stores/chat/chat";
import { Contact } from "./elements/Contact";
import theme from "@/styles/theme";
import { ClientType, ColleaguesModel } from "@/models/chat/chat";
import ContactDrawer from "./elements/ContactsDrawer";

const ContactBox = styled(Box)({
  boxShadow: theme.shadows[2],
  borderRadius: theme.shape.borderRadius,
  height: "100vh",
});

type ContactGroupType = {
  id: number;
  label: string;
};

const contactsGroups: ContactGroupType[] = [
  { id: 1, label: "Гражданин" },
  { id: 2, label: "Рабочий чат" },
];

export default function Contacts() {
  const { chats, selectedContactGroup, setSelectedContactGroups, setChat, sendEvent, currentUserId, chatsLoading } =
    useChatStore((state) => state);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [searchInput, setSearchInput] = useState<string>("");
  const [intervalEvent, setIntervalEvent] = useState<any>(null);

  const onChangeSearchInput = (e: any) => {
    setSearchInput(e.target.value);
  };

  useEffect(() => {
    setIntervalEvent(
      setTimeout(() => {
        if (searchInput.length > 0 && selectedContactGroup === 0) {
          if (!isNaN(parseInt(searchInput[0]))) {
            sendEvent({
              event: "searchActiveClients",
              data: { currentUserId, phoneNumber: parseInt(searchInput) },
            });
          }
          if (isNaN(parseInt(searchInput[0]))) {
            sendEvent({
              event: "searchActiveClients",
              data: { currentUserId, name: searchInput },
            });
          }
        }
        if (searchInput.length === 0 && selectedContactGroup === 0 && currentUserId) {
          sendEvent({ event: "currentUser", data: { currentUserId: currentUserId } });
        }
        if (searchInput.length > 0 && selectedContactGroup === 1) {
          sendEvent({
            event: "searchActiveUsers",
            data: { currentUserId, name: searchInput },
          });
        }
        if (searchInput.length === 0 && selectedContactGroup === 1 && currentUserId) {
          sendEvent({ event: "currentUser", data: { currentUserId: currentUserId, activeUserSearch: true } });
        }
      }, 500)
    );
    return () => {
      clearInterval(intervalEvent);
    };
  }, [searchInput]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const handleContactsGroupChange = (event: any, newValue: number) => {
    setSelectedContactGroups(newValue);
  };

  useEffect(() => {
    setChat(null);
  }, [selectedContactGroup]);

  return (
    <ContactBox sx={{ pb: 7, border: "1px solid #C2C6CA" }}>
      <CssBaseline />
      <Stack direction="column">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ backgroundColor: "#fff", width: "100%", padding: 1 }}
        >
          <Typography variant="subtitle1" color="#007AFF" fontSize="17px" sx={{ flexGrow: 1 }}>
            Чаты
          </Typography>
          <ContactDrawer selectedContactGroup={selectedContactGroup} />
        </Stack>
        <Box
          component="form"
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "4px",
            height: "40px",
            borderRadius: "4px",
            border: "1px solid #9e9e9e3d",
          }}
        >
          <InputBase
            sx={{ flex: 1 }}
            placeholder="Search"
            startAdornment={
              <IconButton>
                <SearchIcon sx={{ width: "20px", height: "20px" }} />
              </IconButton>
            }
            onChange={onChangeSearchInput}
          />
        </Box>
      </Stack>
      <Stack
        direction="row"
        justifyContent="center"
        gap="5px"
        sx={{
          borderBottom: "1px solid #9e9e9e3d",
          padding: 1,
        }}
        spacing={1}
      >
        <Tabs
          value={selectedContactGroup}
          onChange={handleContactsGroupChange}
          aria-label="contact type"
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          {contactsGroups.map((contact: ContactGroupType, index) => (
            <Tab
              key={contact.id}
              label={
                <Box sx={{ width: "100px" }}>
                  <Stack direction="row" justifyContent="flex-end" sx={{ marginRight: "-4px" }} alignItems="center">
                    <Badge badgeContent={getAllCount(index, chats)} color="primary"></Badge>
                  </Stack>
                  <Typography fontSize={11} fontWeight={600}>
                    {contact.label}
                  </Typography>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Stack>
      <Box sx={{ position: "relative", height: "82vh", overflow: "auto" }}>
        {chats[selectedContactGroup].map((contact: ClientType | ColleaguesModel) => {
          return <Contact key={contact?.id} contact={contact} />;
        })}
        {chatsLoading && (
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: "#fff" }}
          >
            <CircularProgress />
          </Stack>
        )}
      </Box>
    </ContactBox>
  );
}

function getAllCount(index: number, chats: [ClientType[], ColleaguesModel[]]) {
  let sum = 0;
  chats[index].forEach((el) => {
    if (el.unreadMessageCount) {
      sum += +el.unreadMessageCount;
    }
  });
  return sum;
}
