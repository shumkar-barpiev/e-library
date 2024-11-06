"use client";

import { enqueueSnackbar } from "notistack";
import { TUserModel } from "@/models/user/user";
import React, { useState, useEffect, useContext } from "react";
import { useMetaFileStore } from "@/stores/metafile/metafile";
import { useUserActsStore } from "@/stores/personal-area/acts/acts";
import { ActsFormatDate } from "@/components/account/personal-area/_helpers";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { ACTS_LIMIT } from "@/components/account/personal-area/finance/ActsDone/ActsDoneInit";
import { Button, Tooltip, Typography, IconButton, CircularProgress, styled } from "@mui/material";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";

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

type PropsType = {
  showOnlyDownload: boolean;
  act: Record<string, any> | null;
};

interface AssetsBodyType {
  id: number;
}
interface AssetsAttachmentType {
  document: AssetsBodyType[];
}

const ActDetailsSave = ({ act, showOnlyDownload }: PropsType) => {
  const actStore = useUserActsStore();
  const metafileStore = useMetaFileStore();
  const doesExistPDFFile = () => act?.document?.length > 0;
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const currentUserContext = useContext(CurrentUserContext);
  const [generatePdf, setGeneratePdf] = useState<boolean>(false);
  const [loadingPdfFile, setLoadingPdfFile] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<TUserModel | null>(null);
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);

  const doesExistFile = doesExistPDFFile();
  const [blinkTheInvoiceFormButton, setBlinkTheInvoiceFormButton] = useState<boolean>(!doesExistFile);

  const handleDownload = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setLoadingPdfFile(true);
    metafileStore.getFile(act?.document?.[0]?.id).then((resp: any) => {
      const url = URL.createObjectURL(resp);
      setPdfUrl(url);
      setLoadingPdfFile(false);
    });
  };

  useEffect(() => {
    if (generatePdf) generatePdfFile();
  }, [generatePdf]);

  useEffect(() => {
    const anchor = document.getElementById(`download-act-${act?.id}`);
    if (anchor) anchor.click();
  }, [pdfUrl]);

  useEffect(() => {
    if (currentUserContext?.currentUser) setCurrentUser(currentUserContext?.currentUser);
    if (currentUserContext?.userRoles) setCurrentUserRoles(currentUserContext?.userRoles);
  }, [currentUserContext]);

  const generatePdfFile = async () => {
    const html2PDF = (await import("jspdf-html2canvas")).default;
    const input = document.getElementById(`act-pdf-container-${act?.id}`);

    if (input && html2PDF) {
      let documentReqBody: AssetsAttachmentType = {
        document: [],
      };
      const pdfName = `Акт_${act?.organization?.name}_по_${ActsFormatDate(act?.startDate)}_${ActsFormatDate(act?.endDate)}.pdf`;

      const uploadFile = (file: File, type: "attachment") => {
        const request = {
          data: {
            fileName: file?.name,
          },
        };

        return metafileStore.saveFile(file, request).then((resp) => {
          if (resp?.status === 0) {
            const reqBody = { id: resp?.data?.[0]?.id };
            if (type === "attachment") {
              documentReqBody.document = [...documentReqBody.document, { ...reqBody }];
            }
          }
        });
      };

      await html2PDF(input, {
        autoResize: true,
        imageType: "image/png",
        jsPDF: { orientation: "landscape" },
        margin: { right: 4, left: 4, top: 10, bottom: 4 },
        html2canvas: { scale: 1.3, logging: true, useCORS: false },
        output: pdfName,
        success: (pdf) => {
          const pdfBlob = pdf.output("blob");
          const pdfFile = new File([pdfBlob], pdfName || "document.pdf", { type: "application/pdf" });
          const promises: Promise<void>[] = [];

          promises.push(uploadFile(pdfFile, "attachment"));
          Promise.all(promises)
            .then(() => {
              if (documentReqBody.document.length > 0) {
                const requestBody = {
                  data: {
                    id: act?.id,
                    ...(documentReqBody.document.length > 0 ? { ...documentReqBody } : {}),
                  },
                };

                actStore.updateAct(requestBody, (data: Record<string, any>) => {
                  if (data.status == 0) {
                    enqueueSnackbar("PDF успешно создан!", { variant: "success" });
                    let criteria = [];
                    criteria.push({
                      fieldName: "status",
                      operator: "=",
                      value: "done",
                    });

                    if (currentUserRoles?.isSubagent) {
                      criteria.push({
                        fieldName: "organization.id",
                        operator: "=",
                        value: `${currentUser?.organization?.id}`,
                      });
                    }

                    if (currentUserRoles?.isAccountant) {
                      criteria.push({
                        fieldName: "accountant.id",
                        operator: "=",
                        value: `${currentUser?.id}`,
                      });
                    }

                    const reqBody = {
                      offset: 0,
                      limit: ACTS_LIMIT,
                      sortBy: ["-createdOn"],
                      data: {
                        criteria: [
                          {
                            operator: "and",
                            criteria: criteria,
                          },
                        ],
                      },
                    };

                    actStore.fetchActs(reqBody, "done");
                  } else {
                    enqueueSnackbar("Что то пошло не так при создании pdf файла.", { variant: "error" });
                  }
                });
              }
            })
            .catch((error) => {
              console.error("Error in uploading files", error);
            })
            .finally(() => setGeneratePdf(false));
        },
      });
    }
  };

  return (
    <>
      {showOnlyDownload && (
        <>
          {loadingPdfFile ? (
            <IconButton size="small" disabled={true}>
              <CircularProgress color="inherit" size={15} />
            </IconButton>
          ) : (
            <IconButton
              disabled={!doesExistFile}
              size="small"
              sx={{
                backgroundColor: "white",
                color: "#5F8CCC",
                "&:hover": {
                  backgroundColor: "#5F8CCC",
                  color: "white",
                },
              }}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => handleDownload(event)}
            >
              <Tooltip title="Скачать PDF">
                <FileDownloadOutlinedIcon fontSize="medium" />
              </Tooltip>
            </IconButton>
          )}

          {pdfUrl && (
            <a
              id={`download-act-${act?.id}`}
              style={{ display: "none" }}
              href={pdfUrl}
              rel="noopener noreferrer"
              download={act?.document?.[0].fileName}
            >
              {act?.document?.[0].fileName}
            </a>
          )}
        </>
      )}

      {!showOnlyDownload && !doesExistFile && (
        <Button
          size="small"
          color="primary"
          variant="contained"
          sx={{
            p: 0.6,
            backgroundColor: "#5F8CCC",
            "&:hover": {
              backgroundColor: "#497ec9",
            },
          }}
          onClick={() => setGeneratePdf(true)}
        >
          <Blink variant="inherit" blink={blinkTheInvoiceFormButton.toString()}>
            Создать PDF-файл
          </Blink>
        </Button>
      )}
    </>
  );
};

export default ActDetailsSave;
