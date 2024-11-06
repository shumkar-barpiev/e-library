import { TOrderDetailModel } from "@/models/orders/order-detail";
import { CircularProgress, IconButton } from "@mui/material";
import React, { ChangeEvent, useRef, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { UploadFile } from "@mui/icons-material";
import { StyledTextField } from "@/components/other/StyledTextField";
import { useOcrStore } from "@/stores/ocr/ocr";
import { VisuallyHiddenInput } from "@/components/other/VisuallyHiddenInput";
import { StyledTableCell } from "@/components/other/StyledTableCell";
import { useOrderDetailsStore } from "@/stores/orders/order-details";

export default function OrderDetailsFileCell({
  isLoading,
  disabled,
  item,
}: {
  isLoading?: boolean;
  disabled?: boolean;
  item?: TOrderDetailModel | null;
}) {
  const ocrStore = useOcrStore((state) => state);
  const orderDetailsStore = useOrderDetailsStore((state) => state);
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);

  const onUploaded = async (e: ChangeEvent<HTMLInputElement>) => {
    // if (e.target.id === "file") {
    //   e.target!.value = "";
    // }

    if (e.target?.files?.length === 0) {
      enqueueSnackbar(`Не удалось загрузить файл ${e.target?.files?.length}`, { variant: "error" });
      return;
    }

    if (!item?.id) {
      enqueueSnackbar("Не удалось загрузить файл", { variant: "error" });
      return;
    }

    uploadFile(e.target?.files);
  };

  const onPasteCapture = (e: React.ClipboardEvent<HTMLInputElement>) => {
    uploadFile(e.clipboardData.files);
  };

  const uploadFile = (files: FileList | null | undefined) => {
    if (!files || files.length === 0 || !item?.id) {
      enqueueSnackbar("Не удалось загрузить файл", { variant: "error" });
      return;
    }

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append("files[]", files[i], files[i].name);
    }

    setUploading(true);

    ocrStore.ocrRouteAndReservation(item!.id, formData).then(() => {
      orderDetailsStore.setDirty(true);
      ref!.current!.value = "";
      enqueueSnackbar("Файл загружен", { variant: "success" });
      setUploading(false);
    });
  };

  return (
    <StyledTableCell align="center" sx={{ width: 180 }}>
      <StyledTextField
        id="file"
        variant="standard"
        disabled={uploading || isLoading || disabled}
        onPasteCapture={onPasteCapture}
        onChange={onUploaded}
        InputProps={{
          endAdornment: (
            <IconButton size={"small"} color="secondary" disabled={uploading || isLoading || disabled}>
              <VisuallyHiddenInput type="file" multiple ref={ref} onChange={onUploaded} />
              {uploading ? <CircularProgress size={20} /> : <UploadFile fontSize={"small"} />}
            </IconButton>
          ),
        }}
      />
    </StyledTableCell>
  );
}
