"use client";

import {
  Box,
  Grid,
  Paper,
  Alert,
  Button,
  Tooltip,
  Accordion,
  TextField,
  Typography,
  AccordionSummary,
  AccordionDetails,
  styled,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import React, { useState, useEffect } from "react";
import WarningIcon from "@mui/icons-material/Warning";
import { useForm, Controller } from "react-hook-form";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ActsFormatDate } from "@/components/account/personal-area/_helpers";
import { useEmployeeAgreementsStore } from "@/stores/hr/employee-agreements/employee-agreements";

type PropsType = {
  closeModal: () => void;
  data: Record<string, any> | null;
  updateData: (step: string, data: Record<string, any>) => void;
};

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  ...theme.applyStyles("dark", {
    backgroundColor: "#1A2027",
  }),
}));

export default function ThirdStep({ closeModal, updateData, data }: PropsType) {
  const firstStepData = data?.firstStepData;
  const secondStepData = data?.secondStepData;
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm();
  const agreementStore = useEmployeeAgreementsStore();
  const [incompleteUsersId, setIncompleteUsersId] = useState<number[]>([]);
  const [template, setTemplate] = useState<Record<string, any> | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<Record<string, any>[]>(firstStepData?.selectedUsers ?? []);
  const [employeeForms, setEmployeeForms] = useState(
    selectedEmployees.reduce((acc, employee) => {
      acc[employee.id] = {
        endDate: "",
        startDate: "",
        id: employee?.partner?.id,
        signatureDate: "",
        payCompany: employee?.activeCompany?.id,
      };
      return acc;
    }, {})
  );

  const handleFormChange = (employeeId: any, fieldName: any, value: any) => {
    setEmployeeForms((prevState) => ({
      ...prevState,
      [employeeId]: {
        ...prevState[employeeId],
        [fieldName]: value,
      },
    }));
  };

  const onSubmit = () => {
    if (Boolean(employeeForms)) {
      const employeeFormArray = Object.values(employeeForms);
      const promises = employeeFormArray?.map((form: Record<string, any>) => {
        const requestBody = {
          data: {
            partner: {
              id: form.id,
            },
            template: {
              id: template?.id,
            },
            payCompany: {
              id: form.payCompany,
            },
            startDate: form.startDate,
            endDate: form.endDate,
            signatureDate: form.signatureDate,
          },
        };

        return agreementStore.createAgreement(requestBody, (data: Record<string, any>) => {});
      });

      Promise.all(promises)
        .then((results) => {
          closeModal();
          agreementStore.setReloadAgreementsTable(true);
          enqueueSnackbar("Договоры успешно созданы!", { variant: "success" });
        })
        .catch((error) => {
          enqueueSnackbar("Что то пошло не так", { variant: "error" });
        });
    }
  };

  useEffect(() => {
    let idsArr: number[] = [];
    selectedEmployees.some((employee) => {
      const isIncomplete =
        !employee["partner.passportNumber"] ||
        !employee["partner.issuingAuthority"] ||
        !employee["partner.dateOfIssue"] ||
        !employee?.partner?.mainAddress?.fullName;

      if (isIncomplete) idsArr.push(employee.id);
    });

    setIncompleteUsersId(idsArr);

    if (firstStepData?.stage === 0) {
      const requestBody = {
        fields: ["id", "name"],
        data: {
          _domain: "self.type =: type",
          _domainContext: {
            type: "ap",
          },
        },
      };

      agreementStore.fetchTemplate(requestBody, (data: Record<string, any>) => {
        if (data.status === 0) setTemplate(data.data[0]);
      });
    } else {
      //second step templates
    }
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {selectedEmployees?.length > 0 && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box>
            <Box
              sx={{
                display: "flex",
                overflowY: "auto",
                maxHeight: "335px",
                flexDirection: "column",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
            >
              {selectedEmployees.map((employee) => (
                <Accordion key={employee.id} defaultExpanded>
                  <AccordionSummary
                    sx={{
                      ...(incompleteUsersId.includes(employee.id)
                        ? {
                            backgroundColor: "#c17c84",
                            color: "white",
                            "&.Mui-expanded": {
                              color: "#c17c84",
                              backgroundColor: "#faf2f2",
                            },
                          }
                        : {
                            backgroundColor: "#408140",
                            color: "white",
                            "&.Mui-expanded": {
                              color: "white",
                              backgroundColor: "#5cb85c",
                            },
                          }),
                    }}
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel${employee.id}-content`}
                    id={`panel${employee.id}-header`}
                  >
                    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 3 }}>
                      <Box>
                        {incompleteUsersId.includes(employee.id) ? (
                          <Tooltip title="Неполные данные">
                            <WarningIcon />
                          </Tooltip>
                        ) : (
                          <CheckBoxIcon />
                        )}
                      </Box>

                      <Typography>{employee?.name}</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2} sx={{ my: 2 }}>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name={`startDate-${employee.id}`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              size="small"
                              label="Период с"
                              type="date"
                              required={true}
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              value={employeeForms[employee.id].startDate}
                              onChange={(e) => handleFormChange(employee.id, "startDate", e.target.value)}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name={`endDate-${employee.id}`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              type="date"
                              size="small"
                              required={true}
                              label="Период по"
                              InputLabelProps={{ shrink: true }}
                              value={employeeForms[employee.id].endDate}
                              onChange={(e) => handleFormChange(employee.id, "endDate", e.target.value)}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name={`signatureDate-${employee.id}`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              size="small"
                              type="date"
                              required={true}
                              label="Дата подписания"
                              InputLabelProps={{ shrink: true }}
                              value={employeeForms[employee.id].signatureDate}
                              onChange={(e) => handleFormChange(employee.id, "signatureDate", e.target.value)}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={2}>
                      <Grid item xs={7}>
                        <Item>
                          <Box sx={{ width: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                              Номер паспорта
                            </Typography>

                            {!!employee["partner.passportNumber"] ? (
                              <Typography variant="subtitle2">{employee["partner.passportNumber"]}</Typography>
                            ) : (
                              <Box sx={{ p: 1 }}>
                                <Alert
                                  severity="error"
                                  sx={{
                                    padding: "3px",
                                  }}
                                >
                                  Нет данных
                                </Alert>
                              </Box>
                            )}
                          </Box>
                        </Item>
                      </Grid>
                      <Grid item xs={5}>
                        <Item>
                          <Box sx={{ width: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                              Выдан
                            </Typography>

                            {!!employee["partner.issuingAuthority"] ? (
                              <Typography variant="subtitle2">{employee["partner.issuingAuthority"]}</Typography>
                            ) : (
                              <Box sx={{ p: 1 }}>
                                <Alert
                                  severity="error"
                                  sx={{
                                    padding: "3px",
                                  }}
                                >
                                  Нет данных
                                </Alert>
                              </Box>
                            )}
                          </Box>
                        </Item>
                      </Grid>
                      <Grid item xs={5}>
                        <Item>
                          <Box sx={{ width: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                              Дата выдачи
                            </Typography>

                            {!!employee["partner.dateOfIssue"] ? (
                              <Typography variant="subtitle2">
                                {ActsFormatDate(employee["partner.dateOfIssue"])}
                              </Typography>
                            ) : (
                              <Box sx={{ p: 1 }}>
                                <Alert
                                  severity="error"
                                  sx={{
                                    padding: "3px",
                                  }}
                                >
                                  Нет данных
                                </Alert>
                              </Box>
                            )}
                          </Box>
                        </Item>
                      </Grid>
                      <Grid item xs={7}>
                        <Item>
                          <Box sx={{ width: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                              Адрес
                            </Typography>

                            {!!employee?.partner?.mainAddress?.fullName ? (
                              <Typography variant="subtitle2">{employee?.partner?.mainAddress?.fullName}</Typography>
                            ) : (
                              <Box sx={{ p: 1 }}>
                                <Alert
                                  severity="error"
                                  sx={{
                                    padding: "3px",
                                  }}
                                >
                                  Нет данных
                                </Alert>
                              </Box>
                            )}
                          </Box>
                        </Item>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "right" }}>
              <Button
                type="submit"
                variant="contained"
                disabled={incompleteUsersId?.length > 0}
                sx={{
                  mt: 2,
                  p: 1,
                  backgroundColor: "#5F8CCC",
                  "&:hover": {
                    backgroundColor: "#497ec9",
                  },
                }}
              >
                Подтвердить и Создать
              </Button>
            </Box>
          </Box>
        </form>
      )}
    </Box>
  );
}
