import React, { useState } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import { IconButton, Modal, Box } from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import ActDetails from "@/components/account/personal-area/finance/ActComponents/ActDetails";
import ActDetailsSave from "@/components/account/personal-area/finance/ActComponents/ActDetailsSave";

const modalScreenStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "95%",
  bgcolor: "background.paper",
  borderRadius: "5px",
  p: 2,
};

type PropsType = {
  act: Record<string, any> | null;
};

const ShowDetails = ({ act }: PropsType) => {
  const [open, setOpen] = useState<boolean>(false);

  const handleModalClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButton
        size="small"
        sx={{
          backgroundColor: "white",
          color: "#5F8CCC",
          "&:hover": {
            backgroundColor: "#5F8CCC",
            color: "white",
          },
        }}
        onClick={() => setOpen(true)}
      >
        <RemoveRedEyeOutlinedIcon fontSize="small" />
      </IconButton>

      <Modal
        open={open}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalScreenStyle}>
          <Box sx={{ width: 1, display: "flex", justifyContent: "end", mb: 1, gap: 2 }}>
            <ActDetailsSave showOnlyDownload={false} act={act} />
            <IconButton size="small" aria-label="close-modal" onClick={handleModalClose}>
              <ClearIcon />
            </IconButton>
          </Box>
          <Box sx={{ width: 1, overflowX: "auto" }}>
            <ActDetails handleCloseModal={handleModalClose} act={act} />
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ShowDetails;
