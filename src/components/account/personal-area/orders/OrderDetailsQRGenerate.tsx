import Image from "next/image";
import { useState } from "react";
import {
  Button,
  Modal,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Avatar,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { SelectChangeEvent } from "@mui/material/Select";

export const GenerateButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      variant="contained"
      sx={{ backgroundColor: "#5F8CCC", "&:hover": { backgroundColor: "#4a6b9c" } }}
      onClick={onClick}
      fullWidth
    >
      Сгенерировать QR код
    </Button>
  );
};

const banks = [
  {
    id: 1,
    name: "Мбанк",
    value: "MBank",
    logo: `${process.env.NODE_ENV === "production" ? "/foms/front/" : "/"}assets/mbank.png`,
  },
  {
    id: 2,
    name: "Демир банк",
    value: "Demir",
    logo: `${process.env.NODE_ENV === "production" ? "/foms/front/" : "/"}assets/demir.jpg`,
  },
];

export const GenerateAndQRCodeModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [step, setStep] = useState<"selectBank" | "showQRCode">("selectBank");
  const [selectedBank, setSelectedBank] = useState<string>("MBank");
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const mbankQRcodeImagePath = `${process.env.NODE_ENV === "production" ? "/foms/front/" : "/"}assets/qr_mbank.jpeg`;

  const handleBankChange = (event: SelectChangeEvent<string>) => {
    const newBank = event.target.value;
    setSelectedBank(newBank);
    if (newBank !== "MBank") {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  };

  const handleGenerateClick = () => {
    if (selectedBank !== "MBank") {
      return;
    }
    setStep("showQRCode");
  };

  const handleQRCodeClose = () => {
    setStep("selectBank");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setStep("selectBank");
        onClose();
      }}
      aria-labelledby="modal-title"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
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
        <IconButton
          onClick={() => {
            setStep("selectBank");
            onClose();
          }}
          sx={{ position: "absolute", top: 10, right: 10 }}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>

        {step === "selectBank" ? (
          <>
            <Typography id="modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
              Генерация QR кода
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography id="modal-description" sx={{ mb: 2 }}>
              Пожалуйста, выберите банк для генерации QR кода.
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="select-bank-label">Выберите банк</InputLabel>
              <Select
                labelId="select-bank-label"
                id="select-bank"
                value={selectedBank}
                label="Выберите банк"
                onChange={handleBankChange}
                sx={{ mb: 2 }}
              >
                {banks.map((bank) => (
                  <MenuItem key={bank.id} value={bank.value}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar src={bank.logo} sx={{ width: 24, height: 24 }} />
                      <Typography>{bank.name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {showWarning && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <span>Выбранный банк в данный момент не поддерживается. Вы можете выбрать только Мбанк.</span>
              </Alert>
            )}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button
                onClick={handleGenerateClick}
                variant="contained"
                sx={{ backgroundColor: "#5F8CCC", "&:hover": { backgroundColor: "#4a6b9c" } }}
                disabled={selectedBank !== "MBank"}
              >
                Сгенерировать
              </Button>
              <Button onClick={onClose} variant="outlined" color="secondary">
                Закрыть
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography id="qr-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
              Ваш QR код
            </Typography>
            <img src={mbankQRcodeImagePath} alt="QR Code" style={{ maxWidth: "100%", height: "auto" }} />
            <Button onClick={handleQRCodeClose} sx={{ mt: 2 }} variant="outlined" color="secondary">
              Закрыть
            </Button>
          </>
        )}
      </Box>
    </Modal>
  );
};
