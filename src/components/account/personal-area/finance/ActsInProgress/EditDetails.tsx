import React, { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import ClearIcon from "@mui/icons-material/Clear";
import { IconButton, Modal, Box } from "@mui/material";
import ActDetails from "@/components/account/personal-area/finance/ActComponents/ActDetails";

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

const EditDetails = ({ act }: PropsType) => {
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
        <EditIcon fontSize="small" />
      </IconButton>
      <Modal
        open={open}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalScreenStyle}>
          <Box sx={{ width: 1, display: "flex", justifyContent: "end", mb: 1 }}>
            <IconButton size="small" aria-label="close-modal" onClick={handleModalClose}>
              <ClearIcon />
            </IconButton>
          </Box>

          <ActDetails handleCloseModal={handleModalClose} act={act} />
        </Box>
      </Modal>
    </>
  );
};

export default EditDetails;
