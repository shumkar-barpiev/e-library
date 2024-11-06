"use client";
import { Delete, KeyboardVoice, Send, SettingsVoice, StopCircle } from "@mui/icons-material";
import { Box, Fab, IconButton, Stack, Zoom } from "@mui/material";
import { blue, grey, red } from "@mui/material/colors";
import { useCallback, useEffect, useState } from "react";
import SendButton from "./SendButton";
import { AudioPlayer } from "@/components/chat/elements/AudioPlayer";
import { useChatStore } from "@/stores/chat/chat";

interface Blob {
  readonly size: number;
  readonly type: string;
  slice(start?: number, end?: number, contentType?: string): Blob;
}

interface StateBlob {
  file: any;
  send: false;
  src: any;
}

interface AudioRecordingProps {
  state: number;
  onClickMicrophone?: () => void;
}

export default function AudioRecording(props: AudioRecordingProps) {
  const { state, onClickMicrophone } = props;

  const [blob, setBlob] = useState<StateBlob>({
    send: false,
    file: null,
    src: null,
  });

  const [chunks, setChunks] = useState<BlobPart[]>([]);

  const [mediaRecord, setMediaRecord] = useState<MediaRecorder | null>(null);

  const [stateMicrophone, setStateMicrophone] = useState<number>(1);
  const { currentUserId, sendEvent, chat, setSendMessageLoading } = useChatStore((state) => state);
  const [sendAudio, setSendAudio] = useState<boolean>(false);

  const startRecord = useCallback(() => {
    setChunks([]);
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream: MediaStream) => {
        let media = new MediaRecorder(stream, { mimeType: "audio/webm" });
        setMediaRecord(media);

        media.onstart = function () {
          if (blob && blob.file) {
            setBlob({
              send: false,
              file: null,
              src: null,
            });
          }
        };

        media.start();

        media.ondataavailable = function (e: BlobEvent) {
          let newChunks: BlobPart[] = chunks;
          newChunks.push(e.data);
          setChunks(newChunks);
        };

        media.onstop = function (event: any) {
          let newBlob: any = new Blob(chunks, { type: "audio/webm" });

          if (event && event.target && event.target.stream) {
            event.target.stream.getTracks().forEach((track: any) => {
              track.stop(); // Остановка всех треков медиапотока
            });
          }
          let reader = new FileReader();
          reader.readAsDataURL(newBlob);
          reader.onload = function () {
            setBlob((prevBlob) => ({
              ...prevBlob,
              file: newBlob,
              src: reader.result,
            }));
          };
          reader.onerror = function () {
            // console.log(reader.onerror);
          };
          // console.log("stopRecording");
        };

        media.onerror = function (error) {
          // console.error("Error:", error);
        };
      })
      .catch(function (error) {
        // console.error("getUserMediar error", error);
      });
  }, [chunks]);

  useEffect(() => {
    if (state === 2 && (!mediaRecord || mediaRecord.state === "inactive")) {
      startRecord();
    }
    if (state !== 2) {
      stopRecording();
      setMediaRecord(null);
      setChunks([]);
      setBlob({
        send: false,
        file: null,
        src: null,
      });
      setSendAudio(false);
      setStateMicrophone(1);
    }
  }, [state]);

  useEffect(() => {
    // console.log(blob);
    if (state !== 2 && blob.file) {
      setBlob({ file: null, src: null, send: false });
    }

    if (sendAudio && blob.file) {
      if (blob.file && chat && currentUserId) {
        setSendMessageLoading(true);
        if (!chat.appeal) {
          let formData = new FormData();
          formData.append("file", blob.file);
          formData.append("chat", JSON.stringify(chat));
          formData.append("messageAuthor", JSON.stringify(currentUserId));

          fetch("https://" + process.env.NEXT_PUBLIC_CHAT_URL + "/chat/uploadFileAxelor", {
            method: "POST",
            body: formData,
          });
          removeRecording();
        }
        if (chat.appeal) {
          let formData = new FormData();
          formData.append("file", blob.file);
          formData.append("chat", JSON.stringify(chat));
          formData.append("messageAuthor", JSON.stringify(currentUserId));

          fetch("https://" + process.env.NEXT_PUBLIC_CHAT_URL + "/chat/uploadFileWhatsapp", {
            method: "POST",
            body: formData,
          });
          removeRecording();
        }
      }
    }
  }, [blob, sendAudio]);

  const stopRecording = () => {
    if (mediaRecord) {
      mediaRecord?.stop();
      setStateMicrophone(2);
    }
  };

  const startRecording = () => {
    startRecord();
    setStateMicrophone(1);
  };

  const sendAudioRecord = async () => {
    stopRecording();
    setSendAudio(true);
    // socket.send(file);
    // Здесь можно отправлять файл file
    // Здесь можно отправлять файл blob.file
  };

  const removeRecording = () => {
    onClickMicrophone && onClickMicrophone();
  };

  return (
    <>
      {state === 2 && (
        <Box
          sx={{
            bgcolor: grey[300],
            position: "absolute",
            top: -15,
            left: -15,
            right: -15,
            bottom: -15,
            zIndex: 100,
            display: "flex",
          }}
        >
          <Stack direction="row" justifyContent="flex-end" flexGrow={1} alignItems="center" sx={{ pl: 2, pr: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
              <Zoom in={state === 2}>
                <IconButton sx={{ color: blue[400] }} onClick={removeRecording}>
                  <Delete />
                </IconButton>
              </Zoom>
              {stateMicrophone === 2 && blob.src && <AudioPlayer src={blob.src} />}
              {stateMicrophone === 1 && (
                <Zoom in={stateMicrophone === 1}>
                  <IconButton sx={{ color: red[400] }} onClick={stopRecording}>
                    <StopCircle />
                  </IconButton>
                </Zoom>
              )}
              {stateMicrophone === 2 && (
                <Zoom in={stateMicrophone === 2}>
                  <IconButton sx={{ color: red[400] }} onClick={startRecording}>
                    <KeyboardVoice />
                  </IconButton>
                </Zoom>
              )}

              <Zoom in={state === 2}>
                <Fab color="primary" onClick={sendAudioRecord}>
                  <Send />
                </Fab>
              </Zoom>
            </Stack>
          </Stack>
        </Box>
      )}
    </>
  );
}
