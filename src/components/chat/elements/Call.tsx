import { MessageType } from "@/models/chat/chat";
import { Box, Stack, Typography } from "@mui/material";
import { AudioPlayer } from "./AudioPlayer";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import CallMadeIcon from "@mui/icons-material/CallMade";
const CallStatus = new Map([
  ["failed", "Ошибка"],
  ["answered", "Отвечено"],
  ["noAnswer", "Не отвечено"],
  ["busy", "Занят"],
]);
const CallTypeMap = new Map([
  ["incoming", "Входящий"],
  ["outgoing", "Исходящий"],
  ["internalCall", "Внутренний звонок"],
]);

export default function Call({ message }: { message: MessageType }) {
  return (
    <Box>
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
        <Box>
          <Stack direction="row" spacing={2}>
            {message["messageCall.type"] && (
              <Box>
                {message["messageCall.type"] === "outgoing" && (
                  <CallMadeIcon
                    sx={{
                      width: 20,
                      height: 20,
                      color:
                        (message["messageCall.status"] === "answered" && "green") ||
                        (message["messageCall.status"] === "noAnswer" && "red") ||
                        (message["messageCall.status"] === "busy" && "red") ||
                        (message["messageCall.status"] === "failed" && "red") ||
                        "red",
                    }}
                  />
                )}
                {message["messageCall.type"] === "incoming" && (
                  <CallReceivedIcon
                    sx={{
                      width: 20,
                      height: 20,
                      color:
                        (message["messageCall.status"] === "answered" && "green") ||
                        (message["messageCall.status"] === "noAnswer" && "red") ||
                        (message["messageCall.status"] === "busy" && "red") ||
                        (message["messageCall.status"] === "failed" && "red") ||
                        "red",
                    }}
                  />
                )}
              </Box>
            )}
            {message["messageCall.status"] && (
              <Typography fontWeight={600} fontSize={12}>
                {CallStatus.get(message["messageCall.status"])}
              </Typography>
            )}
            <Typography fontWeight={600} fontSize={12} color="#3f51b5">
              {message["messageCall.user"]?.fullName}
            </Typography>
            {message.callResponsible &&
              message.callResponsible.map((user: any, index, arr) => {
                return (
                  <Typography fontSize={12} fontWeight={600} color="#3f51b5" key={user.id}>
                    {user.name}
                    {index < arr.length - 1 && ","}
                  </Typography>
                );
              })}
          </Stack>
          {message["messageCall.recordId"] && (
            <AudioPlayer
              src={process.env.NEXT_PUBLIC_API_URL + "/foms/ws/dms/inline/" + message["messageCall.recordId"]}
            />
          )}
        </Box>
      </Stack>
    </Box>
  );
}
