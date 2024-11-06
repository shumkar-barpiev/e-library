"use client";

import { ChangeEvent, MouseEvent, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { enqueueSnackbar } from "notistack";
import { useOrderDetailsStore } from "@/stores/orders/order-details";
import { VisuallyHiddenInput } from "@/components/other/VisuallyHiddenInput";
import { useOcrStore } from "@/stores/ocr/ocr";
import { useOrderStore } from "@/stores/orders/orders";
import { useAppealsStore } from "@/stores/appeals/appeals";
import { useUserStore } from "@/stores/users/users";

export default function OrderDetailsTableRowActions({ id, disabled }: { id: number; disabled?: boolean }) {
  const [actionsEl, setActionsEl] = useState<null | HTMLElement>(null);
  const [deletionConfirmationOpen, setDeletionConfirmationOpen] = useState(false);

  const uploadRef = useRef<HTMLInputElement | null>(null);

  const orderDetailsStore = useOrderDetailsStore((state) => state);
  const ocrStore = useOcrStore((state) => state);
  const orderStore = useOrderStore((state) => state);
  const appealStore = useAppealsStore((state) => state);

  const handleDeletionConfirmationOpen = () => {
    setDeletionConfirmationOpen(true);
  };

  const handleDeletionConfirmationClose = () => {
    setDeletionConfirmationOpen(false);
  };

  const handleActionsMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setActionsEl(event.currentTarget);
  };

  const handleActionsMenuClose = () => {
    setActionsEl(null);
  };

  const handleMenuUploadClick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = uploadRef.current?.files;
    const formData = new FormData();

    if (!files) {
      return;
    }

    for (let i = 0; i < files.length; i++) {
      formData.append("files[]", files[i], files[i].name);
    }

    ocrStore.ocrRouteAndReservation(id, formData).then(() => {
      uploadRef!.current!.value = "";
      enqueueSnackbar("Файл загружен", { variant: "success" });
    });
    handleActionsMenuClose();
  };

  const handleMenuDeleteClick = () => {
    handleDeletionConfirmationOpen();
  };

  const handleDeleteAction = async () => {
    await orderDetailsStore.deleteItem({ id });

    if (orderDetailsStore.total == 1 && orderStore.item) {
      // await userStore.deleteItem(orderStore.item.clientPartner.id);
      // await appealStore.updateItem({ id: appealStore.item!.id!, saleOrder: null });
      await orderStore.deleteItem(orderStore.item?.id);
    }

    handleDeletionConfirmationClose();
    handleActionsMenuClose();
  };

  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <IconButton disabled={disabled} onClick={handleActionsMenuOpen}>
        <MoreVertIcon />
      </IconButton>

      <Menu
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        anchorEl={actionsEl}
        open={Boolean(actionsEl)}
        onClose={handleActionsMenuClose}
      >
        <MenuItem component="label">
          <VisuallyHiddenInput
            type="file"
            accept="image/png, image/jpeg"
            multiple
            ref={uploadRef}
            onChange={handleMenuUploadClick}
          />
          <ListItemIcon>
            <FileUploadOutlinedIcon />
          </ListItemIcon>
          <ListItemText>Загрузить</ListItemText>
        </MenuItem>
        {!orderStore.item?.saleOrderSeq && (
          <MenuItem onClick={handleMenuDeleteClick}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText>Удалить</ListItemText>
          </MenuItem>
        )}
      </Menu>

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
    </Stack>
  );
}
