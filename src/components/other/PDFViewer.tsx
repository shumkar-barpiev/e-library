"use client";

import { FC } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { RenderDownloadProps, getFilePlugin } from "@react-pdf-viewer/get-file";
import { printPlugin, RenderPrintProps } from "@react-pdf-viewer/print";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/print/lib/styles/index.css";
import { Box, BoxProps, IconButton, Tooltip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";

type IPDFViewerProps = {
  fileUrl: string;
  fileName?: string;
  props?: {
    workerBox?: BoxProps;
  };
};

const PDFViewer: FC<IPDFViewerProps> = ({ fileUrl, fileName, props }) => {
  const getFilePluginInstance = getFilePlugin(
    fileName
      ? {
          fileNameGenerator: () => fileName,
        }
      : undefined
  );

  const { Download } = getFilePluginInstance;
  const printPluginInstance = printPlugin();
  const { Print } = printPluginInstance;

  return (
    <Box bgcolor="primary.main">
      <Box display="flex" alignItems="center" justifyContent="end" p={0.5}>
        <Download>
          {(props: RenderDownloadProps) => (
            <Tooltip title="Скачать" placement="bottom" arrow>
              <IconButton sx={{ width: "auto", color: "secondary.contrastText" }} onClick={props.onClick}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          )}
        </Download>
        <Print>
          {(props: RenderPrintProps) => (
            <Tooltip title="Распечатать" placement="bottom" arrow>
              <IconButton sx={{ width: "auto", color: "secondary.contrastText" }} onClick={props.onClick}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
          )}
        </Print>
      </Box>

      <Box overflow="hidden" p={0.5} {...(props?.workerBox || {})}>
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          <Viewer fileUrl={fileUrl} plugins={[getFilePluginInstance, printPluginInstance]} />
        </Worker>
      </Box>
    </Box>
  );
};

export default PDFViewer;
