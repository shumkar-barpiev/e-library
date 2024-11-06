"use client";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { Avatar, Button, CircularProgress, IconButton, InputBase, Stack, Typography } from "@mui/material";
import { GridSearchIcon } from "@mui/x-data-grid";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { useChatStore } from "@/stores/chat/chat";
import { getClientName } from "../helpers/helpers";
import { IMaskInput } from "react-imask";
import { useEffect, useState } from "react";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { clientContactType, contactType, departMentType } from "@/models/chat/chat";
import AdjustIcon from "@mui/icons-material/Adjust";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

export default function ContactDrawer({ selectedContactGroup }: { selectedContactGroup: number }) {
  const {
    contacts,
    setContacts,
    departMents,
    sendEvent,
    currentUserId,
    clients,
    setAddClientLoading,
    addClientLoading,
  } = useChatStore((state) => state);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState<string>("");
  const [intervalEvent, setIntervalEvent] = useState<any>(null);
  const [clientPhoneNumber, setClientPhoneNumber] = useState<string>("");
  const [btnDisabled, setBtnDisabled] = useState<boolean>(true);
  const [clickDepartMent, setClickDepartMent] = useState<number | null | string>(null);
  const [showDepartMents, setShowDepartMents] = useState<departMentType[]>(departMents);

  useEffect(() => {
    setShowDepartMents(departMents);
  }, [departMents]);

  useEffect(() => {
    if (clickDepartMent === "searchContacts") {
      let newDepartMents: departMentType[] = [];
      for (let key in contacts) {
        let department: departMentType | undefined = departMents.find((el) => el.id == +key);
        if (department) {
          newDepartMents.push(department);
        }
      }
      setShowDepartMents(newDepartMents);
    }
  }, [contacts, clickDepartMent]);

  const onChangePhone = ({ phoneNumber }: { phoneNumber: string }) => {
    setClientPhoneNumber(phoneNumber);
  };

  useEffect(() => {
    if (clientPhoneNumber.length === 12) {
      setBtnDisabled(false);
    } else {
      setBtnDisabled(true);
    }
  }, [clientPhoneNumber]);

  const onClickAddClient = () => {
    setAddClientLoading(true);
    sendEvent({
      event: "addClient",
      data: {
        currentUserId,
        clientPhoneNumber: clientPhoneNumber,
      },
    });
    setOpen(false);
  };

  const toggleDrawer = (newOpen: boolean) => () => {
    if (newOpen) {
      if (selectedContactGroup === 1) {
        sendEvent({ event: "getDepartments", data: { currentUserId } });
      }
      if (selectedContactGroup === 0) {
        sendEvent({ event: "getClients", data: { currentUser: currentUserId } });
      }
    }

    setOpen(newOpen);
  };

  const onClickListContact = ({ contact, newOpen }: { contact: contactType; newOpen: boolean }) => {
    sendEvent({
      event: "createorGetChat",
      data: { currentUserId: { id: currentUserId?.id }, userId: contact?.linkedUser?.id, typeChat: 1 },
    });
    setOpen(newOpen);
  };

  const onClickDepartment = (department: departMentType) => {
    if (clickDepartMent !== department.id) {
      setClickDepartMent(department.id);
      sendEvent({
        event: "searchContacts",
        data: {
          currentUserId,
          department,
        },
      });
    } else {
      setClickDepartMent(null);
      setContacts(null);
    }
  };

  const onClickListClient = ({ client, newOpen }: { client: clientContactType; newOpen: boolean }) => {
    sendEvent({
      event: "createOrgetChatClient",
      data: {
        currentUserId,
        client,
        typeChat: 1,
      },
    });
    setOpen(newOpen);
  };

  useEffect(() => {
    setIntervalEvent(
      setTimeout(() => {
        if (input.length > 0 && selectedContactGroup === 0) {
          if (!isNaN(parseInt(input[0]))) {
            sendEvent({
              event: "searchClients",
              data: { currentUserId, phoneNumber: parseInt(input) },
            });
          }
          if (isNaN(parseInt(input[0]))) {
            sendEvent({
              event: "searchClients",
              data: { currentUserId, name: input },
            });
          }
        }
        if (input.length === 0 && selectedContactGroup === 0) {
          sendEvent({ event: "getClients", data: { currentUser: currentUserId } });
        }
        if (input.length > 0 && selectedContactGroup === 1) {
          sendEvent({
            event: "searchContacts",
            data: { currentUserId, fullName: input },
          });
          setClickDepartMent("searchContacts");
        }
        if (input.length === 0 && selectedContactGroup === 1 && currentUserId) {
          sendEvent({ event: "getDepartments", data: { currentUserId } });
        }
      }, 500)
    );
    return () => {
      clearInterval(intervalEvent);
    };
  }, [input]);

  const onChangeInput = (e: any) => {
    setInput(e.target.value);
  };

  const DrawerList = (
    <Box sx={{ width: 355 }} role="presentation">
      <List>
        <ListItem>
          <Stack direction="column" sx={{ width: "100%" }}>
            <Box sx={{ border: "1px solid #9e9e9e3d", borderRadius: "5px", marginBottom: "8px" }}>
              <InputBase
                sx={{ width: "100%" }}
                placeholder="Search"
                autoFocus={true}
                startAdornment={
                  <IconButton>
                    <GridSearchIcon sx={{ width: "20px", height: "20px" }} />
                  </IconButton>
                }
                onChange={onChangeInput}
              />
            </Box>
            {selectedContactGroup === 0 && <Typography fontWeight={500}>Поиск по клиентам</Typography>}
            {selectedContactGroup === 1 && <Typography fontWeight={500}>Поиск по коллегам</Typography>}
          </Stack>
        </ListItem>
      </List>
      <Divider />
      <List>
        {selectedContactGroup === 1 &&
          showDepartMents &&
          showDepartMents?.map((department) => {
            return (
              <>
                <ListItemButton key={department.id} onClick={() => onClickDepartment(department)}>
                  <Avatar sx={{ width: "30px", height: "30px" }}>
                    <Typography fontSize={10}>{department.name}</Typography>
                  </Avatar>
                  <ListItemText
                    primary={<Typography fontSize={10}>{department.name}</Typography>}
                    secondary=""
                    sx={{ marginLeft: "10px" }}
                  />
                  {clickDepartMent && clickDepartMent === department.id ? (
                    <KeyboardArrowDownIcon />
                  ) : (
                    <KeyboardArrowUpIcon />
                  )}
                </ListItemButton>
                {contacts && department && contacts[department.id] && (
                  <List sx={{ maxHeight: "200px", overflow: "auto" }}>
                    {contacts[department.id] &&
                      contacts[department.id].map((contact) => {
                        return (
                          <ListItemButton
                            key={contact.id}
                            sx={{ paddingLeft: "40px" }}
                            onClick={() => onClickListContact({ contact, newOpen: false })}
                          >
                            <Avatar sx={{ width: "20px", height: "20px" }}>
                              <Typography fontSize={7}>{contact?.linkedUser?.fullName}</Typography>
                            </Avatar>
                            <ListItemText
                              primary={
                                <Box>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography fontSize={12}>{contact?.linkedUser?.fullName}</Typography>
                                    {contact?.status === "Онлайн" ? (
                                      <FiberManualRecordIcon sx={{ color: "green", width: "15px" }} />
                                    ) : (
                                      <AdjustIcon sx={{ width: "15px", color: "c#c#c#" }} />
                                    )}
                                  </Stack>
                                </Box>
                              }
                              secondary=""
                              sx={{
                                marginLeft: "10px",
                                "& span": {
                                  fontSize: "11px !important",
                                },
                              }}
                            />
                          </ListItemButton>
                        );
                      })}
                  </List>
                )}
              </>
            );
          })}
        {selectedContactGroup === 1 && showDepartMents.length === 0 && (
          <ListItem>
            <Typography fontSize={11}>No data</Typography>
          </ListItem>
        )}
        {selectedContactGroup === 0 &&
          clients &&
          clients?.map((client) => {
            return (
              <ListItemButton key={client.id} onClick={() => onClickListClient({ client, newOpen: false })}>
                <Avatar sx={{ width: "30px", height: "30px", fontSize: 12 }}>{getClientName(client)}</Avatar>
                {client["client.id"] && (
                  <ListItemText
                    primary={client["client.fullName"]}
                    secondary={client["client.mobilePhone"]}
                    sx={{ marginLeft: "10px" }}
                  />
                )}
                {!client["client.id"] && (
                  <ListItemText primary={client.name} secondary={client.phoneNumber} sx={{ marginLeft: "10px" }} />
                )}
              </ListItemButton>
            );
          })}
        {selectedContactGroup === 0 && clients.length === 0 && (
          <Box sx={{ padding: "10px" }}>
            <Stack direction="row" justifyContent="center">
              <Typography>Такого контакта нет!</Typography>
            </Stack>
            <Box>
              <Typography textAlign="left">Добавьте этот номер к себе в контакты!</Typography>
              <IMaskInput
                mask={"{+996}(000)-00-00-00"}
                lazy={false}
                value={clientPhoneNumber}
                onAccept={(value: string) => {
                  onChangePhone({ phoneNumber: value.replace(/[^a-zA-Z0-9]/g, "") });
                }}
                style={{ padding: "8px", border: "1px solid #9e9e9e3d", borderRadius: "5px" }}
              />
              <Button disabled={btnDisabled} onClick={onClickAddClient}>
                <Typography fontSize={12} fontWeight={500}>
                  Добавить
                </Typography>
                {addClientLoading && (
                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, bgcolor: "#fff" }}
                  >
                    <CircularProgress size={16} />
                  </Stack>
                )}
              </Button>
            </Box>
          </Box>
        )}
      </List>
    </Box>
  );

  return (
    <div>
      <IconButton onClick={toggleDrawer(true)}>
        <AddBoxIcon />
      </IconButton>
      <Drawer open={open} onClose={toggleDrawer(false)} sx={{ zIndex: "1301" }}>
        {DrawerList}
      </Drawer>
    </div>
  );
}
