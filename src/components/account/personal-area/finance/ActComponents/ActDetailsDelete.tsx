"use client";

import {
  Dialog,
  Button,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import React, { useState, useContext } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useUserActsStore } from "@/stores/personal-area/acts/acts";
import { CurrentUserContext } from "@/components/account/personal-area/current-user/CurrentUserProvider";
import { ActsContext } from "@/components/account/personal-area/finance/ActsInProgress/ActsInProgressProvider";

type PropsType = {
  actId: number;
};

const ActDetailsDelete = ({ actId }: PropsType) => {
  const actStore = useUserActsStore();
  const actsContext = useContext(ActsContext);
  const currentUserContext = useContext(CurrentUserContext);
  const [deletionConfirmationOpen, setDeletionConfirmationOpen] = useState<boolean>(false);

  const handleDeletionConfirmationClose = () => {
    setDeletionConfirmationOpen(false);
  };

  const handleDeleteAction = () => {
    actStore.deleteAct(actId, (data: Record<string, any>) => {
      handleDeletionConfirmationClose();
      if (data.status === 0) {
        actsContext?.reloadActs();
        if (currentUserContext?.reloadActsCounter && currentUserContext.currentUserId)
          currentUserContext?.reloadActsCounter(currentUserContext.currentUserId);
        enqueueSnackbar("Акт успешно удалено", { variant: "success" });
      } else {
        enqueueSnackbar("Что то пошло не так", { variant: "error" });
      }
    });
  };

  return (
    <>
      <IconButton
        size="small"
        sx={{
          backgroundColor: "white",
          color: "#b66369",
          "&:hover": {
            backgroundColor: "#b66369",
            color: "white",
          },
        }}
        onClick={() => {
          setDeletionConfirmationOpen(true);
        }}
      >
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>

      <Dialog
        open={deletionConfirmationOpen}
        onClose={handleDeletionConfirmationClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Удаление записи</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">Вы точно хотите удалить данную запись?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={handleDeletionConfirmationClose}>
            Отмена
          </Button>
          <Button color="error" onClick={handleDeleteAction} autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ActDetailsDelete;
