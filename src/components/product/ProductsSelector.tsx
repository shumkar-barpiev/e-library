import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import ProductsTable from "@/components/product/ProductsTable";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Box, Alert } from "@mui/material";

export default function ProductsSelector({
  serviceId,
  isLoading,
  disabled,
  onSubmit,
  hasSaleOrderLineNumberInvoice,
}: {
  serviceId: number;
  isLoading?: boolean;
  disabled?: boolean;
  hasSaleOrderLineNumberInvoice?: boolean;
  onSubmit?: (items: Record<string, number>[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showWarningMessage, setShowWarningMessage] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>[]>([]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setShowWarningMessage(false);
    setOpen(false);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasSaleOrderLineNumberInvoice) {
      const pnrNumbers = selectedItems.map((item) => item.pnrNumber);
      const allSame = pnrNumbers.every((pnr) => pnr === pnrNumbers[0]);

      if (allSame) {
        setOpen(false);
        onSubmit?.(selectedItems);
      } else {
        setShowWarningMessage(true);
      }
    } else {
      setOpen(false);
      onSubmit?.(selectedItems);
    }
  };

  const handleSelectedItems = (items: any[]) => {
    setSelectedItems(items);
  };

  useEffect(() => {
    if (isLoading) setOpen(false);
  }, [isLoading]);

  return (
    <>
      <IconButton disabled={isLoading || disabled} onClick={handleClickOpen}>
        <SearchIcon />
      </IconButton>
      <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { maxWidth: 800 } }}>
        <DialogTitle>Выбрать билеты</DialogTitle>
        <DialogContent>
          <ProductsTable serviceId={serviceId} onSelect={handleSelectedItems} />
        </DialogContent>
        <Box sx={{ width: 1, display: "flex", flexDirection: "column" }}>
          {showWarningMessage && (
            <Box sx={{ width: "70%", mx: "auto", fontSize: 150 }}>
              <Alert severity="error">Один номер PNR должен быть связан только с одним номером заказа!</Alert>
            </Box>
          )}
          <Box>
            <DialogActions>
              <Button onClick={handleClose}>Отмена</Button>
              <Button onClick={handleSubmit}>Создать</Button>
            </DialogActions>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
