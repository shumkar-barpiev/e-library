"use client";

import {
  Box,
  Chip,
  Card,
  Grid,
  Stack,
  Modal,
  Table,
  Paper,
  Avatar,
  Button,
  Dialog,
  Divider,
  Popover,
  TableRow,
  CardMedia,
  ImageList,
  TableCell,
  TableBody,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageListItem,
  TableContainer,
  DialogContentText,
  Tooltip,
} from "@mui/material";
import Image from "next/image";
import ClearIcon from "@mui/icons-material/Clear";
import React, { useEffect, useState } from "react";
import { useUserStore } from "@/stores/users/users";
import { useAxelorStore } from "@/stores/axelor/axelor";
import DownloadIcon from "@mui/icons-material/Download";
import {
  isHR,
  isAdmin,
  isAccountant,
  isSubManagers,
  isChiefAccountant,
  isExcludedBonusUser,
  isComponentAvailableForAgents,
  isComponentAvailableForManagers,
  isComponentAvailableForSubagents,
} from "@/components/account/personal-area/_helpers/roles";
import { UserNewsType } from "@/models/user-news/user-news";
import { useMetaFileStore } from "@/stores/metafile/metafile";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useUserNewsStore } from "@/stores/personal-area/news/user-news";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { NewsFormatDate } from "@/components/account/personal-area/_helpers";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { ModalStyle } from "@/components/account/personal-area/profile/Profile";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { StatusColor, StatusTitle } from "@/components/account/personal-area/_helpers";
import { CommentBox } from "@/components/account/personal-area/news/comments/CommentBox";
import { RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";

type NewsDetailsPropsType = {
  handleGoBack: () => void;
  reloadTheNews: () => void;
  post: UserNewsType | null;
  currentUser: Record<string, any> | null;
};

export default function NewsDetails({ post, currentUser, handleGoBack, reloadTheNews }: NewsDetailsPropsType) {
  const userStore = useUserStore();
  const newsStore = useUserNewsStore();
  const axelorStore = useAxelorStore();
  const [open, setOpen] = useState(false);
  const metafileStore = useMetaFileStore();
  const [postAuthorAvatar, setPostAuthorAvatar] = useState<string>("");
  const [roles, setRoles] = useState<Record<string, any> | null>(null);
  const [renderPostAssets, setRenderPostAssets] = useState<boolean>(false);
  const [postImagesBlobURL, setPostImagesBlobURL] = useState<string[]>([]);
  const [postVideosBlobURL, setPostVideosBlobURL] = useState<string[]>([]);
  const [postAttachmentsBlobURL, setPostAttachmentsBlobURL] = useState<any>([]);
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);
  const [currentPreviewImageIndex, setCurrentPreviewImageIndex] = useState<number>();
  const [downloadViewHistoryPDF, setDownloadViewHistoryPDF] = useState<boolean>(false);
  const [viewHistoryAnchorEl, setViewHistoryAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const openViewHistory = Boolean(viewHistoryAnchorEl);
  const viewHistoryPopoverId = openViewHistory ? "simple-popover" : undefined;

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleViewHistoryClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setViewHistoryAnchorEl(event.currentTarget);
    setTimeout(() => {
      const tableView = document.getElementById("viewHistoryTable");
      if (tableView) tableView.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 10);
  };

  const handleClose = () => {
    setViewHistoryAnchorEl(null);
  };

  const downloadViewHistory = () => {
    setDownloadViewHistoryPDF(true);
  };

  const handleImage = (index: number) => {
    setCurrentPreviewImageIndex(index);
    setOpen(true);
  };

  const postAuthorAvatarCallback = (data: string) => {
    setPostAuthorAvatar(data);
  };

  const handleDownload = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const anchor = (event.currentTarget.parentElement as HTMLElement)?.querySelector("a");

    if (anchor) (anchor as HTMLElement).click();
  };

  async function getPostFile(fileId: number, type: "image" | "video" | "attachment", fileName: string | null) {
    const resp = await metafileStore.getFile(fileId);
    if (!!resp) {
      const url = URL.createObjectURL(resp as Blob);
      if (type === "image") {
        setPostImagesBlobURL((prev) => [...prev, url]);
      } else if (type === "video") {
        setPostVideosBlobURL((prev_1) => [...prev_1, url]);
      } else if (type === "attachment") {
        const attachmentsObject = {
          url: url,
          fileName: fileName,
        };
        setPostAttachmentsBlobURL((prev_2: any) => [...prev_2, attachmentsObject]);
      }
    }
  }

  useEffect(() => {
    userStore.fetchUserProfileImage(post?.createdBy?.id, postAuthorAvatarCallback);

    const promises: Promise<void>[] = [];

    if (post?.image) {
      Array.from(post?.image).forEach((imageFile) => {
        promises.push(getPostFile(imageFile?.id, "image", null));
      });
    }

    if (post?.video) {
      Array.from(post?.video).forEach((videoFile) => {
        promises.push(getPostFile(videoFile.id, "video", null));
      });
    }

    if (post?.attachment) {
      Array.from(post?.attachment).forEach((attachmentFile) => {
        promises.push(getPostFile(attachmentFile.id, "attachment", attachmentFile?.fileName));
      });
    }

    Promise.all(promises)
      .then(() => {
        setRenderPostAssets(true);
      })
      .catch((error) => {
        console.error("Error in uploading files", error);
      });

    return () => {
      postImagesBlobURL.forEach((url) => URL.revokeObjectURL(url));

      setPostImagesBlobURL([]);
      setPostVideosBlobURL([]);
      setPostAttachmentsBlobURL([]);
    };
  }, [post]);

  const generatePdfFile = async () => {
    const html2PDF = (await import("jspdf-html2canvas")).default;
    const input = document.getElementById("publicationViewHistory");

    if (input && html2PDF) {
      const pdfName = `Просмотр_истории_${post?.pubTopic}_${NewsFormatDate(`${post?.createdOn}`)}.pdf`;

      await html2PDF(input, {
        autoResize: true,
        imageType: "image/png",
        jsPDF: { orientation: "landscape" },
        margin: { right: 10, left: 10, top: 10, bottom: 10 },
        html2canvas: { scale: 2, logging: true, useCORS: false },
        output: pdfName,
        success: (pdf) => {
          pdf.save(pdfName);
          setDownloadViewHistoryPDF(false);
        },
      });
    }
  };

  useEffect(() => {
    if (downloadViewHistoryPDF) generatePdfFile();
  }, [downloadViewHistoryPDF]);

  useEffect(() => {
    if (!!roles && !!currentUser) {
      setCurrentUserRoles({
        isAdmin: isAdmin(currentUser),
        isHR: isHR(currentUser, roles?.hr),
        isChiefAccountant: isChiefAccountant(currentUser),
        isAccountant: isAccountant(currentUser, roles?.accountant),
        isSubManager: isSubManagers(currentUser, roles?.subManager),
        isAgent: isComponentAvailableForAgents(currentUser, roles?.agent),
        isExcludedBonusUser: isExcludedBonusUser(currentUser, roles?.exclude),
        isManager: isComponentAvailableForManagers(currentUser, roles?.manager),
        isSubagent: isComponentAvailableForSubagents(currentUser, roles?.subAgent),
      });
    }
  }, [roles, currentUser]);

  useEffect(() => {
    axelorStore.fetchConfig().then((resp: Record<string, any> | null) => {
      if (resp?.roles) setRoles(resp?.roles);
    });
  }, []);

  const handlePrev = () => {
    if (currentPreviewImageIndex === 0) return;
    setCurrentPreviewImageIndex((prev) => {
      if (prev !== undefined && prev > 0) return prev - 1;
    });
  };

  const handleNext = () => {
    if (currentPreviewImageIndex === postImagesBlobURL.length - 1) return;
    setCurrentPreviewImageIndex((prev) => {
      if (prev !== undefined && prev < postImagesBlobURL.length - 1) {
        return prev + 1;
      }
    });
  };

  const changeDateFormat = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleNewsConfirmation = () => {
    const reqBody = {
      data: {
        viewDate: `${changeDateFormat(new Date())}`,
        relatedUser: {
          id: currentUser?.id,
        },
        publication: {
          id: post?.id,
        },
      },
    };

    newsStore.confirmTheNewsFollower(reqBody, (data: Record<string, any>) => {
      if (data.status == 0) reloadTheNews();
    });
  };

  return (
    <>
      {post?.trackablePub &&
      !post?.viewHistories.map((item) => item?.user?.id).includes(currentUser?.id) &&
      currentUser?.id !== post?.createdBy?.id ? (
        <Box>
          <Dialog
            open={true}
            onClose={() => {}}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">Данная новость с листом согласования</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Вам необходимо подтвердить чтобы посмотреть новость!
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button color="secondary" onClick={handleGoBack}>
                Отмена
              </Button>
              <Button color="success" onClick={handleNewsConfirmation} autoFocus>
                Подтвердить
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      ) : (
        <Box p={2}>
          <Stack spacing={8}>
            <Stack spacing={3}>
              <div>
                <Chip
                  color={StatusColor[post?.pubStatus as keyof typeof StatusColor]}
                  label={StatusTitle[post?.pubStatus as keyof typeof StatusTitle]}
                />
              </div>
              <Stack spacing={2}>
                <Typography variant="h3">{post?.pubTopic}</Typography>
                <Box sx={{ color: "text.secondary", p: 3 }}>
                  {!!post && <div dangerouslySetInnerHTML={{ __html: post?.description }} />}
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                {!!postAuthorAvatar ? <Avatar src={postAuthorAvatar} /> : <Avatar />}
                <div>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {post?.createdBy?.fullName}
                    </Typography>
                    <Typography>•</Typography>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {NewsFormatDate(`${post?.createdOn}`)}
                    </Typography>
                  </Box>
                </div>
                {(currentUser?.id == post?.createdBy?.id || currentUserRoles?.isAdmin) && post?.trackablePub && (
                  <div>
                    <IconButton aria-describedby={viewHistoryPopoverId} onClick={handleViewHistoryClick}>
                      {openViewHistory ? (
                        <VisibilityOffOutlinedIcon color="secondary" />
                      ) : (
                        <VisibilityOutlinedIcon color="secondary" />
                      )}
                    </IconButton>
                    <Popover
                      id={viewHistoryPopoverId}
                      open={openViewHistory}
                      anchorEl={viewHistoryAnchorEl}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                      }}
                    >
                      <Box sx={{ p: 1, maxHeight: "150px", overflow: "auto", position: "relative" }}>
                        <Box
                          sx={{
                            position: "sticky",
                            mb: 1,
                            top: 1,
                            right: 1,
                            zIndex: 1,
                            display: "flex",
                            justifyContent: "end",
                          }}
                        >
                          <IconButton
                            size="small"
                            sx={{
                              color: "white",
                              bgcolor: "#5F8CCC",
                              "&:hover": {
                                backgroundColor: "#5F8CCC",
                                color: "white",
                              },
                            }}
                            onClick={() => downloadViewHistory()}
                          >
                            <Tooltip title="Скачать как PDF">
                              <DownloadIcon fontSize="small" />
                            </Tooltip>
                          </IconButton>
                        </Box>
                        <Box id={"publicationViewHistory"}>
                          <Card sx={{ p: 1, mb: 1 }}>
                            <Grid container>
                              <Grid item sm={4}>
                                <Typography variant="subtitle2">Название публикации:</Typography>
                              </Grid>
                              <Grid item sm={8}>
                                <Typography sx={{ fontSize: "12px" }}>{post.pubTopic}</Typography>
                              </Grid>
                              <Grid item sm={4}>
                                <Typography variant="subtitle2">Автор:</Typography>
                              </Grid>
                              <Grid item sm={8}>
                                <Typography sx={{ fontSize: "12px" }}>{post?.createdBy?.fullName}</Typography>
                              </Grid>
                              <Grid item sm={4}>
                                <Typography variant="subtitle2">Дата:</Typography>
                              </Grid>
                              <Grid item sm={8}>
                                <Typography sx={{ fontSize: "12px" }}>
                                  {NewsFormatDate(`${post?.createdOn}`)}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Card>
                          {post && post?.viewHistories?.length > 0 ? (
                            <TableContainer id="viewHistoryTable" component={Paper} sx={{ p: 1, minWidth: "400px" }}>
                              <Table>
                                <TableBody>
                                  {post?.viewHistories.map((viewer, index) => {
                                    return (
                                      <TableRow key={viewer.id} sx={{ height: 10 }}>
                                        <TableCell sx={{ padding: "3px", width: "10%", whiteSpace: "nowrap" }}>
                                          <Typography sx={{ fontSize: "12px", fontWeight: "bold" }}>
                                            {index + 1}.
                                          </Typography>
                                        </TableCell>
                                        <TableCell
                                          sx={{ fontSize: "12px", padding: "3px", width: "50%", whiteSpace: "nowrap" }}
                                        >
                                          {viewer?.user?.name}
                                        </TableCell>
                                        <TableCell
                                          sx={{ fontSize: "12px", padding: "3px", width: "40%", whiteSpace: "nowrap" }}
                                        >
                                          {NewsFormatDate(`${viewer.viewDate}`)}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          ) : (
                            <Typography sx={{ p: 2 }}>Нет пользователей, просмотревших этот пост.</Typography>
                          )}
                        </Box>
                      </Box>
                    </Popover>
                  </div>
                )}
              </Stack>

              {renderPostAssets && (
                <>
                  <Box>
                    <ImageList sx={{ width: 500, maxHeight: 450 }} cols={3} rowHeight={164}>
                      <>
                        {postImagesBlobURL.map((url: string, index: number) => (
                          <ImageListItem key={url}>
                            <CardMedia
                              image={url}
                              sx={{
                                width: "164px",
                                height: "164px",
                                objectFit: "cover",
                              }}
                            />
                            <IconButton
                              onClick={() => handleImage(index)}
                              sx={{
                                mt: 1,
                                ml: 1,
                                fontSize: "small",
                                position: "absolute",
                                backgroundColor: "white",
                                "&:hover": {
                                  backgroundColor: "lightgrey",
                                },
                              }}
                            >
                              <RemoveRedEyeOutlinedIcon sx={{ fontSize: "medium" }} />
                            </IconButton>
                          </ImageListItem>
                        ))}

                        <Modal
                          open={open}
                          onClose={handleCloseModal}
                          aria-labelledby="modal-modal-title"
                          aria-describedby="modal-modal-description"
                        >
                          <Box
                            sx={{
                              ...ModalStyle,
                              width: { xs: "90%", md: 600 },
                              position: "relative",
                              maxHeight: "90vh",
                              overflow: "auto",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                position: "absolute",
                                top: 8,
                                left: 8,
                              }}
                            >
                              {postImagesBlobURL.length > 1 && (
                                <>
                                  <IconButton aria-label="close-modal" onClick={handlePrev}>
                                    <ChevronLeftIcon />
                                  </IconButton>
                                  <IconButton aria-label="close-modal" onClick={handleNext}>
                                    <ChevronRightIcon />
                                  </IconButton>
                                  {currentPreviewImageIndex !== undefined && (
                                    <Typography>
                                      {currentPreviewImageIndex + 1} / {postImagesBlobURL?.length}
                                    </Typography>
                                  )}
                                </>
                              )}
                            </Box>
                            <IconButton
                              aria-label="close-modal"
                              sx={{ position: "absolute", top: 8, right: 8 }}
                              onClick={handleCloseModal}
                            >
                              <ClearIcon />
                            </IconButton>
                            <Box
                              id="modal-modal-description"
                              sx={{ mt: 3, display: "flex", justifyContent: "center", alignItems: "center" }}
                            >
                              {currentPreviewImageIndex != undefined && (
                                <Image
                                  src={postImagesBlobURL[currentPreviewImageIndex]}
                                  style={{ objectFit: "scale-down", margin: "0 auto" }}
                                  width={500}
                                  height={500}
                                  alt="previewImage"
                                />
                              )}
                            </Box>
                          </Box>
                        </Modal>
                      </>

                      {postVideosBlobURL.map((url: string) => {
                        return (
                          <ImageListItem key={url}>
                            <Box
                              sx={{
                                width: "164px",
                                height: "164px",
                                objectFit: "cover",
                                display: "flex",
                              }}
                            >
                              <video controls width="100%" height="100%" style={{ objectFit: "cover" }}>
                                <source src={url} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            </Box>
                          </ImageListItem>
                        );
                      })}
                    </ImageList>

                    {postAttachmentsBlobURL.map((attachmentFile: any) => (
                      <Box key={attachmentFile.url} sx={{ mt: 2, display: "flex", alignItems: "center" }}>
                        <Button
                          onClick={(event: React.MouseEvent<HTMLButtonElement>) => handleDownload(event)}
                          variant="contained"
                          color="primary"
                          sx={{ mr: 2, whiteSpace: "nowrap" }}
                        >
                          Скачать файл
                        </Button>
                        <Typography variant="body1">{attachmentFile.fileName}</Typography>
                        <a
                          style={{ display: "none" }}
                          href={attachmentFile.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={attachmentFile.fileName}
                        >
                          {attachmentFile.fileName}
                        </a>
                      </Box>
                    ))}
                  </Box>
                  <Divider />
                </>
              )}
              <CommentBox post={post} />
            </Stack>
          </Stack>
        </Box>
      )}
    </>
  );
}
