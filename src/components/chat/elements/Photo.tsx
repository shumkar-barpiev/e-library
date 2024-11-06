"use client";
import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { MessageType } from "@/models/chat/chat";
import { inter } from "@/styles/theme";
import { grey } from "@mui/material/colors";
import { useRouter } from "next/navigation";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

export const Photo = ({ message, answer }: { message: MessageType; answer?: boolean }) => {
  const route = useRouter();

  // #/ds/dms.file/edit/330
  const src = process.env.NEXT_PUBLIC_API_URL + "/foms/ws/dms/inline/" + message.fileId;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = process.env.NEXT_PUBLIC_API_URL + "/foms/ws/dms/download/" + message.fileId;
    link.download = message.fileName;
    link.click();
  };

  return (
    <>
      <Box sx={{ marginLeft: "30px", marginTop: "10px", marginRight: "30px" }}>
        <Stack direction="row" alignItems="end">
          <a href={src} target="_blink">
            <Box
              component="img"
              src={src}
              alt={message.fileName}
              loading="lazy"
              sx={{
                width: answer ? "60px" : "100%",
                height: answer ? "60px" : "230px",
                cursor: "pointer",
                objectFit: "cover",
              }}
            />
          </a>
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
        {message.caption && (
          <Typography fontSize={11.5} sx={{ marginRight: "30px" }}>
            {<pre style={{ fontFamily: inter.style.fontFamily, textWrap: "wrap" }}>{message.caption}</pre>}
          </Typography>
        )}
      </Box>
    </>
  );
};
