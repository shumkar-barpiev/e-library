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
import React, { useState } from "react";
import { enqueueSnackbar } from "notistack";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useEmployeeAgreementsStore } from "@/stores/hr/employee-agreements/employee-agreements";

type PropsType = {
  agreementId: number;
};

const EmployeeAgreementDelete = ({ agreementId }: PropsType) => {
  const agreementStore = useEmployeeAgreementsStore();
  const [deletionConfirmationOpen, setDeletionConfirmationOpen] = useState<boolean>(false);

  const handleDeletionConfirmationClose = () => {
    setDeletionConfirmationOpen(false);
  };

  const handleDeleteAction = () => {
    agreementStore.deleteAgreement(agreementId, (data: Record<string, any>) => {
      setDeletionConfirmationOpen(false);
      if (data.status === 0) {
        agreementStore.setReloadAgreementsTable(true);
        enqueueSnackbar("Соглашение с сотрудником успешно удалено", { variant: "success" });
      } else {
        enqueueSnackbar("Что-то пошло не так во время удаления соглашения", { variant: "error" });
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

export default EmployeeAgreementDelete;
