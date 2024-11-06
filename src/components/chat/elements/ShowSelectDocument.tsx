"use client";
import { Close, Description } from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  ImageList,
  ImageListItem,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import ShowImage from "./ShowImage";
import { blue, grey } from "@mui/material/colors";
import SendButton from "./SendButton";
import { useChatStore } from "@/stores/chat/chat";
import { SelectFileState, Textarea } from "../ChatFooter";
import data from "@emoji-mart/data/sets/15/apple.json";
import Picker from "@emoji-mart/react";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import { AudioPlayer } from "./AudioPlayer";
import AttachingFile from "./AttachingFile";
import { enqueueSnackbar } from "notistack";
interface ShowSelectDocument {
  alt: string;
  setSelectedFiles: any;
  selectFiles: SelectFileState[];
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  caption?: string;
  setCaption: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function ShowSelectDocument({
  alt,
  setSelectedFiles,
  selectFiles,
  onChange,
  caption,
  setCaption,
}: ShowSelectDocument) {
  const { currentUserId, chat, sendMessageLoading, setSendMessageLoading } = useChatStore((state) => state);
  const [value, setValue] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const closeDocument = () => {
    setSelectedFiles([]);
    setCaption(null);
  };

  useEffect(() => {
    if (caption) {
      setValue(caption);
    }
  }, [caption]);

  const sendFile = async () => {
    let selectFilesPromise = selectFiles.map(async (file, index, arr) => {
      if (index === arr.length - 1) {
        await sendFileFunc(file.file, value);
      } else {
        await sendFileFunc(file.file);
      }
    });

    Promise.all(selectFilesPromise);

    async function sendFileFunc(file: File, value?: string) {
      try {
        let formData = new FormData();
        formData.append("file", file);
        formData.append("chat", JSON.stringify(chat));
        formData.append("messageAuthor", JSON.stringify(currentUserId));
        if (value && value !== "") {
          formData.append("caption", JSON.stringify(value));
          setValue("");
        }
        setSendMessageLoading(true);
        closeDocument();
        let response = await fetch("https://" + process.env.NEXT_PUBLIC_CHAT_URL + "/chat/uploadFileAxelor", {
          method: "POST",
          body: formData,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const sendFileWhatsapp = async () => {
    let selectFilesPromise = selectFiles.map(async (file, index, arr) => {
      if (index === arr.length - 1) {
        await sendFileWhatsappFunc(file.file, value);
      } else {
        await sendFileWhatsappFunc(file.file);
      }
    });

    Promise.all(selectFilesPromise);

    async function sendFileWhatsappFunc(file: File, value?: string) {
      try {
        let formData = new FormData();
        formData.append("file", file);
        formData.append("chat", JSON.stringify(chat));
        formData.append("messageAuthor", JSON.stringify(currentUserId));
        if (value && value !== "") {
          formData.append("caption", JSON.stringify(value));
          setValue("");
        }
        setSendMessageLoading(true);
        closeDocument();
        let response = await fetch("https://" + process.env.NEXT_PUBLIC_CHAT_URL + "/chat/uploadFileWhatsapp", {
          method: "POST",
          body: formData,
        });
      } catch (error) {
        enqueueSnackbar("Hello wrold", { variant: "error" });
        console.log(error);
      }
    }
  };

  const handleChangeValue = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleOpenPopup = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopup = () => {
    setAnchorEl(null);
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    setValue((prevValue) => prevValue + emoji.native);
  };

  const onRemoveFile = (file: SelectFileState) => {
    if (selectFiles.length === 1) {
      setCaption(null);
    }
    setSelectedFiles((prev: SelectFileState[]) => prev.filter((el) => el.file !== file.file));
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: grey[200],
        zIndex: 101,
      }}
    >
      <Stack direction="row" justifyContent="flex-end">
        <IconButton onClick={closeDocument}>
          <Close />
        </IconButton>
      </Stack>
      <Grid container flexGrow={1} flexWrap="wrap" direction="column">
        <Grid item sx={{ height: "85vh" }} display="flex" justifyContent="center" alignItems="center">
          <ImageList
            variant="quilted"
            sx={{ width: "100%", height: "100%", overflow: "auto" }}
            cols={4}
            rowHeight={144}
            gap={144}
          >
            {selectFiles.map((file) => {
              return (
                <ImageListItem key={Math.random()}>
                  <Stack direction="row" justifyContent="flex-end">
                    <IconButton>
                      <Close onClick={() => onRemoveFile(file)} />
                    </IconButton>
                  </Stack>
                  <Stack direction="row" justifyContent="center" alignItems="center">
                    {file.file && file.file.type.includes("image") && (
                      <ShowImage src={file.fileBase64 as string} alt={alt} />
                    )}
                    {file.file && file.file.type.includes("audio") && <AudioPlayer src={file.fileBase64 as string} />}
                    {/* {file.file && file.file.type.includes("video") && <VideoPlayer src={file.fileBase64 as string} answer />} */}
                    {file.file && file.file.type.includes("video") && <Typography>{file.file.name}</Typography>}
                    {file.file &&
                      !file.file.type.includes("image") &&
                      !file.file.type.includes("video") &&
                      !file.file.type.includes("audio") && (
                        <Description sx={{ width: "50%", height: "50%", color: grey[500] }} />
                      )}
                  </Stack>
                  <Stack direction="row" spacing={2} flexGrow={1} justifyContent="center" flexWrap="wrap">
                    <Typography align="center">{file.file && file.file.name?.slice(0, 30)}...,</Typography>
                    <Typography align="center">{file.file && file.file.type.slice(0, 30)},</Typography>
                    <Typography align="center">{file.file && file.file.size}</Typography>
                  </Stack>
                </ImageListItem>
              );
            })}
            <ImageListItem sx={{ p: 3 }}>
              <Stack justifyContent="center" alignItems="center" sx={{ width: "100%", height: "100%" }}>
                <Box sx={{ border: "1px solid", borderRadius: "10px", borderColor: grey[400] }}>
                  <Stack justifyContent="center" alignItems="center" sx={{ height: "100%" }}>
                    <AttachingFile onChange={onChange} />
                  </Stack>
                </Box>
              </Stack>
            </ImageListItem>
          </ImageList>
        </Grid>
        <Grid item sx={{ height: "100px", padding: 2 }}>
          <Stack direction="row" spacing={2} sx={{ position: "relative" }}>
            <Box>
              <IconButton onClick={handleOpenPopup}>
                <SentimentSatisfiedAltIcon sx={{ color: blue[700] }} />
              </IconButton>
            </Box>
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClosePopup}
              anchorOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              PaperProps={{
                sx: {
                  borderRadius: "12px",
                  marginTop: "-10px",
                },
              }}
            >
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                previewPosition="none"
                skinTonePosition="search"
                set="apple"
                locale="ru"
              />
            </Popover>
            <Box flexGrow={1} sx={{ position: "relative" }}>
              <Textarea
                value={value}
                onChange={handleChangeValue}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (value !== "" && !chat?.appeal) {
                      sendFile();
                    }
                    if (value !== "" && chat?.appeal) {
                      sendFileWhatsapp();
                    }
                  }
                }}
                autoFocus
                order="false"
              />
            </Box>
            {!chat?.appeal && <SendButton state={3} variant="fab" onClick={sendFile} />}
            {chat?.appeal && <SendButton state={3} variant="fab" onClick={sendFileWhatsapp} />}
            {sendMessageLoading && (
              <Stack
                sx={{ position: "absolute", top: 0, left: -10, right: 0, bottom: 0, bgcolor: "#fff", zIndex: 1100 }}
                direction="row"
                alignItems="center"
                justifyContent="center"
              >
                <CircularProgress />
              </Stack>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
