import { MessageType, messageTypeEnum } from "@/models/chat/chat";
import { useChatStore } from "@/stores/chat/chat";
import { CommentaryVariant, useChatCommentary } from "@/stores/chat/chatCommentary";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, IconButton, MenuItem, Popover, Typography } from "@mui/material";
import { useState } from "react";

interface ChatMessagePopupType {
  message: MessageType;
}

export default function ChatMessagePopup({ message }: ChatMessagePopupType) {
  const { setAnswerSelectMessage } = useChatStore();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const chatCommentaryStory = useChatCommentary();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const onClickAnswer = () => {
    setAnswerSelectMessage(message);
    handleClose();
  };
  const onClickUpdateCommentary = () => {
    chatCommentaryStory.handleOpenChatCommentary(CommentaryVariant.updateCommentary, message);
    handleClose();
  };
  return (
    <>
      <IconButton aria-describedby={id} onClick={handleClick} sx={{ p: 0, m: 0 }}>
        <KeyboardArrowDownIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Box sx={{ p: 0.5 }}>
          {message.type !== messageTypeEnum.COMMENTARY && (
            <MenuItem onClick={onClickAnswer}>
              <Typography fontSize={11}>Ответить</Typography>
            </MenuItem>
          )}
          {message.type === messageTypeEnum.COMMENTARY && (
            <MenuItem onClick={onClickUpdateCommentary}>
              <Typography fontSize={11}>Изменить</Typography>
            </MenuItem>
          )}
        </Box>
      </Popover>
    </>
  );
}
