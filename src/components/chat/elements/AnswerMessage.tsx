import { messageTypeEnum } from "@/models/chat/chat";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { AudioPlayer } from "./AudioPlayer";
import { Photo } from "@/components/chat/elements/Photo";
import { FileView } from "./FileView";
import { inter } from "@/styles/theme";
import TemplateMessage from "./TemplateMessage";
import TransferMessage from "./TransferMessage";
import { useChatStore } from "@/stores/chat/chat";
import CloseIcon from "@mui/icons-material/Close";
import VideoPlayer from "./VideoPlayer";

export default function AnswerMessage() {
  let { chat, setAnswerSelectMessage, answerSelectMessage } = useChatStore();
  const onClose = () => {
    setAnswerSelectMessage(null);
  };
  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "#fff",
        maxHeight: "200px",
        p: 2,
      }}
    >
      {answerSelectMessage && (
        <Box>
          {answerSelectMessage.messageAuthor && (
            <Box>
              {answerSelectMessage.type !== messageTypeEnum.TRANSFER && (
                <Stack direction="row" alignItems="center" sx={{ marginBottom: "5px" }}>
                  <Typography fontWeight={600} fontSize="13px" color="#3f51b5">
                    {answerSelectMessage.messageAuthor.fullName}
                  </Typography>
                </Stack>
              )}

              {answerSelectMessage.type === messageTypeEnum.AUDIO && (
                <AudioPlayer
                  src={process.env.NEXT_PUBLIC_API_URL + "/foms/ws/dms/inline/" + answerSelectMessage.fileId}
                />
              )}
              {answerSelectMessage.type === messageTypeEnum.IMAGE && <Photo message={answerSelectMessage} answer />}
              {answerSelectMessage.type === messageTypeEnum.DOCUMENT && (
                <FileView message={answerSelectMessage} answer />
              )}
              {answerSelectMessage.type === messageTypeEnum.VIDEO && (
                <VideoPlayer message={answerSelectMessage} answer />
              )}
              {answerSelectMessage.type === messageTypeEnum.TEXT && (
                <Typography fontSize={11.5} sx={{ marginLeft: "10px" }}>
                  <pre style={{ fontFamily: inter.style.fontFamily, textWrap: "wrap" }}>{answerSelectMessage.body}</pre>
                </Typography>
              )}
              {answerSelectMessage.type === messageTypeEnum.TEMPLATE && (
                <TemplateMessage body={answerSelectMessage.body} />
              )}

              {answerSelectMessage.type === messageTypeEnum.TRANSFER && (
                <TransferMessage message={answerSelectMessage} />
              )}
            </Box>
          )}
          {!answerSelectMessage.messageAuthor && !answerSelectMessage.appeal && (
            <AudioPlayer src={process.env.NEXT_PUBLIC_API_URL + "/foms/ws/dms/inline/" + answerSelectMessage.fileId} />
          )}
          {answerSelectMessage.appeal && !answerSelectMessage.messageAuthor && (
            <Box>
              <Stack direction="row" alignItems="center" sx={{ marginBottom: "5px" }}>
                <Stack direction="row" spacing={1}>
                  <Typography fontWeight={600} fontSize="13px" color="#3f51b5">
                    {chat?.appeal?.client.fullName || answerSelectMessage.appeal.name}
                  </Typography>
                  <Typography fontSize="12px" fontWeight={500}>
                    {chat?.appeal?.client.mobilePhone || chat?.phoneNumber}
                  </Typography>
                </Stack>
              </Stack>
              {answerSelectMessage.type === messageTypeEnum.AUDIO && (
                <AudioPlayer
                  src={process.env.NEXT_PUBLIC_API_URL + "/foms/ws/dms/inline/" + answerSelectMessage.fileId}
                />
              )}
              {answerSelectMessage.type === messageTypeEnum.IMAGE && <Photo message={answerSelectMessage} answer />}
              {answerSelectMessage.type === messageTypeEnum.VIDEO && (
                <VideoPlayer message={answerSelectMessage} answer />
              )}
              {answerSelectMessage.type === messageTypeEnum.DOCUMENT && (
                <FileView message={answerSelectMessage} answer />
              )}
              {answerSelectMessage.type === messageTypeEnum.TEXT && (
                <Typography fontSize={11.5} sx={{ marginLeft: "10px" }}>
                  {
                    <pre style={{ fontFamily: inter.style.fontFamily, textWrap: "wrap" }}>
                      {answerSelectMessage.body}
                    </pre>
                  }
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}
      <IconButton sx={{ position: "absolute", top: 4, right: 4 }} onClick={onClose}>
        <CloseIcon sx={{ width: "16px", height: "16px" }} />
      </IconButton>
    </Box>
  );
}
