"use client";

import { TTaskModel, TaskModel } from "@/models/task/task";
import { useAppInfoStore } from "@/stores/dictionaries/app-info";
import { useTasksStore } from "@/stores/tasks/tasks";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { enqueueSnackbar } from "notistack";

export default function CreateTaskDialog({
  text,
  fromUserId,
  dialogState,
}: {
  text?: string;
  fromUserId?: number;
  dialogState?: [open: boolean, setOpen: (open: boolean) => void];
}) {
  const [open, setOpen] = dialogState ?? [false, (open) => open];

  const { control, setValue, handleSubmit, trigger } = useForm<TTaskModel>({
    defaultValues: {
      name: text ?? "",
      fromUser: { id: fromUserId },
      assignedTo: null,
    },
    resolver: zodResolver(TaskModel),
  });

  const appInfo = useAppInfoStore((state) => state.get());
  const taskStore = useTasksStore((state) => state);

  const handleClose = () => {
    if (setOpen != null) setOpen(false);
  };

  const handleCreate: SubmitHandler<TTaskModel> = async (data) => {
    const isValid = await trigger();

    if (isValid) {
      const created: TTaskModel[] | null = await taskStore.createItem(data);
      handleClose();
      if (created?.at(0)?.id != null) {
        window.parent.location.href =
          window.parent.location.origin +
          window.parent.location.pathname +
          "#/ds/team.tasks.assigned/edit/" +
          created?.at(0)?.id;
      }
    } else {
      enqueueSnackbar("Не удалось создать задачу", { variant: "error" });
    }
  };

  useEffect(() => {
    if (appInfo?.["user.id"] != null) setValue("assignedTo", { id: appInfo?.["user.id"] });
  }, [appInfo, setValue]);

  return (
    <Box>
      {dialogState && (
        <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { maxWidth: 800 } }}>
          <DialogTitle>Создать задачу</DialogTitle>
          <form onSubmit={handleSubmit(handleCreate)}>
            <DialogContent>
              <Controller
                name="name"
                control={control}
                disabled={taskStore.loading}
                render={({ field, fieldState }) => (
                  <>
                    <TextField
                      {...field}
                      size="small"
                      label="Название"
                      multiline
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  </>
                )}
              />
            </DialogContent>
            <DialogActions>
              <Button color="secondary" onClick={handleClose}>
                Отмена
              </Button>
              <Button color="primary" type="submit">
                Создать
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </Box>
  );
}
