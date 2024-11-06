"use client";

import {
  Box,
  Card,
  Grid,
  Modal,
  Avatar,
  Button,
  ListItem,
  CardMedia,
  TextField,
  Typography,
  IconButton,
  CardContent,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { TUserModel } from "@/models/user/user";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import ClearIcon from "@mui/icons-material/Clear";
import PhoneIcon from "@mui/icons-material/Phone";
import { useUserStore } from "@/stores/users/users";
import { useForm, Controller } from "react-hook-form";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import LabelImportantIcon from "@mui/icons-material/LabelImportant";
import React, { useState, useEffect, useRef, useContext } from "react";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";

export const ModalStyle = {
  p: 4,
  top: "50%",
  left: "50%",
  boxShadow: 24,
  borderRadius: "5px",
  bgcolor: "background.paper",
  transform: "translate(-50%, -50%)",
  position: "absolute" as "absolute",
};

interface ProfileFormInputs {
  email: string;
  mobilePhone: string;
  profileImage: File | null;
}

const UserProfile: React.FC = () => {
  const userStore = useUserStore();
  const fileInputRef = useRef(null);
  const defaultProfileImage = `${process.env.NODE_ENV === "production" ? "/foms/front/" : "/"}assets/noProfileImage.jpg`;

  const [open, setOpen] = useState(false);
  const currentUserContext = useContext(CurrentUserContext);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<TUserModel | null>(null);
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);

  const { control, handleSubmit, setValue, reset } = useForm<ProfileFormInputs>({
    defaultValues: {
      email: "",
      mobilePhone: "",
      profileImage: null,
    },
  });

  const handleCloseModal = () => {
    setOpen(false);
    setImagePreview(null);
  };

  const onSubmit = (data: Record<string, any>) => {
    const requestBody = {
      data: {
        id: currentUser?.id,
        ...(currentUser?.email?.toString().trim() !== data.email.toString().trim() ? { email: `${data.email}` } : {}),
        ...(currentUser?.mobilePhone?.toString().trim() !== data.mobilePhone.toString().trim()
          ? {
              partner: {
                id: currentUser?.partner?.id,
                mobilePhone: data.mobilePhone,
              },
            }
          : {}),
      },
    };

    if (data.profileImage) {
      const reader = new FileReader();

      reader.onload = (readerEvent: any) => {
        const base64ProfileImageString = readerEvent.target.result;
        const reqBody = {
          data: {
            id: currentUser?.id,
            ...(currentUser?.email?.toString().trim() !== data.email.toString().trim()
              ? { email: `${data.email}` }
              : {}),
            ...(currentUser?.mobilePhone?.toString().trim() !== data.mobilePhone.toString().trim()
              ? {
                  partner: {
                    id: currentUser?.partner?.id,
                    mobilePhone: data.mobilePhone,
                  },
                }
              : {}),
            image: base64ProfileImageString,
          },
        };

        userStore.updateUserProfile(reqBody, updateUserProfileCallback);
      };
      reader.readAsDataURL(data.profileImage);
    } else {
      userStore.updateUserProfile(requestBody, updateUserProfileCallback);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setValue("profileImage", file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const updateUserProfileCallback = (data: Record<string, any>) => {
    if (data.status === 0) {
      if (currentUserContext?.reloadCurrentUser) currentUserContext?.reloadCurrentUser();
      handleCloseModal();
      enqueueSnackbar("Профиль успешно обнавлена", { variant: "success" });
    } else {
      enqueueSnackbar("Что то пошло не так", { variant: "error" });
    }
  };

  useEffect(() => {
    if (currentUserContext?.currentUser) setCurrentUser(currentUserContext?.currentUser);
    if (currentUserContext?.userRoles) setCurrentUserRoles(currentUserContext?.userRoles);
    if (currentUserContext?.currentUserProfileImage) setProfileImage(currentUserContext?.currentUserProfileImage);
  }, [currentUserContext]);

  useEffect(() => {
    if (currentUser) {
      reset({
        email: currentUser?.email || "",
        mobilePhone: currentUser?.partner?.mobilePhone || "",
        profileImage: null,
      });
    }
  }, [currentUser]);

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <Card
            sx={{
              border: "none",
              boxShadow: "none",
              display: "flex",
              flexWrap: "wrap",
              backgroundColor: "gray.900",
              color: "gray.100",
              maxWidth: "md",
              pt: 4,
              position: "relative",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                flexShrink: 0,
                width: { xs: 120, sm: 128 },
                marginBottom: { xs: 2, sm: 0 },
                height: { xs: 120, sm: 128 },
              }}
            >
              <CardMedia
                component="img"
                image={profileImage || defaultProfileImage}
                alt={currentUser?.firstName}
                sx={{ objectFit: "cover", borderRadius: 1, width: "100%", height: "100%" }}
              />
            </Box>
            <CardContent sx={{ flex: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography component="h2" variant="h6">
                  {currentUser?.partner?.fullName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {currentUser?.roles?.[0]?.name}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {currentUserRoles?.isSubagent && !!currentUser?.organization && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccountBalanceRoundedIcon fontSize="small" />
                    <Typography variant="body2" color="textSecondary">
                      {currentUser?.organization?.name}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EmailIcon fontSize="small" />
                  <Typography variant="body2" color="textSecondary">
                    {currentUser?.email}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PhoneIcon fontSize="small" />
                  <Typography variant="body2" color="textSecondary">
                    {currentUser?.partner?.mobilePhone}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                <IconButton
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
                  <EditIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight="bold">
            Обязанности
          </Typography>
          {currentUser?.partner?.responsibility.map((resp: Record<string, any>) => {
            return (
              <ListItem key={resp?.id} sx={{ width: 1, gap: 1 }}>
                <LabelImportantIcon sx={{ fontSize: "medium" }} />
                <Typography variant="body2">{resp?.name}</Typography>
              </ListItem>
            );
          })}
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight="bold">
            Soft Skills
          </Typography>
          {currentUser?.partner?.softSkill.map((skill: Record<string, any>) => {
            return (
              <ListItem key={skill?.id} sx={{ width: 1, gap: 1 }}>
                <LabelImportantIcon sx={{ fontSize: "medium" }} />
                <Typography variant="body2">{skill?.name}</Typography>
              </ListItem>
            );
          })}
        </Grid>
      </Grid>

      <Modal
        open={open}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...ModalStyle, width: 400, position: "relative" }}>
          <IconButton
            aria-label="close-modal"
            sx={{ position: "absolute", top: 8, right: 8 }}
            onClick={handleCloseModal}
          >
            <ClearIcon />
          </IconButton>
          <Box id="modal-modal-description">
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 400, margin: "auto" }}
            >
              <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
                Редактировать Профиль
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: 1 }}>
                {!!imagePreview && (
                  <Avatar src={`${imagePreview}`} sx={{ width: { xs: 46, md: 76 }, height: { xs: 46, md: 76 } }} />
                )}
                <input
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  id="upload-button-file"
                  type="file"
                  onChange={handleImageChange}
                />
                <Box sx={{ display: "flex", width: 1, justifyContent: "space-between" }}>
                  <label htmlFor="upload-button-file">
                    <Button color="primary" aria-label="upload picture" component="span">
                      <PhotoCamera />
                      <Typography variant="body2" sx={{ ml: 1, fontSize: "0.7rem" }}>
                        Загрузить изображение
                      </Typography>
                    </Button>
                  </label>
                  {!!imagePreview && (
                    <IconButton
                      onClick={() => {
                        setImagePreview(null);
                        if (fileInputRef.current) {
                          const inputElement = fileInputRef.current as HTMLInputElement;
                          inputElement.value = "";
                        }
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>

              <Controller
                name="email"
                control={control}
                render={({ field }) => <TextField {...field} label="Email" type="email" fullWidth />}
              />

              <Controller
                name="mobilePhone"
                control={control}
                render={({ field }) => <TextField {...field} label="Mobile Phone" type="tel" fullWidth />}
              />

              <Button type="submit" variant="contained" color="primary">
                Обновить профиль
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default UserProfile;
