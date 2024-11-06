"use client";

import { enqueueSnackbar } from "notistack";
import { TUserModel } from "@/models/user/user";
import SendIcon from "@mui/icons-material/Send";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useForm, Controller } from "react-hook-form";
import { deepOrange, blue } from "@mui/material/colors";
import {
  Paper,
  Dialog,
  Avatar,
  Button,
  TextField,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  AvatarGroup,
  Divider,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import PDFViewer from "@/components/other/PDFViewer";
import RateReviewIcon from "@mui/icons-material/RateReview";
import { Box, IconButton, Tooltip, Modal, Badge } from "@mui/material";
import React, { useState, useContext, useEffect, useRef } from "react";
import {
  bytesToBase64,
  scrollIntoElement,
  convertBase64ToBlob,
} from "@/components/employee_agreements/_helpers/agreement_review_helper";
import { ModalStyle } from "@/components/account/personal-area/profile/Profile";
import { useUserNewsCommentsStore } from "@/stores/personal-area/news/news-comments";
import { useEmployeeAgreementsStore } from "@/stores/hr/employee-agreements/employee-agreements";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";

type PropsType = {
  agreement: Record<string, any> | null;
};

interface ChatBubbleProps {
  index: number;
  message: Message;
  showAvatar: boolean;
  isCurrentUser: boolean;
}
interface Message {
  text: string;
  senderId: string;
  messageId: string;
  senderName: string;
  senderProfileImage: string;
}

interface ChatProps {
  messages: Message[];
  currentUserId: string;
}

const EmployeeAgreementReview = ({ agreement }: PropsType) => {
  const [open, setOpen] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const commentsStore = useUserNewsCommentsStore();
  const agreementStore = useEmployeeAgreementsStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const currentUserContext = useContext(CurrentUserContext);
  const [documentURL, setDocumentURL] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<TUserModel | null>(null);
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);
  const [currentAgreement, setCurrentAgreement] = useState<Record<string, any> | null>(agreement);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm({
    defaultValues: {
      comment: "",
    },
  });

  useEffect(() => {
    if (currentAgreement?.conversation?.length > 0) {
      setMessages(preparingMessages(currentAgreement));
    }
  }, [currentAgreement]);

  useEffect(() => {
    if (currentUserContext?.currentUser) setCurrentUser(currentUserContext?.currentUser);
    if (currentUserContext?.userRoles) setCurrentUserRoles(currentUserContext?.userRoles);
  }, [currentUserContext]);

  const TerminateConversation: React.FC = () => {
    const [deletionConfirmationOpen, setDeletionConfirmationOpen] = useState<boolean>(false);

    const handleTerminateConfirmationClose = () => {
      setDeletionConfirmationOpen(false);
    };

    const handleTerminateConversation = () => {
      if (currentAgreement?.conversation.length > 0) {
        let promises: Promise<void>[] = [];

        currentAgreement?.conversation.map((conversation: Record<string, any>) => {
          promises.push(commentsStore.deleteComment(conversation.id, (data: Record<string, any>) => {}));
        });

        Promise.all(promises)
          .then(() => {
            reloadAgreement();
            setMessages([]);
          })
          .catch((error) => {
            console.error("Error during the terminating conversation", error);
          });
      }
    };

    return (
      <>
        {messages.length > 0 && (
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

  const ChatBubble: React.FC<ChatBubbleProps> = ({ index, message, showAvatar, isCurrentUser }) => {
    const lastMessageId = "last-message-chat-bubble";
    if (index === messages?.length) scrollIntoElement(lastMessageId);
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
            id={index === messages?.length ? lastMessageId : ""}
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

  const Chat: React.FC<ChatProps> = ({ messages, currentUserId }) => {
    let prevSenderId = "";

    return (
      <Box sx={{ p: 2 }}>
        {messages.map((message, index) => {
          const showAvatar = message.senderId !== prevSenderId;
          prevSenderId = message.senderId;

          return (
            <ChatBubble
              index={index + 1}
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

  const reloadAgreement = () => {
    agreementStore.fetchAgreementById(agreement?.id, (data: Record<string, any>) => {
      if (data.status === 0) setCurrentAgreement(data.data[0]);

      reset();
    });
  };

  const onSubmit = (data: Record<string, any>) => {
    if (isDirty && currentAgreement && currentUser) {
      const requestBody = {
        data: {
          employmentContract: {
            id: agreement?.id,
          },
          relatedUser: {
            id: currentUser?.id,
          },
          text: `${data.comment}`,
        },
      };

      commentsStore.createComment(requestBody, (data: Record<string, any>) => {
        if (data.status === 0) {
          reloadAgreement();
        } else {
          enqueueSnackbar("Something has gone wrong!", { variant: "error" });
        }
      });
    }
  };

  const handleCloseModal = () => {
    agreementStore.setReloadAgreementsTable(true);
    setOpen(false);
  };

  const getTargetUser = () => {
    if (currentUserRoles?.isHR) {
      return { avatar: `${agreement?.employeeUser?.image}`, username: `${agreement?.employeeUser?.name}` };
    } else if (currentUser?.id === agreement?.employeeUser?.id) {
      return { avatar: `${agreement?.createdBy?.image}`, username: `${agreement?.createdBy?.name}` };
    } else {
      return null;
    }
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

  const previewPdf = () => {
    if (!!agreement?.dmsFile?.id) {
      const params = {
        documentId: agreement?.dmsFile?.id,
      };

      agreementStore.getDocument(params, async (data: Uint8Array) => {
        const base64String = bytesToBase64(data);

        const fileUrl = await convertBase64ToBlob(base64String);

        if (fileUrl) {
          setOpen(true);
          setDocumentURL(fileUrl);
        }
      });
    }
  };

  return (
    <Box>
      <IconButton size="small" onClick={previewPdf} disabled={!agreement?.dmsFile}>
        <Badge
          badgeContent={currentAgreement?.conversation?.length}
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: "#5F8CCC",
              color: "white",
            },
          }}
        >
          <Tooltip title="Предварительный просмотр PDF-файла">
            <RateReviewIcon sx={agreement?.conversation?.length > 0 ? { color: "#5F8CCC" } : {}} />
          </Tooltip>
        </Badge>
      </IconButton>

      <Modal
        open={open}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            ...ModalStyle,
            width: "80%",
            position: "relative",
          }}
        >
          <IconButton
            aria-label="close-modal"
            sx={{ position: "absolute", top: 8, right: 8 }}
            onClick={handleCloseModal}
          >
            <ClearIcon />
          </IconButton>
          <Box id="modal-modal-description">
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                maxWidth: "100%",
                margin: "auto",
              }}
            >
              <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
                <Box sx={{ maxHeight: { xs: "40vh", md: "70vh" }, overflow: "auto", width: 1 }}>
                  {!!documentURL && <PDFViewer fileUrl={documentURL} />}
                </Box>

                <Box sx={{ mx: 2 }}>
                  <Box sx={{ height: "350px", minWidth: "300px" }}>
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
                      }}
                    >
                      {!!getTargetUser() ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar
                            src={getTargetUser()?.avatar}
                            sx={{ bgcolor: deepOrange[500], width: 28, height: 28 }}
                          />

                          <Typography noWrap={true} sx={{ maxWidth: "200px" }}>
                            {getTargetUser()?.username}
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <AvatarGroup max={4}>
                              <Tooltip title={`${agreement?.employeeUser?.name}`}>
                                <Avatar
                                  sx={{ width: 32, height: 32 }}
                                  alt={`${agreement?.employeeUser?.name}`}
                                  src={`${agreement?.employeeUser?.image}`}
                                />
                              </Tooltip>
                              <Tooltip title={`${agreement?.createdBy?.name}`}>
                                <Avatar
                                  sx={{ width: 32, height: 32 }}
                                  alt={`${agreement?.createdBy?.name}`}
                                  src={`${agreement?.createdBy?.image}`}
                                />
                              </Tooltip>
                            </AvatarGroup>

                            <Typography noWrap={true} sx={{ maxWidth: "180px" }} variant="inherit">
                              Ответственные стороны...
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {!currentUserRoles?.isAdmin && <TerminateConversation />}
                      </Box>
                    </Box>
                    <Box
                      ref={chatBoxRef}
                      sx={{
                        height: "250px",
                        overflowY: "auto",
                        "&::-webkit-scrollbar": {
                          display: "none",
                        },
                      }}
                    >
                      <Chat messages={messages} currentUserId={`${currentUser?.id}`} />
                    </Box>
                    {currentUserRoles?.isAdmin ? (
                      <Divider />
                    ) : (
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
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default EmployeeAgreementReview;
