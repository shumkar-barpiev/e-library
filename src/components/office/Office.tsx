"use client";

import { useState, useEffect } from "react";
import { enqueueSnackbar } from "notistack";
import { useUserStore } from "@/stores/users/users";
import { useForm, Controller } from "react-hook-form";
import { SelectChangeEvent } from "@mui/material/Select";
import { useAllOfficeDetailsStore } from "@/stores/office/all-office-details";
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";

type AutoOpenDivModalProps = {
  open: boolean;
  onClose: () => void;
};

const AutoOpenDivModal = ({ open, onClose }: AutoOpenDivModalProps) => {
  const userStore = useUserStore();
  const officeDetailsStore = useAllOfficeDetailsStore();
  const [userId, setUserId] = useState<number | null>(null);

  const {
    reset,
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      selectedOffice: "",
    },
  });

  const handleFormSubmit = (data: Record<string, any>) => {
    if (isDirty && userId !== null) {
      officeDetailsStore.updateUserOffice(
        {
          data: {
            id: userId,
            activeCompany: { id: data.selectedOffice },
          },
        },
        updateUserOfficeCallback
      );
      userStore.updateUserProfile(
        {
          data: {
            id: userId,
            homeAction: "foms-custom-action-views-dashboard",
          },
        },
        (data: Record<string, any>) => {
          if (data.status != 0) console.log("Current user home action hasn't been updated");
        }
      );

      setSessionWithTimeout("currentUserHasBeenSelectedTheOffice", userId, 9);
    }
  };

  const setSessionWithTimeout = (key: string, value: any, hours: number) => {
    const now = new Date();
    const calculatedTime = hours * 60 * 60 * 1000;
    const expirationTime = now.getTime() + calculatedTime;

    sessionStorage.setItem(key, JSON.stringify({ value, expirationTime }));

    setTimeout(() => {
      const sessionDataString = sessionStorage.getItem(key);
      if (sessionDataString) {
        const sessionData = JSON.parse(sessionDataString);

        if (sessionData && sessionData.expirationTime <= new Date().getTime()) {
          userStore.updateUserProfile(
            {
              data: {
                id: sessionData.value,
                homeAction: "foms-custom-action-views-set-office",
              },
            },
            (data: Record<string, any>) => {
              if (data.status != 0) console.log("Current user home action hasn't been updated");
            }
          );

          sessionStorage.removeItem(key);
        }
      }
    }, calculatedTime + 1000);
  };

  const currentUserIdCallback = (data: Record<string, any>) => {
    if (data.status == 0) setUserId(data.data.id);
    else enqueueSnackbar("Не удалось получить ID пользователя. Попробуйте еще раз.", { variant: "error" });
  };

  const updateUserOfficeCallback = (data: Record<string, any>) => {
    if (data.status == 0) {
      enqueueSnackbar("Офис успешно выбран! Переходите к следующему шагу.", { variant: "success" });
      window.parent.location.href =
        process.env.NEXT_PUBLIC_API_URL + "/foms/#/ds/foms-custom-action-views-dashboard/html";
      onClose();
    } else {
      enqueueSnackbar("Не удалось обновить офис пользователя", { variant: "error" });
    }
  };

  useEffect(() => {
    if (open) {
      userStore.getCurrentUserId(currentUserIdCallback);
      officeDetailsStore.fetchAllOffices();
    }
  }, [open]);

  return (
    <>
      {open && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: { xs: "90%", sm: 500 },
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography id="auto-open-modal-title" variant="h6" component="h2">
              Выберите ваш офис
            </Typography>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <FormControl fullWidth sx={{ mt: 2, minWidth: 350 }}>
                <InputLabel id="select-office-label">Доступные офисы</InputLabel>
                <Controller
                  name="selectedOffice"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      id="select-office"
                      label="Доступные офисы"
                      labelId="select-office-label"
                      sx={{
                        mb: 2,
                        minHeight: "40px",
                        "& .MuiMenu-paper": {
                          maxHeight: "200px",
                        },
                      }}
                      onChange={(e) => {
                        if (e.target.value !== field.value) {
                          field.onChange(e);
                        }
                      }}
                    >
                      {officeDetailsStore.loadingAllOffices ? (
                        <MenuItem>Loading offices...</MenuItem>
                      ) : officeDetailsStore.offices != null && officeDetailsStore.offices.length > 0 ? (
                        officeDetailsStore.offices
                          .slice()
                          .sort((a, b) => a.id - b.id)
                          .map((office) => (
                            <MenuItem key={office.id} value={office.id}>
                              {office.name}
                            </MenuItem>
                          ))
                      ) : (
                        <MenuItem disabled>Офисы недоступны</MenuItem>
                      )}
                    </Select>
                  )}
                />
              </FormControl>
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2, width: "100%" }}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ backgroundColor: "#4a6b9c", "&:hover": { backgroundColor: "#3a5b7c" } }}
                >
                  Отправить
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      )}
    </>
  );
};

export default AutoOpenDivModal;
