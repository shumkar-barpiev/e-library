"use client";
import { CircularProgress, IconButton } from "@mui/material";
import { blue } from "@mui/material/colors";
import React from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { VisuallyHiddenInput } from "@/components/other/VisuallyHiddenInput";
import { useOcrStore } from "@/stores/ocr/ocr";
import { enqueueSnackbar } from "notistack";
import { TOcrChatModel } from "@/models/ocr/ocr";

export default function OcrAttachingFile({
  setTextAreaValue,
  ...props
}: {
  setTextAreaValue: React.Dispatch<React.SetStateAction<string>>;
}) {
  const ocrStore = useOcrStore((state) => state);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      enqueueSnackbar("Файл не выбран", { variant: "error" });
      return;
    }

    const formData = new FormData();

    formData.append("image", file, file.name);

    ocrStore.ocrTicketDetails(formData).then((values: TOcrChatModel[]) => {
      if (values?.length > 0) {
        enqueueSnackbar("Файл загружен", { variant: "success" });
        let textAreaContent = "";

        values.forEach((value: TOcrChatModel) => {
          textAreaContent +=
            "\nАэропорт: " +
            (value?.airport || "") +
            "\nДата прибытия: " +
            (value?.arrivalDate || "") +
            "\nВремя прибытия: " +
            (value?.arrivalTime || "") +
            "\n" +
            (value?.cost || "") +
            "\nДата вылета: " +
            (value?.departureDate || "") +
            "\nВремя вылета: " +
            (value?.departureTime || "") +
            "\n" +
            (value?.operator || "");
        });
        setTextAreaValue(textAreaContent);
      } else {
        enqueueSnackbar("Не удалось распознать файл", { variant: "error" });
      }

      if (e?.target !== null) {
        e!.target!.value = "";
      }
    });
  };

  return (
    <IconButton sx={{ position: "relative" }} {...props}>
      <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFileChange} />
      {ocrStore.ocrTicketLoading ? (
        <CircularProgress size={20} />
      ) : (
        <AutoAwesomeIcon sx={{ color: blue[700] }} fontSize={"small"} />
      )}
    </IconButton>
  );
}
