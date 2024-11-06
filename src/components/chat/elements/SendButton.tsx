"use client";
import { KeyboardVoice, Send } from "@mui/icons-material";
import { Fab, IconButton, Zoom } from "@mui/material";
import { blue } from "@mui/material/colors";

interface SendBtnProps {
  state: number;
  onClickMicrophone?: () => void;
  variant?: string;
  onClick?: () => void;
}

export default function SendButton(props: SendBtnProps) {
  const { state, onClickMicrophone, variant, onClick } = props;

  return (
    <>
      {state === 1 && (
        <Zoom in={state === 1}>
          <IconButton sx={{ color: blue[400] }} onClick={onClickMicrophone}>
            <KeyboardVoice sx={{ width: "20px", height: "20px" }} />
          </IconButton>
        </Zoom>
      )}
      {state === 3 && !variant && (
        <Zoom in={state === 3}>
          <IconButton sx={{ color: blue[400] }} onClick={onClick}>
            <Send sx={{ width: "20px", height: "20px" }} />
          </IconButton>
        </Zoom>
      )}
      {state === 3 && variant === "fab" && (
        <Fab color="primary" onClick={onClick} sx={{ width: "40px", height: "40px" }}>
          <Send sx={{ width: "16px", height: "16px" }} />
        </Fab>
      )}
    </>
  );
}
