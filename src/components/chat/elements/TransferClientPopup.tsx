import { useChatStore } from "@/stores/chat/chat";
import { Box, Button, ListItemButton, Popover, Stack, Typography } from "@mui/material";
import { Children, useState } from "react";
import { addChatContactsType, departMentType } from "@/models/chat/chat";

export default function TransferClientPopup({ department, children }: { department: departMentType; children: any }) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const onClickTransfer = () => {
    // setStatus(statusMessageEnum.deleteTemplate, httpStatusEnum.loading);
    // sendEvent({
    //     event: "deleteTemplate",
    //     data: {
    //         templateName,
    //         templateID,
    //     },
    // });
    // setAnchorEl(null);
  };
  return (
    <ListItemButton sx={{ m: 0, p: 0 }}>
      <Button
        aria-describedby={id}
        // variant="outlined"
        style={{ fontSize: 11, width: "100%", textAlign: "left", color: "rgba(0, 0, 0, 0.87)" }}
        onClick={handleClick}
      >
        {children}
      </Button>
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
            <Typography>
              Передать клиент к <span style={{ fontSize: "14px", fontWeight: 500 }}>{department.name}</span>?
            </Typography>
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
              <Button variant="contained" sx={{ fontSize: 11 }} onClick={handleClose}>
                Отменить
              </Button>
              <Button variant="contained" sx={{ fontSize: 11 }} onClick={onClickTransfer}>
                Передать
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Popover>
    </ListItemButton>
  );
}
