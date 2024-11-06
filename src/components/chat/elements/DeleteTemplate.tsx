import { useChatStore } from "@/stores/chat/chat";
import { httpStatusEnum, statusMessageEnum } from "@/models/chat/chat";
import { Box, Button, CircularProgress, Modal, Popover, Stack, Typography } from "@mui/material";
import { green } from "@mui/material/colors";
import { useState } from "react";

export default function DeleteTemplate({ templateName, templateID }: { templateName: string; templateID: number }) {
  const { sendEvent, status, setStatus } = useChatStore((state) => state);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const onClickDeleteTemplate = () => {
    setStatus(statusMessageEnum.deleteTemplate, httpStatusEnum.loading);
    sendEvent({
      event: "deleteTemplate",
      data: {
        templateName,
        templateID,
      },
    });
    setAnchorEl(null);
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Button
        aria-describedby={id}
        variant="outlined"
        sx={{ fontSize: 11 }}
        onClick={handleClick}
        disabled={
          (status.variant === "deleteTemplate" && status.value === httpStatusEnum.loading) ||
          (status.variant === "deleteTemplate" && status.value === httpStatusEnum.success)
        }
      >
        Удалить
      </Button>
      {status.variant === "deleteTemplate" && status.value === httpStatusEnum.loading && (
        <CircularProgress
          size={24}
          sx={{
            color: green[500],
            position: "absolute",
            top: "50%",
            left: "50%",
            marginTop: "-12px",
            marginLeft: "-12px",
          }}
        />
      )}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
      >
        <Box
          sx={{
            width: "300px",
            p: 2,
          }}
        >
          <Stack spacing={2}>
            <Typography>Вы действительно хотите удалить?</Typography>
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
              <Button variant="contained" sx={{ fontSize: 11 }} onClick={onClickDeleteTemplate}>
                Удалить
              </Button>
              <Button variant="contained" sx={{ fontSize: 11 }} onClick={handleClose}>
                Отменить
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
}
