"use client";

import {
  Box,
  Paper,
  Badge,
  Dialog,
  Avatar,
  Button,
  Tooltip,
  Popover,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { Dayjs } from "dayjs";
import { enqueueSnackbar } from "notistack";
import { TUserModel } from "@/models/user/user";
import SendIcon from "@mui/icons-material/Send";
import ClearIcon from "@mui/icons-material/Clear";
import ForumIcon from "@mui/icons-material/Forum";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useForm, Controller } from "react-hook-form";
import { deepOrange, blue } from "@mui/material/colors";
import RateReviewIcon from "@mui/icons-material/RateReview";
import React, { useEffect, useState, useContext } from "react";
import { generateUUID } from "@/components/account/personal-area/_helpers";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { useUserNewsCommentsStore } from "@/stores/personal-area/news/news-comments";
import { useUserAttendanceStore } from "@/stores/personal-area/user-attendance/user-attendance";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";

type PropsType = {
  showBadge?: boolean;
  dateOfCell: Dayjs | null;
  reloadAllAttendance: () => void;
  attendance: Record<string, any> | null;
};

interface Message {
  text: string;
  senderId: string;
  messageId: string;
  senderName: string;
  senderProfileImage: string | null;
}

interface ChatBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  showAvatar: boolean;
}

interface ChatProps {
  messages: Message[];
  currentUserId: string;
}

const UserAttendanceReview = ({ attendance, dateOfCell, reloadAllAttendance, showBadge }: PropsType) => {
  const commentsStore = useUserNewsCommentsStore();
  const attendanceStore = useUserAttendanceStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const currentUserContext = useContext(CurrentUserContext);
  const [flagReloadAct, setFlagReloadAct] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<TUserModel | null>(null);
  const [targetUser, setTargetUser] = useState<Record<string, any> | null>(null);
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);
  const [anchorPopOverEl, setAnchorPopOverEl] = React.useState<HTMLButtonElement | null>(null);

  const currentUserId = `${currentUser?.id}`;
  const openConversationPopOver = Boolean(anchorPopOverEl);
  const conversationPopOverId = openConversationPopOver ? "conversation-popover" : undefined;

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isDirty, errors },
  } = useForm({
    defaultValues: {
      comment: "",
    },
  });

  const onSubmit = (data: Record<string, any>) => {
    if (isDirty) {
      const requestBody = preparingRequestBody(data);

      commentsStore.createComment(requestBody, (data: Record<string, any>) => {
        if (data.status === 0) {
          reset();
          setFlagReloadAct(true);

          setMessages((prev: Message[]) => {
            const messageObject = {
              text: `${requestBody?.data?.text}`,
              messageId: `${generateUUID()}`,
              senderId: `${requestBody?.data?.relatedUser?.id}`,
              senderName: `${currentUser?.partner?.name}`,
              senderProfileImage: null,
            };
            return [...prev, messageObject];
          });
        } else {
          enqueueSnackbar("Something has gone wrong!", { variant: "error" });
        }
      });
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorPopOverEl(event.currentTarget);
  };

  const handleClose = () => {
    if (flagReloadAct) reloadAllAttendance();
    setAnchorPopOverEl(null);
  };

  const preparingMessages = (data: Record<string, any> | null) => {
    let messages: Message[] = [];
    data?.conversation?.map((conversation: Record<string, any>) => {
      let messageObject: Message | undefined;
      messageObject = {
        text: `${conversation?.text}`,
        messageId: `${conversation?.id}`,
        senderId: `${conversation?.user?.id}`,
        senderName: `${conversation?.user?.name}`,
        senderProfileImage: conversation?.user?.image,
      };

      if (messageObject) messages.push(messageObject);
    });

    return messages;
  };

  const preparingRequestBody = (data: Record<string, any>) => {
    return {
      data: {
        text: data.comment,
        attendance: { id: attendance?.id },
        relatedUser: { id: currentUser?.id },
      },
    };
  };

  const TerminateConversation = () => {
    const commentsStore = useUserNewsCommentsStore();
    const [deletionConfirmationOpen, setDeletionConfirmationOpen] = useState<boolean>(false);

    const handleTerminateConfirmationClose = () => {
      setDeletionConfirmationOpen(false);
    };

    const handleTerminateConversation = () => {
      if (attendance?.conversation.length > 0) {
        let promises: Promise<void>[] = [];

        attendance?.conversation.map((conversation: Record<string, any>) => {
          promises.push(commentsStore.deleteComment(conversation.id, (data: Record<string, any>) => {}));
        });

        Promise.all(promises)
          .then(() => {
            reloadAllAttendance();
            setAnchorPopOverEl(null);
          })
          .catch((error) => {
            console.error("Error during the terminating conversation", error);
          });
      }
    };

    return (
      <>
        {attendance?.conversation?.length > 0 && (
          <IconButton
            size="small"
            onClick={() => {
              setDeletionConfirmationOpen(true);
            }}
            sx={{
              backgroundColor: "#5F8CCC",
              color: "white",
              "&:hover": {
                backgroundColor: "#5F8CCC",
                color: "white",
              },
            }}
          >
            <Tooltip title="Завершить разговор">
              <DoneAllIcon fontSize="small" />
            </Tooltip>
          </IconButton>
        )}

        <Dialog
          open={deletionConfirmationOpen}
          onClose={handleTerminateConfirmationClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Завершить разговор</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Вы точно хотите завершить данную разговор?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="secondary" onClick={handleTerminateConfirmationClose}>
              Отмена
            </Button>
            <Button color="success" onClick={handleTerminateConversation} autoFocus>
              Завершить
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };

  const ChatBubble: React.FC<ChatBubbleProps> = ({ message, showAvatar, isCurrentUser }) => {
    return (
      <Box
        sx={{
          mb: 1,
          display: "flex",
          alignItems: "flex-end",
          flexDirection: isCurrentUser ? "row-reverse" : "row",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "start", flexDirection: isCurrentUser ? "row-reverse" : "row", gap: 2 }}
        >
          <Tooltip title={message.senderName}>
            {!!message.senderProfileImage ? (
              <Avatar
                src={message.senderProfileImage}
                sx={{
                  width: 28,
                  height: 28,
                  cursor: "pointer",
                  visibility: `${showAvatar ? "" : "hidden"}`,
                }}
              />
            ) : (
              <Avatar
                sx={{
                  bgcolor: deepOrange[500],
                  width: 28,
                  height: 28,
                  cursor: "pointer",
                  visibility: `${showAvatar ? "" : "hidden"}`,
                }}
              >
                {message.senderName[0]}
              </Avatar>
            )}
          </Tooltip>
          <Paper
            sx={
              isCurrentUser
                ? {
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: blue[500],
                    color: "white",
                    maxWidth: "210px",
                    textAlign: "left",
                    position: "relative",
                    ml: 1,
                    ...(showAvatar
                      ? {
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            top: 5,
                            right: "-10px",
                            width: 0,
                            height: 0,
                            borderTop: "10px solid transparent",
                            borderBottom: "10px solid transparent",
                            borderLeft: `10px solid ${blue[500]}`,
                          },
                        }
                      : {}),
                  }
                : {
                    p: 1.5,
                    bgcolor: "lightgray",
                    color: "black",
                    maxWidth: "210px",
                    textAlign: "left",
                    position: "relative",
                    mr: 1,
                    ...(showAvatar
                      ? {
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 4,
                            left: "-10px",
                            width: 0,
                            height: 0,
                            borderTop: "10px solid transparent",
                            borderBottom: "10px solid transparent",
                            borderRight: "10px solid lightgray",
                          },
                        }
                      : {}),
                  }
            }
          >
            <Typography variant="body2">{message.text}</Typography>
          </Paper>
        </Box>
      </Box>
    );
  };

  const Chat: React.FC<ChatProps> = ({ messages, currentUserId = currentUser?.id }) => {
    let prevSenderId = "";

    return (
      <Box sx={{ p: 2 }}>
        {messages.map((message) => {
          const showAvatar = message.senderId !== prevSenderId;
          prevSenderId = message.senderId;

          return (
            <ChatBubble
              message={message}
              showAvatar={showAvatar}
              key={message.messageId}
              isCurrentUser={message.senderId === currentUserId}
            />
          );
        })}
      </Box>
    );
  };

  useEffect(() => {
    if (currentUserContext?.currentUser) setCurrentUser(currentUserContext?.currentUser);
    if (currentUserContext?.userRoles) setCurrentUserRoles(currentUserContext?.userRoles);

    setMessages(preparingMessages(attendance));
  }, [currentUserContext]);

  useEffect(() => {
    if (currentUserRoles?.isHR) {
      setTargetUser(attendance?.conversation[0]?.user);
    }
  }, [currentUserRoles]);

  return (
    <Box>
      <IconButton
        disabled={attendance?.verified || currentUserRoles?.isAdmin}
        sx={{
          width: 22,
          height: 22,
          bgcolor: "white",
          "&:hover": {
            backgroundColor: "white",
            color: "#5F8CCC",
          },
        }}
        onClick={handleClick}
      >
        {showBadge ? (
          <>
            <Badge
              badgeContent={attendance?.conversation?.length}
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "#5F8CCC",
                  color: "white",
                },
              }}
            >
              <Tooltip
                title={`Ответить ${attendance?.conversation?.length > 0 ? `(${attendance?.conversation?.length} сообщения)` : ""}`}
              >
                <RateReviewIcon sx={attendance?.conversation?.length > 0 ? { color: "#5F8CCC" } : {}} />
              </Tooltip>
            </Badge>
          </>
        ) : (
          <Tooltip
            title={`Обратиться к HR ${attendance?.conversation?.length > 0 ? `(${attendance?.conversation?.length} сообщения)` : ""}`}
          >
            <DriveFileRenameOutlineIcon
              fontSize="small"
              sx={attendance?.conversation?.length > 0 ? { color: "#5F8CCC", borderRadius: "50%" } : {}}
            />
          </Tooltip>
        )}
      </IconButton>

      <Popover
        id={conversationPopOverId}
        open={openConversationPopOver}
        anchorEl={anchorPopOverEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box sx={{ height: "250px", minWidth: { xs: "250px", sm: "350px" } }}>
          <Box
            sx={{
              px: 1,
              zIndex: 20,
              position: "relative",
              height: "50px",
              display: "flex",
              borderBottom: 1,
              alignItems: "center",
              borderColor: "lightgray",
              justifyContent: "space-between",
              boxShadow: "0px 2px 7px rgba(0, 0, 0, 0.3)",
            }}
          >
            <>
              {currentUserRoles?.isHR ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    src={targetUser?.image ? targetUser.image : undefined}
                    sx={{ bgcolor: deepOrange[500], width: 28, height: 28 }}
                  />

                  <Typography noWrap={true} sx={{ maxWidth: "200px", fontWeight: "bold" }}>
                    {targetUser?.name}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar sx={{ bgcolor: deepOrange[500], width: 28, height: 28 }} />

                  <Typography noWrap={true} sx={{ maxWidth: "200px", fontWeight: "bold" }}>
                    Специалист по кадрам
                  </Typography>
                </Box>
              )}
            </>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TerminateConversation />
              <IconButton size="small" aria-label="close-modal" sx={{ bgcolor: "#f5f6fa" }} onClick={handleClose}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Box
            sx={{
              px: 1,
              gap: 1,
              zIndex: 10,
              height: "20px",
              display: "flex",
              bgcolor: "#e4fce4",
              alignItems: "center",
              alignContent: "center",
              borderColor: "lightgray",
              position: "relative",
            }}
          >
            <ForumIcon fontSize="inherit" sx={{ color: "gray" }} />
            <Typography sx={{ fontSize: "12px" }}>Дата: {dateOfCell ? dateOfCell.format("DD.MM.YYYY") : ""}</Typography>
          </Box>
          <Box
            sx={{
              height: "130px",
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            <Chat messages={messages} currentUserId={currentUserId} />
          </Box>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              height: "50px",
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1,
              borderTop: 1,
              borderColor: "lightgray",
              boxShadow: "0px -4px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Box sx={{ width: "90%", border: 1, borderColor: "lightgray", borderRadius: "15px" }}>
              <Controller
                name="comment"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="text"
                    size="small"
                    placeholder="Введите сообщение..."
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "transparent",
                        },
                        "&:hover fieldset": {
                          borderColor: "transparent",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "transparent",
                        },
                        "&.Mui-focused": {
                          boxShadow: "none",
                        },
                      },
                    }}
                    inputProps={{
                      autoComplete: "off",
                    }}
                  />
                )}
              />
            </Box>
            <IconButton
              size="small"
              type="submit"
              sx={{
                backgroundColor: "#5F8CCC",
                color: "white",
                "&:hover": {
                  backgroundColor: "#5F8CCC",
                  color: "white",
                },
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default UserAttendanceReview;
