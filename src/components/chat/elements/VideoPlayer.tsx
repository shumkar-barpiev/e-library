import { MessageType } from "@/models/chat/chat";
import { inter } from "@/styles/theme";
import { Box, Stack, Typography } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { grey } from "@mui/material/colors";

export default function VideoPlayer({
  message,
  src,
  answer,
}: {
  message?: MessageType;
  src?: string;
  answer?: boolean;
}) {
  const address = message ? process.env.NEXT_PUBLIC_API_URL + "/foms/ws/dms/inline/" + message.fileId : src;
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = message ? process.env.NEXT_PUBLIC_API_URL + "/foms/ws/dms/download/" + message.fileId : "";
    link.download = message ? message.fileName : "";
    link.click();
  };
  return (
    <Box>
      <Stack direction="row" alignItems="end">
        <video width={320} height={240} controls={!answer}>
          <source src={address} type="video/mp4" />
          <source src={address} type="video/3gp" />
          Ваш браузер не поддерживает тип видео!
        </video>
        {!answer && (
          <Box
            sx={{
              border: "1px solid #9e9e9e",
              borderRadius: "50%",
              paddingLeft: "5px",
              paddingRight: "5px",
              marginLeft: "10px",
              height: "30px",
              cursor: "pointer",
            }}
            onClick={handleDownload}
          >
            <Stack direction="row" justifyContent="center" alignItems="center" height="100%">
              <FileDownloadIcon fontSize="small" sx={{ color: grey[500] }} />
            </Stack>
          </Box>
        )}
      </Stack>
      {message && message.caption && (
        <Typography fontSize={11.5} sx={{ marginRight: "30px" }}>
          {<pre style={{ fontFamily: inter.style.fontFamily, textWrap: "wrap" }}>{message.caption}</pre>}
        </Typography>
      )}
    </Box>
  );
}
