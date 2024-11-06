"use client";

import { Box } from "@mui/material";

interface ShowImageProps {
  src: string | undefined;
  alt: string;
}

export default function ShowImage(props: ShowImageProps) {
  const { src, alt } = props;
  return <Box component="img" src={src} sx={{ width: "30%", height: "30%", objectFit: "cover" }} alt={alt}></Box>;
}
