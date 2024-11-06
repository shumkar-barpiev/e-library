"use client";

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
import { useUserActsStore } from "@/stores/personal-area/acts/acts";
import { useUserNewsCommentsStore } from "@/stores/personal-area/news/news-comments";
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
  AvatarGroup,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { ActsContext } from "@/components/account/personal-area/finance/ActsInProgress/ActsInProgressProvider";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";

type PropsType = {
  actLineIndex: number;
  reloadTheAct: () => void;
  act: Record<string, any> | null;
  actLine: Record<string, any> | null;
};

interface Message {
  text: string;
  senderId: string;
  messageId: string;
  senderName: string;
  senderProfileImage: string;
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

const ActLineReview = ({ act, actLine, actLineIndex, reloadTheAct }: PropsType) => {
  const actStore = useUserActsStore();
  const actsContext = useContext(ActsContext);
  const commentsStore = useUserNewsCommentsStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const currentUserContext = useContext(CurrentUserContext);
  const [flagReloadAct, setFlagReloadAct] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<TUserModel | null>(null);
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

  const updateActStatus = () => {
    if (act?.status === "created") {
      const requestBody = {
        data: {
          id: act?.id,
          status: "inProgress",
        },
      };

      actStore.updateAct(requestBody, (data: Record<string, any>) => {
        if (data.status === 0) {
          actsContext?.reloadActs();
        } else {
          enqueueSnackbar("Не удалось обновить Act", { variant: "error" });
        }
      });
    }
  };

  const onSubmit = (data: Record<string, any>) => {
    if (isDirty) {
      const requestBody = preparingRequestBody(data);

      commentsStore.createComment(requestBody, (data: Record<string, any>) => {
        if (data.status === 0) {
          reset();
          reloadActLine();
          setFlagReloadAct(true);
          actsContext?.reloadActs();
          updateActStatus();
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
    if (flagReloadAct) reloadTheAct();
    setAnchorPopOverEl(null);
  };

  const reloadActLine = () => {
    actStore.fetchActLineById(actLine?.id, (data: Record<string, any>) => {
      if (data.status === 0) {
        setMessages(preparingMessages(data?.data[0]));
      } else {
        enqueueSnackbar("Something has gone wrong!", { variant: "error" });
      }
    });
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
        act: { id: actLine?.id },
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
      if (actLine?.conversation.length > 0) {
        let promises: Promise<void>[] = [];

        actLine?.conversation.map((conversation: Record<string, any>) => {
          promises.push(commentsStore.deleteComment(conversation.id, (data: Record<string, any>) => {}));
        });

        Promise.all(promises)
          .then(() => {
            reloadTheAct();
            reloadActLine();
            setAnchorPopOverEl(null);
            actsContext?.reloadActs();
          })
          .catch((error) => {
            console.error("Error during the terminating conversation", error);
          });
      }
    };

    return (
      <>
        {actLine?.conversation?.length > 0 && (
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

  const ChatBubble: React.FC<ChatBubbleProps> = ({ message, showAvatar, isCurrentUser }) => (
    <Box
      sx={{
        mb: 1,
        display: "flex",
        alignItems: "flex-end",
        flexDirection: isCurrentUser ? "row-reverse" : "row",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "start", flexDirection: isCurrentUser ? "row-reverse" : "row", gap: 2 }}>
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

  const Chat: React.FC<ChatProps> = ({ messages, currentUserId }) => {
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

  const getTargetUser = () => {
    if (currentUserRoles?.isSubagent) {
      return { avatar: `${act?.accountant?.image}`, username: `${act?.accountant?.name}` };
    } else if (currentUserRoles?.isAccountant) {
      return { avatar: undefined, username: `${act?.organization?.name}` };
    } else {
      return null;
    }
  };

  useEffect(() => {
    if (currentUserContext?.currentUser) setCurrentUser(currentUserContext?.currentUser);
    if (currentUserContext?.userRoles) setCurrentUserRoles(currentUserContext?.userRoles);

    setMessages(preparingMessages(actLine));
  }, [currentUserContext]);

  return (
    <Box>
      <IconButton size="small" disabled={actLine?.verified || currentUserRoles?.isAdmin} onClick={handleClick}>
        <Badge
          badgeContent={actLine?.conversation?.length}
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: "#5F8CCC",
              color: "white",
            },
          }}
        >
          <Tooltip title="Добавить комментарий">
            <RateReviewIcon sx={actLine?.conversation?.length > 0 ? { color: "#5F8CCC" } : {}} />
          </Tooltip>
        </Badge>
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
            {!!getTargetUser() ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar src={getTargetUser()?.avatar} sx={{ bgcolor: deepOrange[500], width: 28, height: 28 }} />

                <Typography noWrap={true} sx={{ maxWidth: "200px" }}>
                  {getTargetUser()?.username}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AvatarGroup max={1}>
                  <Tooltip title={`${act?.accountant?.name}`}>
                    <Avatar
                      sx={{ width: 28, height: 28, cursor: "pointer" }}
                      alt={act?.accountant?.name}
                      src={act?.accountant.image}
                    />
                  </Tooltip>

                  <Tooltip title={`${act?.organization.name}`}>
                    <Avatar
                      sx={{ bgcolor: deepOrange[500], width: 28, height: 28, cursor: "pointer" }}
                      alt={act?.organization.name}
                    />
                  </Tooltip>
                </AvatarGroup>

                <Box>
                  <Typography noWrap={true} sx={{ fontSize: "11px", maxWidth: "200px" }}>
                    {act?.accountant?.name}
                  </Typography>
                  <Typography noWrap={true} sx={{ fontSize: "11px", maxWidth: "200px" }}>
                    {act?.organization.name}
                  </Typography>
                </Box>
              </Box>
            )}

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
            <Typography sx={{ fontSize: "12px" }}>Номер строки №{actLineIndex}</Typography>
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

export default ActLineReview;
