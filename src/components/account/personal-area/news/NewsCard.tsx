import {
  Box,
  Link,
  Chip,
  Card,
  Menu,
  Stack,
  Avatar,
  Dialog,
  Button,
  Tooltip,
  MenuItem,
  CardMedia,
  IconButton,
  Typography,
  DialogTitle,
  CardContent,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import RouterLink from "next/link";
import { enqueueSnackbar } from "notistack";
import { isProduction } from "@/utils/utils";
import { TUserModel } from "@/models/user/user";
import { useUserStore } from "@/stores/users/users";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useMetaFileStore } from "@/stores/metafile/metafile";
import React, { useState, useEffect, useContext } from "react";
import { useUserNewsStore } from "@/stores/personal-area/news/user-news";
import { NewsFormatDate } from "@/components/account/personal-area/_helpers";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { StatusColor, StatusTitle } from "@/components/account/personal-area/_helpers";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";

export default function NewsCard({ post, reloadNews }: { post: Record<string, any>; reloadNews: () => void }) {
  const defaultNewsCardImage = `${process.env.NODE_ENV === "production" ? "/foms/front/" : "/"}assets/noNewsImage.png`;
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);
  const [newsCardWallpaper, setNewsCardWallpaper] = useState<string | null>(null);
  const [deletionConfirmationOpen, setDeletionConfirmationOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [currentUser, setCurrentUser] = useState<TUserModel | null>(null);
  const [postAuthorAvatar, setPostAuthorAvatar] = useState<string>("");
  const currentUserContext = useContext(CurrentUserContext);
  const openActionsDropdown = Boolean(anchorEl);
  const metafileStore = useMetaFileStore();
  const newsStore = useUserNewsStore();
  const usersStore = useUserStore();

  const postURL = isProduction
    ? `/foms/front/account/news/details.html?id=${post.id}`
    : `/account/news/details?id=${post.id}`;

  const handleDeletionConfirmationOpen = () => {
    setDeletionConfirmationOpen(true);
  };

  const handleDeletionConfirmationClose = () => {
    setDeletionConfirmationOpen(false);
  };

  const handleDropdownButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseDropdown = () => {
    setAnchorEl(null);
  };

  const handleDeleteAction = () => {
    newsStore.deleteNews(post?.id, deleteNewsCallback);
    handleDeletionConfirmationClose();
    handleCloseDropdown();
  };

  const handleMenuDeleteClick = () => {
    handleDeletionConfirmationOpen();
  };

  const changePublicationStatus = () => {
    const status = post?.pubStatus === "current" ? "irrelevant" : "current";
    const requestBody = {
      data: {
        id: post.id,
        pubStatus: status,
      },
    };

    newsStore.updateNews(requestBody, (data: Record<string, any>) => {
      if (data.status === 0) {
        reloadNews();
        enqueueSnackbar(
          `Cтатус публикации изменен на ${StatusTitle[requestBody?.data?.pubStatus as keyof typeof StatusTitle]}`,
          { variant: "success" }
        );
      } else {
        enqueueSnackbar("Что то пошло не так", { variant: "error" });
      }
    });
  };

  const deleteNewsCallback = (data: Record<string, any>) => {
    if (data.status === 0) {
      reloadNews();
      enqueueSnackbar("Новость успешно удалена", { variant: "success" });
    } else {
      enqueueSnackbar("Что то пошло не так", { variant: "error" });
    }
  };

  const postAuthorAvatarCallback = (data: string) => {
    setPostAuthorAvatar(data);
  };

  useEffect(() => {
    if (currentUserContext?.currentUser) setCurrentUser(currentUserContext?.currentUser);
    if (currentUserContext?.userRoles) setCurrentUserRoles(currentUserContext?.userRoles);

    if (post?.image?.[0]?.id) {
      metafileStore.getFile(post?.image?.[0]?.id).then((resp: any) => {
        if (!!resp) {
          const url = URL.createObjectURL(resp);
          setNewsCardWallpaper(url);
        }
      });
    }

    if (post?.createdBy?.id == currentUserContext?.currentUser?.id) {
      if (currentUserContext?.currentUserProfileImage) setPostAuthorAvatar(currentUserContext?.currentUserProfileImage);
    } else {
      usersStore.fetchUserProfileImage(post?.createdBy?.id, postAuthorAvatarCallback);
    }
  }, [currentUserContext]);

  return (
    <Card sx={{ position: "relative" }}>
      {(currentUser?.id == post?.createdBy?.id || currentUserRoles?.isAdmin) && (
        <Box sx={{ position: "absolute", right: 12, top: 8 }}>
          <Tooltip title="Действия">
            <IconButton
              onClick={handleDropdownButtonClick}
              size="small"
              sx={{ ml: 2, zIndex: 10 }}
              aria-controls={openActionsDropdown ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openActionsDropdown ? "true" : undefined}
            >
              <MoreHorizIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      <RouterLink href={postURL}>
        <Box sx={{ width: "100%", height: "250px", position: "relative", bgcolor: "white" }}>
          {newsCardWallpaper ? (
            <CardMedia
              image={newsCardWallpaper}
              sx={{
                top: "50%",
                left: "50%",
                objectFit: "cover",
                width: "100%",
                height: "100%",
                transform: "translate(-50%, -50%)",
                position: "absolute" as "absolute",
              }}
            />
          ) : (
            <CardMedia
              image={defaultNewsCardImage}
              sx={{
                top: "50%",
                left: "50%",
                objectFit: "cover",
                width: { xs: 32, sm: 64 }, // Default width for xs: 32, sm: 64
                height: { xs: 32, sm: 64 },
                transform: "translate(-50%, -50%)",
                position: "absolute" as "absolute",
              }}
            />
          )}
        </Box>
      </RouterLink>
      <CardContent>
        <Stack spacing={2}>
          {currentUserRoles?.isAdmin ? (
            <div>
              <Button
                onClick={() => changePublicationStatus()}
                sx={{
                  padding: 0,
                  minWidth: 0,
                  border: "none",
                  borderRadius: 70,
                  boxShadow: "none",
                  bgcolor: "transparent",
                  "&:hover": {
                    bgcolor: "transparent",
                    boxShadow: "none",
                  },
                  "&:focus": {
                    outline: "none",
                    boxShadow: "none",
                  },
                }}
              >
                <Chip
                  color={StatusColor[post?.pubStatus as keyof typeof StatusColor]}
                  label={StatusTitle[post?.pubStatus as keyof typeof StatusTitle]}
                />
              </Button>
            </div>
          ) : (
            <div>
              <Chip
                color={StatusColor[post?.pubStatus as keyof typeof StatusColor]}
                label={StatusTitle[post?.pubStatus as keyof typeof StatusTitle]}
              />
            </div>
          )}
          <div>
            <Link color="text.primary" component={RouterLink} href={postURL} variant="h5">
              {post?.pubTopic}
            </Link>
          </div>
          <Box
            sx={{
              height: "48px",
              overflow: "hidden",
              color: "text.secondary",
              textOverflow: "ellipsis",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: post?.description }} />
          </Box>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            {!!postAuthorAvatar ? <Avatar src={postAuthorAvatar} /> : <Avatar src={undefined} />}
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", flex: "1 1 auto", flexWrap: "wrap" }}>
              <Typography sx={{ flex: "1 1 auto" }} variant="subtitle2">
                {post?.createdBy?.fullName} • {NewsFormatDate(`${post?.createdOn}`)}
              </Typography>

              {(currentUserRoles?.isAdmin || currentUserRoles?.isManager || currentUserRoles?.isSubManager) && (
                <Typography variant="inherit" sx={{ color: "grey" }}>
                  {post?.forWhom == "subagent"
                    ? "Новость для субагентов"
                    : post?.forWhom == "agent"
                      ? "Новость для сотрудников"
                      : null}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Stack>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={openActionsDropdown}
        onClose={handleCloseDropdown}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem data-post-id={post?.id} onClick={handleMenuDeleteClick}>
          <DeleteOutlineOutlinedIcon /> Удалить
        </MenuItem>

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
      </Menu>
    </Card>
  );
}
