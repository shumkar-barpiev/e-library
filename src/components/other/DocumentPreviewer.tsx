/* eslint-disable @next/next/no-img-element */

import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Typography, Backdrop, Stack } from "@mui/material";

type DocumentPreviewerProps = {
  fileUrl: string;
  filename: string;
  onClose: () => void;
};

const DocumentPreviewer: React.FC<DocumentPreviewerProps> = ({ fileUrl, onClose, filename }) => {
  const extension = fileUrl.split(".").pop()?.toLowerCase();

  const renderPreview = () => {
    if (["png", "jpeg", "jpg", "gif"].includes(extension || "")) {
      return <img src={fileUrl} alt="preview" style={{ maxWidth: "100%" }} />;
    }
    if (extension === "mp3") {
      return <audio controls src={fileUrl} style={{ width: "100%" }} />;
    }
    if (extension === "mp4") {
      return <video controls width="100%" src={fileUrl} />;
    }
    if (extension === "pdf") {
      return (
        <iframe
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
          width="100%"
          height="100%"
        />
      );
    }
    if (["docx", "xlsx", "pptx"].includes(extension || "")) {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          title="Office Preview"
        />
      );
    }

    return null;
  };

  return (
    <Backdrop open sx={{ zIndex: 2000, color: "#fff" }}>
      <Box
        sx={{
          bgcolor: "background.paper",
          p: 2,
          borderRadius: 2,
          width: { xs: "95vw", sm: "90vw", md: "70vw" },
          height: { xs: "85vh", sm: "90vh", md: "80vh" },
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        <Stack direction={"row"} justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{filename}</Typography>
          <IconButton onClick={onClose} sx={{ alignSelf: "flex-end", color: "primary.main" }}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {renderPreview()}
        </Box>
      </Box>
    </Backdrop>
  );
};

export default DocumentPreviewer;
