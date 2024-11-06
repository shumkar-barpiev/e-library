"use client";

import { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Link,
  Modal,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import { useCurrenciesStore } from "@/stores/dictionaries/currencies";
import { useLanguagesStore } from "@/stores/dictionaries/languages";
import { debounce } from "@/utils/utils";
import { CurrencyModel } from "@/models/dictionaries/currency";
import { useOrderDetailsInvoiceStore } from "@/stores/orders/order-details-invoice";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Infer } from "next/dist/compiled/superstruct";
import { LanguageModel } from "@/models/dictionaries/language";
import { enqueueSnackbar } from "notistack";
import { TOrderModel } from "@/models/orders/order";
import { useAxelorStore } from "@/stores/axelor/axelor";
import { useCompaniesStore } from "@/stores/dictionaries/companies";
import { CompanyModel } from "@/models/dictionaries/company";
import { useOrderStore } from "@/stores/orders/orders";
import PDFViewer from "@/components/other/PDFViewer";
import { TemplateType, useTemplateStore } from "@/stores/dictionaries/template";

interface PdfData {
  fileUrl: string | null;
  editUrl: string | null;
  fileName: string | null;
}

const schema = z.object({
  currency: CurrencyModel,
  language: LanguageModel,
  company: CompanyModel,
});

type FormScheme = Infer<typeof schema>;

export default function OrderDetailsInvoice() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>();
  const open = Boolean(anchorEl);
  const id = open ? "order-details-invoice-popover" : undefined;

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        aria-describedby={id}
        variant="outlined"
        color="secondary"
        size="small"
        sx={{ py: 0.4 }}
        endIcon={<ArrowDropDownIcon />}
        onClick={handleClick}
      >
        Выставить счет
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <PopoverContent />
      </Popover>
    </>
  );
}

function PopoverContent() {
  const axelorStore = useAxelorStore();

  const pdfModalContentStyle = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "50%",
    height: "95%",
    bgcolor: "background.paper",
    borderRadius: 1,
    boxShadow: 24,
    p: 4,
    overflow: "auto",
  };

  const { control, handleSubmit } = useForm<FormScheme>({
    reValidateMode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: {
      currency: axelorStore.config?.defaultCurrencySaleOrderLine,
      language: axelorStore.config?.defaultLanguageSaleOrderLine,
      company: null,
    },
  });

  const useCompanyStore = useCompaniesStore((state) => state);
  const useCurrencyStore = useCurrenciesStore((state) => state);
  const useTemplate = useTemplateStore((state) => state);
  const useLanguageStore = useLanguagesStore((state) => state);
  const useInvoiceStore = useOrderDetailsInvoiceStore((state) => state);
  const orderStore = useOrderStore();

  const [currency, setCurrency] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [orderId, setOrderId] = useState<TOrderModel["id"]>();
  const [openPdfModal, setOpenPdfModal] = useState(false);
  const [pdf, setPdf] = useState<PdfData>({ fileUrl: null, editUrl: null, fileName: null });
  const [templatePdf, setTemplatePdf] = useState<TemplateType | null>(null);

  const debouncedSetCurrency = debounce(setCurrency, 500);
  const debouncedSetLanguage = debounce(setLanguage, 500);
  const debouncedSetCompany = debounce(setCompany, 500);

  const convertBase64ToUrl = async (base64: string) => {
    const response = await fetch(`data:application/pdf;base64,${base64}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    return url;
  };

  const handleTogglePdfModal = () => setOpenPdfModal(!openPdfModal);

  const handleOpenPdfModal = async () => {
    try {
      if (!orderId) {
        enqueueSnackbar("Что-то пошло не так", { variant: "error" });
        return;
      }

      const res = await useInvoiceStore.fetchPdf({ saleOrderId: orderId });
      if (!res?.data?.document) {
        enqueueSnackbar("Что-то пошло не так", { variant: "error" });
        return;
      }

      const pdfUrl = await convertBase64ToUrl(res.data.document);
      const { fileName, editUrl } = res?.data?.data;
      setPdf({ fileUrl: pdfUrl, editUrl, fileName });
      handleTogglePdfModal();
    } catch (error) {
      enqueueSnackbar("Что-то пошло не так", { variant: "error" });
    }
  };

  const handleOpenPdfModal2 = async () => {
    try {
      if (!orderId) {
        enqueueSnackbar("Что-то пошло не так", { variant: "error" });
        return;
      }
      if (!templatePdf) {
        enqueueSnackbar("Выберите шаблон!", { variant: "error" });
        return;
      }
      let responseDocument = await useTemplate.getDocument(templatePdf.id, orderId);
      if (responseDocument) {
        let pdf = await convertBase64ToUrl(responseDocument?.document || "");
        setPdf({ fileUrl: pdf, editUrl: "", fileName: "" });
        handleTogglePdfModal();
      }
    } catch (error) {
      enqueueSnackbar("Что-то пошло не так", { variant: "error" });
    }
  };

  const handleSignPdf = async () => {
    if (pdf?.fileName) {
      const res = await useInvoiceStore.signPdf({ fileName: pdf?.fileName });
      if (!res) {
        enqueueSnackbar("Что то пошло не так", { variant: "error" });
        return;
      }

      const pdfUrl = await convertBase64ToUrl(res?.data?.document || "");
      const pdfName = res?.data?.data?.fileName || null;
      const pdfEditUrl = res?.data?.data?.editUrl || null;
      setPdf({ fileUrl: pdfUrl, editUrl: pdfEditUrl, fileName: pdfName });
    }
  };

  // useEffect(() => {
  //   useCurrencyStore.fetchItems({
  //     criteria: [
  //       {
  //         operator: "and",
  //         criteria: [
  //           {
  //             fieldName: "isBase",
  //             operator: "=",
  //             value: true,
  //           },
  //           {
  //             operator: "or",
  //             criteria: [
  //               {
  //                 fieldName: "code",
  //                 operator: "like",
  //                 value: currency,
  //               },
  //               {
  //                 fieldName: "name",
  //                 operator: "like",
  //                 value: currency,
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //     ],
  //   });
  // }, [currency]);

  useEffect(() => {
    if (orderId) {
      console.log("ok");
      useTemplate.getTemplate(orderId);
    }
  }, [orderId]);

  useEffect(() => {
    useLanguageStore.fetchItems({
      criteria: [],
    });
  }, [language]);

  useEffect(() => {
    useCompanyStore.fetchItems({
      criteria: [
        {
          operator: "or",
          criteria: [
            {
              fieldName: "code",
              operator: "like",
              value: company,
            },
            {
              fieldName: "name",
              operator: "like",
              value: company,
            },
          ],
        },
      ],
    });
  }, [company]);

  useEffect(() => {
    console.log(templatePdf);
  }, [templatePdf]);

  useEffect(() => {
    if (orderId) return;
    setOrderId(orderStore?.item?.id);
  }, [orderStore.item]);

  return (
    <form onSubmit={handleSubmit(handleSignPdf)}>
      <Box
        sx={{
          width: 250,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          p: 1.5,
        }}
      >
        <Controller
          name="currency"
          control={control}
          render={({ field: { ref, ...field } }) => (
            <Autocomplete
              size="small"
              // value={field.value}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, value) => setTemplatePdf(value)}
              filterOptions={(options) => options}
              getOptionLabel={(option) => `${option.id} ${option.name}`}
              noOptionsText="Нет данных"
              loadingText="Загрузка..."
              options={useTemplate.templates ?? []}
              loading={useTemplate.loading}
              onInputChange={(e, value) => debouncedSetCurrency(value)}
              renderInput={(params) => <TextField {...params} label="Шаблоны" value={templatePdf} />}
            />
          )}
        />

        {/* <Controller
          name="language"
          control={control}
          render={({ field: { ...field } }) => (
            <Autocomplete
              size="small"
              value={field.value}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, value) => field.onChange(value)}
              filterOptions={(options) => options}
              getOptionLabel={(option) => `${option.code} - ${option["$t:name"] ?? option.name}`}
              noOptionsText="Нет данных"
              loadingText="Загрузка..."
              options={useLanguageStore.items ?? []}
              loading={useLanguageStore.loading}
              onInputChange={(e, value) => debouncedSetLanguage(value)}
              renderInput={(params) => <TextField {...params} label="Язык" value={language} />}
            />
          )}
        /> */}
        {/* 
        <Controller
          name="company"
          control={control}
          render={({ field: { ...field } }) => (
            <Autocomplete
              size="small"
              value={field.value}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, value) => field.onChange(value)}
              filterOptions={(options) => options}
              getOptionLabel={(option) => `${option.code} - ${option["$t:name"] ?? option.name}`}
              noOptionsText="Нет данных"
              loadingText="Загрузка..."
              options={useCompanyStore.items ?? []}
              loading={useCompanyStore.loading}
              onInputChange={(e, value) => debouncedSetCompany(value)}
              renderInput={(params) => <TextField {...params} label="ОсОО" value={company} />}
            />
          )}
        /> */}

        <Modal open={openPdfModal} onClose={handleTogglePdfModal}>
          <Box sx={pdfModalContentStyle}>
            <IconButton sx={{ position: "absolute", top: 0, right: 0 }} onClick={handleTogglePdfModal}>
              <CloseIcon />
            </IconButton>
            {pdf?.fileUrl ? <PDFViewer fileUrl={pdf?.fileUrl} /> : <Typography>Ошибка открытия файла</Typography>}
            {pdf?.editUrl && (
              <Box
                width="fit-content"
                position="sticky"
                mt="10px"
                bottom="5px"
                display="flex"
                gap="20px"
                flexDirection={{ xs: "column", md: "row" }}
                flexWrap="wrap"
              >
                <Button
                  variant="contained"
                  startIcon={
                    useInvoiceStore.loading ? (
                      <Box sx={{ height: 20, ml: 0.4, position: "relative", display: "flex", alignItems: "center" }}>
                        <CircularProgress size={15} sx={{ color: "white" }} />
                      </Box>
                    ) : (
                      <TaskAltIcon />
                    )
                  }
                  sx={{ flexGrow: "1", height: "100%" }}
                  onClick={handleSignPdf}
                  type="submit"
                >
                  Подписать
                </Button>
                <Link href={pdf?.editUrl} target="_blank">
                  <Button startIcon={<EditIcon />} variant="contained" sx={{ flexGrow: "1", height: "100%" }}>
                    Редактировать
                  </Button>
                </Link>
              </Box>
            )}
          </Box>
        </Modal>

        <Button
          size="small"
          variant="contained"
          onClick={handleOpenPdfModal2}
          endIcon={
            useTemplate.loading ? (
              <Box sx={{ height: 20, ml: 0.4, position: "relative", display: "flex", alignItems: "center" }}>
                <CircularProgress size={15} sx={{ color: "white" }} />
              </Box>
            ) : (
              <InsertDriveFileIcon />
            )
          }
        >
          Открыть PDF
        </Button>
      </Box>
    </form>
  );
}
