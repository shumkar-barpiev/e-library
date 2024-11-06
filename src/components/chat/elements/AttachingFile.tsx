"use client";
import { Add } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { blue } from "@mui/material/colors";
import React from "react";
import { VisuallyHiddenInput } from "@/components/other/VisuallyHiddenInput";

export default function AttachingFile({
  onChange,
  ...props
}: {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <IconButton sx={{ position: "relative" }} {...props}>
      <VisuallyHiddenInput
        type="file"
        onChange={onChange}
        accept="image/jpeg, 
                image/png, 
                text/plain, 
                application/pdf, 
                application/vnd.ms-powerpoint, 
                application/msword, 
                application/vnd.ms-excel,
                application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                application/vnd.openxmlformats-officedocument.presentationml.presentation,
                application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                image/webp,
                video/3gp,
                video/mp4,
                audio/aac,
                audio/amr,
                audio/mpeg,
                audio/mp4,
                audio/ogg"
        multiple
      />
      <Add sx={{ color: blue[700] }} />
    </IconButton>
  );
}
