"use client";

import React from "react";
import { enqueueSnackbar } from "notistack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Box, IconButton, Tooltip, Typography, styled } from "@mui/material";
import { useEmployeeAgreementsStore } from "@/stores/hr/employee-agreements/employee-agreements";

type PropsType = {
  agreement: Record<string, any> | null;
};

interface BlinkProps {
  blink: string;
}

const Blink = styled(Typography)<BlinkProps>(({ blink }) => ({
  "@keyframes blink": {
    "0%": { opacity: 1 },
    "50%": { opacity: 0 },
    "100%": { opacity: 1 },
  },
  animation: blink == "true" ? "blink 1s infinite" : "none",
}));

const EmployeeAgreementGenerateDocument = ({ agreement }: PropsType) => {
  const agreementStore = useEmployeeAgreementsStore();

  const generatePdf = () => {
    if (!!agreement?.template?.id && !!agreement?.id) {
      const params = {
        agreementId: agreement.id,
        templateId: agreement.template.id,
      };

      agreementStore.generateDocument(params, (data: Record<string, any>) => {
        if (data.codeStatus === 200) {
          agreementStore.setReloadAgreementsTable(true);
          enqueueSnackbar("PDF-файл успешно создан!", { variant: "success" });
        } else {
          enqueueSnackbar("Во время генерации PDF-файла что-то пошло не так!", { variant: "error" });
        }
      });
    }
  };

  return (
    <Box>
      <Blink variant="inherit" blink={`${!agreement?.dmsFile}`.toString()}>
        <IconButton
          size="small"
          onClick={generatePdf}
          style={{ visibility: !agreement?.dmsFile ? "visible" : "hidden" }}
          sx={{
            backgroundColor: "#5F8CCC",
            color: "white",
            "&:hover": {
              backgroundColor: "#5F8CCC",
              color: "white",
            },
          }}
        >
          <Tooltip title="Создать PDF-файл">
            <CloudUploadIcon fontSize="small" />
          </Tooltip>
        </IconButton>
      </Blink>
    </Box>
  );
};

export default EmployeeAgreementGenerateDocument;
