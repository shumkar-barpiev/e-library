"use client";

import {
  Box,
  Step,
  Modal,
  Button,
  Dialog,
  Stepper,
  Tooltip,
  StepLabel,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import React, { useState } from "react";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { ModalStyle } from "@/components/account/personal-area/profile/Profile";
import FirstStep from "@/components/employee_agreements/create_agreement_steps/FirstStep";
import SecondStep from "@/components/employee_agreements/create_agreement_steps/SecondStep";
import ThirdStep from "@/components/employee_agreements/create_agreement_steps/ThirdStep";

const STEPS = ["Выбрать сотрудника", "Вид договора", "Проверка данных"];

interface FormData {
  firstStepData: Record<string, any>;
  secondStepData: Record<string, any>;
}

const initialFormState = {
  firstStepData: {},
  secondStepData: {},
};

export default function CreateAgreement() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [disabledNextBtn, setDisabledNextBtn] = useState<boolean>(true);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    if (showWarning) {
      setOpenDialog(true);
    } else {
      setOpenModal(false);
      setActiveStep(0);
      setFormData(initialFormState);
    }
  };

  const terminatingSteps = () => {
    setOpenModal(false);
    setActiveStep(0);
    setFormData(initialFormState);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenModal(false);
    setActiveStep(0);
    setFormData(initialFormState);
  };

  const handleNext = () => {
    if (STEPS.length > activeStep) {
      const firstStepData = formData.firstStepData;

      if (firstStepData.stage === 0) {
        setActiveStep((prevActiveStep) => prevActiveStep + 2);
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (STEPS.length > activeStep) {
      const firstStepData = formData.firstStepData;

      if (firstStepData.stage === 0) {
        setActiveStep((prevActiveStep) => prevActiveStep - 2);
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
      }
    }
  };

  const updateFormData = (step: string, data: any) => {
    if (step in formData) {
      setFormData((prevData) => ({
        ...prevData,
        [step as keyof FormData]: { ...prevData[step as keyof FormData], ...data },
      }));
    }
  };

  const updateVisibilityOfWarning = (value: boolean) => {
    setShowWarning(value);
  };

  const renderContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <FirstStep
            updateData={updateFormData}
            data={formData}
            toggleNextBtn={setDisabledNextBtn}
            updateVisibilityWarning={updateVisibilityOfWarning}
          />
        );
      case 1:
        return <SecondStep updateData={updateFormData} data={formData} />;
      case 2:
        return <ThirdStep updateData={updateFormData} data={formData} closeModal={terminatingSteps} />;
      default:
        return "Invalid Step";
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "end", width: 1 }}>
        <IconButton
          onClick={handleOpenModal}
          sx={{
            backgroundColor: "#5F8CCC",
            color: "white",
            "&:hover": {
              backgroundColor: "#5F8CCC",
              color: "white",
            },
          }}
        >
          <Tooltip title="Создать новый договор">
            <PostAddIcon />
          </Tooltip>
        </IconButton>
      </Box>
      <Modal
        open={openModal}
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
          <Stepper activeStep={activeStep}>
            {STEPS.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {renderContent()}
          <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 2 }}>
            <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
              Назад
            </Button>
            {!(activeStep === STEPS.length - 1) && (
              <Button disabled={disabledNextBtn} onClick={handleNext}>
                Следующий
              </Button>
            )}
          </Box>
        </Box>
      </Modal>

      <Dialog open={openDialog} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{"Закрыть форму"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Вы точно хотите закрыть модальное окно? Если вы закроете модальное окно, форма будет очищена.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleCloseDialog} autoFocus>
            Закрыть
          </Button>
          <Button color="success" onClick={() => setOpenDialog(false)}>
            Отмена
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
