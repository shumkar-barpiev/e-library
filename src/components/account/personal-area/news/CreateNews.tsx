import {
  Box,
  Modal,
  Button,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  FormControlLabel,
} from "@mui/material";
import "../news/css/style.css";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { enqueueSnackbar } from "notistack";
import { ModalStyle } from "../profile/Profile";
import React, { useState, useRef } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import { useForm, Controller } from "react-hook-form";
import AddSharpIcon from "@mui/icons-material/AddSharp";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useMetaFileStore } from "@/stores/metafile/metafile";
import { useUserNewsStore } from "@/stores/personal-area/news/user-news";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
});

interface NewsFormInputs {
  pubTopic: string;
  pubStatus: string;
  forWhom: string;
  description: string;
  trackablePub: boolean;
  image: { id: number }[];
  video: { id: number }[];
  attachment: { id: number }[];
}

const QuillModules = {
  toolbar: [
    ["link", "image"],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ align: ["right", "center", "justify"] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
  ],
};

const QuillFormats = [
  "bold",
  "list",
  "link",
  "image",
  "align",
  "header",
  "bullet",
  "indent",
  "italic",
  "strike",
  "underline",
  "blockquote",
];

function CreateNews({ reloadNews }: { reloadNews: () => void }) {
  const newsStore = useUserNewsStore();
  const metafileStore = useMetaFileStore();
  const [open, setOpen] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const attachmentFileInputRef = useRef<HTMLInputElement>(null);
  const [imageFilePreviews, setImageFilePreviews] = useState<Set<string>>(new Set());
  const [videoFilePreviews, setVideoFilePreviews] = useState<Set<string>>(new Set());
  const [attachmentFilePreviews, setAttachmentFilePreviews] = useState<Set<string>>(new Set());

  const handleCloseModal = () => {
    if (isDirty) {
      const confirmed = window.confirm("Ваши изменения будут удалены. Вы уверены, что хотите закрыть модальное окно?");
      if (confirmed) {
        setOpen(false);
        clearFormFields();
      }
    } else {
      setOpen(false);
      clearFormFields();
    }
  };

  const clearFormFields = () => {
    setImageFilePreviews(new Set());
    setVideoFilePreviews(new Set());
    setAttachmentFilePreviews(new Set());

    reset({
      pubTopic: "",
      pubStatus: "",
      forWhom: "",
      description: "",
      trackablePub: false,
    });
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length) {
      const newFilePreviews = new Set(imageFilePreviews);
      Array.from(files).forEach((file) => newFilePreviews.add(file.name));
      setImageFilePreviews(newFilePreviews);
    }
  };

  const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length) {
      const newFilePreviews = new Set(videoFilePreviews);
      Array.from(files).forEach((file) => newFilePreviews.add(file.name));
      setVideoFilePreviews(newFilePreviews);
    }
  };

  const handleAttachmentFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length) {
      const newFilePreviews = new Set(attachmentFilePreviews);
      Array.from(files).forEach((file) => newFilePreviews.add(file.name));
      setAttachmentFilePreviews(newFilePreviews);
    }
  };

  const handleClearImageFile = (fileName: string) => {
    const newFilePreviews = new Set(imageFilePreviews);
    newFilePreviews.delete(fileName);
    setImageFilePreviews(newFilePreviews);

    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = "";
    }
  };

  const handleClearVideoFile = (fileName: string) => {
    const newFilePreviews = new Set(videoFilePreviews);
    newFilePreviews.delete(fileName);
    setVideoFilePreviews(newFilePreviews);

    if (videoFileInputRef.current) {
      videoFileInputRef.current.value = "";
    }
  };

  const handleClearAttachmentFile = (fileName: string) => {
    const newFilePreviews = new Set(attachmentFilePreviews);
    newFilePreviews.delete(fileName);
    setAttachmentFilePreviews(newFilePreviews);

    if (attachmentFileInputRef.current) {
      attachmentFileInputRef.current.value = "";
    }
  };

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isDirty, errors },
  } = useForm<NewsFormInputs>({
    defaultValues: {
      pubTopic: "",
      pubStatus: "",
      forWhom: "",
      description: "",
      trackablePub: false,
    },
  });

  const createNewsCallback = (data: Record<string, any>) => {
    if (data.status === 0) {
      enqueueSnackbar("Новость успешно создана", { variant: "success" });
      reloadNews();
      clearFormFields();
      setOpen(false);
    } else {
      enqueueSnackbar("Что то пошло не так", { variant: "error" });
    }
  };

  const onSubmit = (data: Record<string, any>) => {
    const imageFiles = imageFileInputRef.current?.files;
    const videoFiles = videoFileInputRef.current?.files;
    const attachmentFiles = attachmentFileInputRef.current?.files;

    interface AssetsBodyType {
      id: number;
    }

    interface AssetsImageType {
      image: AssetsBodyType[];
    }

    interface AssetsVideoType {
      video: AssetsBodyType[];
    }

    interface AssetsAttachmentType {
      attachment: AssetsBodyType[];
    }

    if (
      (imageFiles && imageFiles.length > 0) ||
      (videoFiles && videoFiles.length > 0) ||
      (attachmentFiles && attachmentFiles.length > 0)
    ) {
      const uploadFile = (file: File, type: "image" | "video" | "attachment") => {
        const request = {
          data: {
            fileName: file?.name,
          },
        };

        return metafileStore.saveFile(file, request).then((resp) => {
          if (resp?.status === 0) {
            const reqBody = { id: resp?.data?.[0]?.id };
            if (type === "image") {
              imageReqBody.image = [...imageReqBody.image, { ...reqBody }];
            } else if (type === "video") {
              videoReqBody.video = [...videoReqBody.video, { ...reqBody }];
            } else if (type === "attachment") {
              attachmentReqBody.attachment = [...attachmentReqBody.attachment, { ...reqBody }];
            }
          }
        });
      };

      let imageReqBody: AssetsImageType = {
        image: [],
      };

      let videoReqBody: AssetsVideoType = {
        video: [],
      };

      let attachmentReqBody: AssetsAttachmentType = {
        attachment: [],
      };

      const promises: Promise<void>[] = [];

      if (imageFiles) {
        Array.from(imageFiles).forEach((imageFile) => {
          promises.push(uploadFile(imageFile, "image"));
        });
      }

      if (videoFiles) {
        Array.from(videoFiles).forEach((videoFile) => {
          promises.push(uploadFile(videoFile, "video"));
        });
      }

      if (attachmentFiles) {
        Array.from(attachmentFiles).forEach((attachmentFile) => {
          promises.push(uploadFile(attachmentFile, "attachment"));
        });
      }

      Promise.all(promises)
        .then(() => {
          const requestBody = {
            data: {
              ...data,
              ...(imageReqBody.image.length > 0 ? { ...imageReqBody } : {}),
              ...(videoReqBody.video.length > 0 ? { ...videoReqBody } : {}),
              ...(attachmentReqBody.attachment.length > 0 ? { ...attachmentReqBody } : {}),
            },
          };

          newsStore.createNews(requestBody, createNewsCallback);
        })
        .catch((error) => {
          console.error("Error in uploading files", error);
        });
    } else {
      const requestBody = {
        data: {
          ...data,
        },
      };
      newsStore.createNews(requestBody, createNewsCallback);
    }
  };

  return (
    <>
      <IconButton color="primary" onClick={() => setOpen(true)} sx={{ ml: 2 }}>
        <AddSharpIcon />
      </IconButton>
      <Modal
        open={open}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            ...ModalStyle,
            width: { xs: "90%", sm: 500, md: 800 },
            position: "relative",
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
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
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                maxWidth: { xs: "90%", sm: 500, md: 800 },
                margin: "auto",
              }}
            >
              <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
                Создать Новости
              </Typography>
              <Box>
                <Controller
                  name="pubTopic"
                  rules={{ required: "Тема новости обязательна" }}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Тема новости"
                      type="text"
                      error={!!errors.pubTopic}
                      helperText={errors.pubTopic ? errors.pubTopic.message : ""}
                      fullWidth
                    />
                  )}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Controller
                  name="pubStatus"
                  control={control}
                  rules={{ required: "Заполните Статус" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Статус"
                      variant="outlined"
                      error={!!errors.pubStatus}
                      helperText={errors.pubStatus ? errors.pubStatus.message : ""}
                      InputProps={{
                        sx: {
                          borderBottom: "1px solid #eaeafe",
                        },
                      }}
                    >
                      <MenuItem value="current">Актуален</MenuItem>
                      <MenuItem value="irrelevant">Неактуален</MenuItem>
                    </TextField>
                  )}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Controller
                  name="forWhom"
                  control={control}
                  rules={{ required: "Определите адресата" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Адресат"
                      variant="outlined"
                      error={!!errors.forWhom}
                      helperText={errors.forWhom ? errors.forWhom.message : ""}
                      InputProps={{
                        sx: {
                          borderBottom: "1px solid #eaeafe",
                        },
                      }}
                    >
                      <MenuItem value="agent">Сотрудники</MenuItem>
                      <MenuItem value="subagent">Субагент</MenuItem>
                    </TextField>
                  )}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: "Заполните описание" }}
                  render={({ field }) => (
                    <>
                      <ReactQuill
                        {...field}
                        theme="snow"
                        placeholder="Описание"
                        modules={QuillModules}
                        formats={QuillFormats}
                      />
                      {!!errors.description && (
                        <Typography variant="body2" color="error" sx={{ px: 2, mt: 1 }}>
                          {errors.description.message}
                        </Typography>
                      )}
                    </>
                  )}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Controller
                  name="trackablePub"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Отметить как отслеживаемый пост."
                    />
                  )}
                />
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: 1 }}>
                <Box sx={{ width: "100%" }}>
                  <input
                    ref={imageFileInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    id="upload-button-image-file"
                    type="file"
                    onChange={handleImageFileChange}
                    multiple
                  />
                  <label htmlFor="upload-button-image-file">
                    <Button color="primary" aria-label="upload picture" component="span">
                      <AddPhotoAlternateIcon />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        Загрузить изображении
                      </Typography>
                    </Button>
                  </label>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", width: 1, gap: 1 }}>
                  {Array.from(imageFilePreviews).map((fileName, index) => (
                    <Box key={index} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="body2">{fileName}</Typography>
                      <IconButton onClick={() => handleClearImageFile(fileName)}>
                        <ClearIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: 1 }}>
                <Box sx={{ width: "100%" }}>
                  <input
                    ref={videoFileInputRef}
                    accept="video/*"
                    style={{ display: "none" }}
                    id="upload-button-video-file"
                    type="file"
                    onChange={handleVideoFileChange}
                    multiple
                  />
                  <label htmlFor="upload-button-video-file">
                    <Button color="primary" aria-label="upload picture" component="span">
                      <VideoFileIcon />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        Загрузить видео
                      </Typography>
                    </Button>
                  </label>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", width: 1, gap: 1 }}>
                  {Array.from(videoFilePreviews).map((fileName, index) => (
                    <Box key={index} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="body2">{fileName}</Typography>
                      <IconButton onClick={() => handleClearVideoFile(fileName)}>
                        <ClearIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: 1 }}>
                <Box sx={{ width: "100%" }}>
                  <input
                    ref={attachmentFileInputRef}
                    accept=".doc,.docx,.xls,.xlsx,.pdf"
                    style={{ display: "none" }}
                    id="upload-button-attachment-file"
                    type="file"
                    onChange={handleAttachmentFileChange}
                    multiple
                  />
                  <label htmlFor="upload-button-attachment-file">
                    <Button color="primary" aria-label="upload picture" component="span">
                      <UploadFileIcon />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        Прикрепить файл
                      </Typography>
                    </Button>
                  </label>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", width: 1, gap: 1 }}>
                  {Array.from(attachmentFilePreviews).map((fileName, index) => (
                    <Box key={index} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="body2">{fileName}</Typography>
                      <IconButton onClick={() => handleClearAttachmentFile(fileName)}>
                        <ClearIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Button type="submit" variant="contained" color="primary">
                Создать
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default CreateNews;
