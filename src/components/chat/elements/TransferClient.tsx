import {
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import React, { useEffect, useState } from "react";
import { GridSearchIcon } from "@mui/x-data-grid";
import { useChatStore } from "@/stores/chat/chat";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { addChatContactsType, contactType, departMentType } from "@/models/chat/chat";
import AdjustIcon from "@mui/icons-material/Adjust";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

export default function TransferClient({ variant }: { variant: number }) {
  const {
    departMents,
    contacts,
    setContacts,
    sendEvent,
    currentUserId,
    chat,
    chats,
    clients,
    setTransferLoading,
    transferLoading,
  } = useChatStore();
  const [input, setInput] = React.useState<string>("");
  const [intervalEvent, setIntervalEvent] = React.useState<any>(null);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [checkedContacts, setCheckedContacts] = React.useState<contactType[]>([]);
  const [clickDepartMent, setClickDepartMent] = useState<number | string | null>(null);
  const [showDepartMents, setShowDepartMents] = useState<departMentType[]>(departMents);
  const [showContacts, setShowContacts] = useState<addChatContactsType | null>(contacts);

  useEffect(() => {
    setShowDepartMents(departMents);
  }, [departMents]);

  useEffect(() => {
    showDepartMents.forEach((department) => {
      if (department.checked) {
        if (showContacts && showContacts[department.id]) {
          let newContacts = {
            ...showContacts,
            [department.id]: showContacts[department.id].map((el) => {
              if (el.companyDepartment.id === department.id) {
                let findCheckedContact = checkedContacts.find(
                  (chekEl) => chekEl?.linkedUser?.id === el?.linkedUser?.id
                );
                if (!findCheckedContact) {
                  setCheckedContacts((prev) => [...prev, el]);
                }
                return { ...el, checked: true };
              }
              return el;
            }),
          };
          setShowContacts(newContacts);
        }
      } else {
        if (showContacts && showContacts[department.id]) {
          let newContacts = {
            ...showContacts,
            [department.id]: showContacts[department.id].map((el) => {
              if (el.companyDepartment.id === department.id) {
                setCheckedContacts((prev) => prev.filter((checkEl) => checkEl?.linkedUser?.id !== el?.linkedUser?.id));
                return { ...el, checked: false };
              }
              return el;
            }),
          };
          setShowContacts(newContacts);
        }
      }
    });
  }, [showDepartMents]);

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
    showDepartMents.forEach((department) => {
      if (department.checked) {
        if (contacts && contacts[department.id]) {
          let newContacts = {
            ...contacts,
            [department.id]: contacts[department.id].map((el) => {
              if (el.companyDepartment.id === department.id) {
                return { ...el, checked: true };
              }
              return el;
            }),
          };
          setShowContacts(newContacts);
        }
        if (!contacts) {
          setShowContacts(contacts);
        }
      } else {
        if (contacts && contacts[department.id]) {
          let newContacts = {
            ...contacts,
            [department.id]: contacts[department.id].map((el) => {
              let findCheckedContact = checkedContacts.find(
                (checkEl) => checkEl?.linkedUser?.id === el?.linkedUser?.id
              );
              if (findCheckedContact) {
                return { ...el, checked: true };
              }
              if (el.companyDepartment.id === department.id) {
                return { ...el, checked: false };
              }
              return el;
            }),
          };
          setShowContacts(newContacts);
        }
        if (!contacts) {
          setShowContacts(contacts);
        }
      }
    });
  }, [contacts]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const onChangeInput = (e: any) => {
    setInput(e.target.value);
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

  const onClickTransfer = () => {
    setTransferLoading(true);
    let clients = chats[0];
    let currentChat = clients.find((el) => el.id === chat?.id);
    sendEvent({
      event: "transferClient",
      data: {
        currentUserId,
        chat,
        checkedContacts,
        lastMessage: currentChat?.lastMessage,
      },
    });
    setAnchorEl(null);
  };

  React.useEffect(() => {
    setIntervalEvent(
      setTimeout(() => {
        if (input.length > 0) {
          sendEvent({
            event: "searchContacts",
            data: { currentUserId, fullName: input },
          });
          setClickDepartMent("searchContacts");
        }
        if (input.length === 0 && currentUserId) {
          sendEvent({ event: "getDepartments", data: { currentUserId } });
        }
      }, 500)
    );
    return () => {
      clearInterval(intervalEvent);
    };
  }, [input]);

  return (
    <Box sx={{ display: "inline-block" }}>
      {variant === 1 && (
        <Button variant="outlined">
          <ReplyOutlinedIcon
            sx={{
              color: "#007AFF",
              transform: "scaleX(-1)",
              width: "18px",
              height: "18px",
              marginRight: "4px",
            }}
          />
          <Typography fontSize={8.5} fontWeight={500}>
            Передать чат
          </Typography>
        </Button>
      )}
      {variant === 2 && (
        <button style={{ width: "100%", background: "transparent", border: "none" }}>
          <Stack direction="row">
            <ReplyOutlinedIcon
              sx={{
                transform: "scaleX(-1)",
                width: "18px",
                height: "18px",
                marginRight: "4px",
                color: "#5570F1",
              }}
            />
            <Typography fontSize={12} fontWeight={500} sx={{ color: "#5570F1" }}>
              Передать чат
            </Typography>
          </Stack>
        </button>
      )}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box sx={{ m: 1 }}>
          <List>
            <ListItem>
              <Stack direction="column" sx={{ width: "100%" }}>
                <Box sx={{ border: "1px solid #9e9e9e3d", borderRadius: "5px", marginBottom: "8px" }}>
                  <InputBase
                    sx={{ width: "100%", fontSize: 11 }}
                    placeholder="Search"
                    autoFocus={true}
                    startAdornment={
                      <IconButton>
                        <GridSearchIcon sx={{ width: "18px", height: "18px" }} />
                      </IconButton>
                    }
                    onChange={onChangeInput}
                  />
                </Box>
                <Typography sx={{ fontSize: 14 }} fontWeight={500}>
                  Поиск сотрудников по отделам
                </Typography>
              </Stack>
            </ListItem>
          </List>
          <Divider />
          <List sx={{ maxHeight: "500px", overflow: "auto", width: "600px" }}>
            <Typography sx={{ fontSize: 14 }} fontWeight={500}>
              Отделы
            </Typography>
            {showDepartMents?.map((department) => {
              return (
                <>
                  <Stack direction="row">
                    {clickDepartMent && clickDepartMent === department.id && (
                      <Checkbox
                        sx={{ padding: 0, margin: 0 }}
                        checked={department.checked}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setShowDepartMents(
                              showDepartMents.map((el) => {
                                if (el.id === department.id) {
                                  return { ...el, checked: true };
                                }
                                return el;
                              })
                            );
                          } else {
                            setShowDepartMents(
                              showDepartMents.map((el) => {
                                if (el.id === department.id) {
                                  return { ...el, checked: false };
                                }
                                return el;
                              })
                            );
                          }
                        }}
                      />
                    )}
                    <ListItemButton
                      sx={{ paddingLeft: "8px" }}
                      key={department.id}
                      onClick={() => onClickDepartment(department)}
                    >
                      <Avatar sx={{ width: "20px", height: "20px" }}>
                        <Typography fontSize={7}>{department.name}</Typography>
                      </Avatar>
                      <ListItemText
                        primary={<Typography fontSize={10}>{department.name}</Typography>}
                        secondary=""
                        sx={{
                          marginLeft: "10px",
                          "& span": {
                            fontSize: "11px !important",
                          },
                        }}
                      />
                      {clickDepartMent && clickDepartMent === department.id ? (
                        <KeyboardArrowDownIcon />
                      ) : (
                        <KeyboardArrowUpIcon />
                      )}
                    </ListItemButton>
                  </Stack>

                  {showContacts && department && showContacts[department.id] && (
                    <List sx={{ maxHeight: "200px", overflow: "auto" }}>
                      {/* <Typography sx={{ fontSize: 12, marginLeft: '20px' }} fontWeight={500}>
                    Сотрудники
                  </Typography> */}
                      {showContacts[department.id] &&
                        showContacts[department.id].map((contact) => (
                          <ListItem key={contact.id} sx={{ padding: 0, paddingLeft: "30px" }}>
                            <Checkbox
                              checked={contact.checked}
                              onChange={(event) => {
                                if (event.target.checked) {
                                  let newContacts = {
                                    ...showContacts,
                                    [department.id]: showContacts[department.id].map((el) => {
                                      if (el?.linkedUser?.id === contact?.linkedUser?.id) {
                                        return { ...el, checked: true };
                                      }
                                      return el;
                                    }),
                                  };
                                  setShowContacts(newContacts);
                                  setCheckedContacts((prev) => [...prev, contact]);
                                } else {
                                  let newContacts = {
                                    ...showContacts,
                                    [department.id]: showContacts[department.id].map((el) => {
                                      if (el?.linkedUser?.id === contact?.linkedUser?.id) {
                                        return { ...el, checked: false };
                                      }
                                      return el;
                                    }),
                                  };
                                  setShowContacts(newContacts);
                                  setCheckedContacts((prev) =>
                                    prev.filter((el) => el?.linkedUser?.id !== contact?.linkedUser?.id)
                                  );
                                }
                              }}
                            />
                            <Avatar sx={{ width: "20px", height: "20px", fontSize: 8 }}>
                              <Typography fontSize={7}>{department.name}</Typography>
                            </Avatar>
                            <ListItemText
                              primary={
                                <Box>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography fontSize={11}>{contact?.linkedUser?.fullName}</Typography>
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
                          </ListItem>
                        ))}
                    </List>
                  )}
                </>
              );
            })}
            {showDepartMents.length === 0 && (
              <ListItem>
                <Typography fontSize={11}>No data</Typography>
              </ListItem>
            )}
          </List>
          <List>
            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ paddingRight: "20px" }}>
              <Button variant="outlined">
                <Typography
                  fontSize={9}
                  fontWeight={500}
                  onClick={() => {
                    setAnchorEl(null);
                  }}
                >
                  Отменить
                </Typography>
              </Button>
              <Button variant="outlined" onClick={onClickTransfer}>
                <Typography fontSize={9} fontWeight={500}>
                  Передать
                </Typography>
                {transferLoading && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ position: "absolute", bgcolor: "#fff", left: 0, right: 0, top: 0, bottom: 0 }}
                  >
                    <CircularProgress size={16} />
                  </Stack>
                )}
              </Button>
            </Stack>
          </List>
        </Box>
      </Popover>
    </Box>
  );
}
