import { styled } from "@mui/material";

export const VisuallyHiddenInput = styled("input")({
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  top: 0,
  whiteSpace: "nowrap",
  opacity: 0,
  width: "30px",
  height: "30px",
});
