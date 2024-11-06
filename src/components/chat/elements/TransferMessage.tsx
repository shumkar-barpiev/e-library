import { MessageType } from "@/models/chat/chat";
import { useChatStore } from "@/stores/chat/chat";
import { Box, Stack, Typography } from "@mui/material";

export default function TransferMessage({ message }: { message: MessageType }) {
  const { currentUserId } = useChatStore();
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="flex-start" flexWrap="wrap">
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography fontSize="13px" color="#3f51b5">
            {message["transfer.fromTr"]?.id === currentUserId?.id ? "Вы" : message["transfer.fromTr"]?.fullName}
          </Typography>
          <Typography fontWeight={500} fontSize={13} color="#3f51b5">
            {message["transfer.fromTr"]?.id === currentUserId?.id ? "Передали" : "Передал"}
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="center" flexWrap="wrap">
          {message?.toTr?.map((transferTo, transferToIndex, transferToArray) => {
            let transferToArraylength = transferToArray.length - 1;
            return (
              <Typography fontSize="13px" color="#3f51b5" key={transferTo.id}>
                {transferTo.id === currentUserId?.id ? "Вам" : transferTo.fullName}
                {transferToIndex < transferToArraylength ? ", " : " "}
              </Typography>
            );
          })}
        </Stack>
      </Stack>
    </Box>
  );
}
