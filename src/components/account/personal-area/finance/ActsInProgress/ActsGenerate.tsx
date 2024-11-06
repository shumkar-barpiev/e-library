"use client";

import "dayjs/locale/ru";
import dayjs from "dayjs";
import * as yup from "yup";
import { enqueueSnackbar } from "notistack";
import { TUserModel } from "@/models/user/user";
import { ruRU } from "@mui/x-date-pickers/locales";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import React, { useState, useEffect, useContext } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useSettingsStore } from "@/stores/dictionaries/settings";
import { useUserActsStore } from "@/stores/personal-area/acts/acts";
import { Box, TextField, Button, Autocomplete, Card, ListItem } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ActsContext } from "@/components/account/personal-area/finance/ActsInProgress/ActsInProgressProvider";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";

const ActsGenerate = () => {
  const actStore = useUserActsStore();
  const actsContext = useContext(ActsContext);
  const currentUserContext = useContext(CurrentUserContext);
  const settings = useSettingsStore((state) => state.getItems());
  const [currentUser, setCurrentUser] = useState<TUserModel | null>(null);
  const [clientTypes, setClientTypes] = useState<Record<string, any>[]>([]);
  const [accountants, setAccountants] = useState<Record<string, any>[]>([]);
  const [doNotTouchStartDate, setDoNotTouchStartDate] = useState<boolean>(false);
  const [organizations, setOrganizations] = useState<Record<string, any>[]>([]);
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);
  const ruLocale = ruRU.components.MuiLocalizationProvider.defaultProps.localeText;

  const schema = yup.object().shape({
    startDate: yup.date().nullable().required("Необходимо указать дату начала."),
    endDate: yup
      .date()
      .nullable()
      .required("Необходимо указать дату окончания")
      .min(yup.ref("startDate"), "Дата окончания должна быть позже даты начала."),
    clientType: yup
      .string()
      .nullable()
      .when("isAccountant", {
        is: () => currentUserRoles?.isAdmin || currentUserRoles?.isAccountant || currentUserRoles?.isChiefAccountant,
        then: (schema) => schema.required("Тип клиента обязательна"),
        otherwise: (schema) => schema.nullable(),
      }),
    organizationId: yup
      .number()
      .nullable()
      .when("isAccountant", {
        is: () => currentUserRoles?.isAdmin || currentUserRoles?.isAccountant || currentUserRoles?.isChiefAccountant,
        then: (schema) => schema.required("Организация обязательна").integer(),
        otherwise: (schema) => schema.nullable(),
      }),
    accountantId: yup
      .number()
      .nullable()
      .when("isSubagent", {
        is: () => !(currentUserRoles?.isAdmin || currentUserRoles?.isAccountant || currentUserRoles?.isChiefAccountant),
        then: (schema) => schema.required("Бухгалтер обязательна").integer(),
        otherwise: (schema) => schema.nullable(),
      }),
  });

  const {
    control,
    setValue,
    handleSubmit: handleGenerateSubmission,
    watch,
    formState: { errors },
    resetField,
    reset,
  } = useForm({
    defaultValues: {
      startDate: undefined,
      endDate: undefined,
      organizationId: undefined,
      accountantId: undefined,
      clientType: "",
    },
    resolver: yupResolver(schema),
  });

  const createActCallback = (data: Record<string, any>) => {
    if (data.status === 0) {
      reset();
      setOrganizations([]);
      actsContext?.reloadActs();
      if (currentUserContext?.reloadActsCounter && currentUser?.id)
        currentUserContext?.reloadActsCounter(currentUser?.id);
      enqueueSnackbar("Акт был успешно создан", { variant: "success" });
    } else {
      enqueueSnackbar("Что-то пошло не так во время создания акта", { variant: "error" });
    }
  };

  const onSubmit = (data: any) => {
    const formattedStartDate = dayjs(data.startDate).format("YYYY-MM-DD");
    const formattedEndDate = dayjs(data.endDate).format("YYYY-MM-DD");

    if (settings && settings[0]?.defaultAccountant) {
      const requestBody = {
        data: {
          startDate: `${formattedStartDate}`,
          endDate: `${formattedEndDate}`,
          ...(currentUserRoles?.isSubagent
            ? { organizationId: currentUser?.organization?.id }
            : { organizationId: data.organizationId }),
          chiefAccountantId: settings[0]?.defaultAccountant?.id,
          ...(currentUserRoles?.isSubagent ? { accountantId: data.accountantId } : {}),
          ...(currentUserRoles?.isAccountant ? { accountantId: currentUser?.id } : {}),
          ...(currentUserRoles?.isAdmin || currentUserRoles?.isChiefAccountant
            ? { accountantId: settings[0]?.defaultAccountant?.id }
            : {}),
        },
      };

      actStore.createAct(requestBody, createActCallback);
    } else {
      enqueueSnackbar("Нет бухгалтера, пожалуйста, назначьте главного бухгалтера", { variant: "error" });
    }
  };

  const handleGenerateFormSubmission = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    handleGenerateSubmission(onSubmit)();
  };

  const disableStartDate = () => {
    if (currentUserRoles?.isAccountant || currentUserRoles?.isChiefAccountant) {
      return organizations?.length === 0 || doNotTouchStartDate;
    } else if (currentUserRoles?.isSubagent) {
      return doNotTouchStartDate;
    }

    return false;
  };

  const disableEndDate = () => {
    if (currentUserRoles?.isAccountant || currentUserRoles?.isChiefAccountant) {
      return organizations?.length === 0;
    }

    return false;
  };

  const disableGenerateButton = () => {
    if (currentUserRoles?.isSubagent || currentUserRoles?.isAccountant || currentUserRoles?.isChiefAccountant) {
      return false;
    }

    return true;
  };

  const setDefaultStartDate = (id: number) => {
    actStore.getStartDateOfAct(id, (data: Record<string, any>) => {
      if (data.status === 0) {
        setDoNotTouchStartDate(true);
        const dayjsDate = dayjs(data?.data?.date);
        if (dayjsDate.isValid()) setValue("startDate", dayjsDate.toDate());
      }
    });
  };

  useEffect(() => {
    if (currentUserRoles?.isSubagent) setDefaultStartDate(currentUser?.organization?.id);
  }, [currentUser]);

  useEffect(() => {
    if (currentUserContext?.currentUser) setCurrentUser(currentUserContext?.currentUser);
    if (currentUserContext?.userRoles) setCurrentUserRoles(currentUserContext?.userRoles);

    actStore.fetchClientTypes((data: Record<string, any>) => {
      if (data.status === 0) setClientTypes(data.data);
      else enqueueSnackbar("Что-то пошло не так", { variant: "error" });
    });
    actStore.fetchAccountants((data: Record<string, any>) => {
      if (data.status === 0) setAccountants(data.data);
    });
  }, [currentUserContext]);

  return (
    <Card sx={{ p: 2, mb: 3 }}>
      <form onSubmit={handleGenerateFormSubmission}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru" localeText={ruLocale}>
          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
              {currentUserRoles?.isAdmin || currentUserRoles?.isAccountant || currentUserRoles?.isChiefAccountant ? (
                <>
                  <Controller
                    name="clientType"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        size="small"
                        options={clientTypes}
                        disabled={clientTypes.length === 0 || currentUserRoles.isAdmin}
                        getOptionLabel={(option: any) => option?.title_ru ?? ""}
                        noOptionsText="Нет данных"
                        onChange={(e, item) => {
                          field.onChange(item?.value ?? undefined);
                          if (!item?.value) reset();
                          if (item?.value) {
                            let primaryCriteria: Record<string, any>[] = [];

                            currentUser?.partner?.departments?.map((dp: Record<string, any>) => {
                              const criteria = {
                                operator: "and",
                                criteria: [
                                  {
                                    fieldName: "department.code",
                                    operator: "=",
                                    value: `${dp?.code}`,
                                  },
                                  {
                                    fieldName: "clientType",
                                    operator: "=",
                                    value: `${item.value}`,
                                  },
                                ],
                              };

                              primaryCriteria.push(criteria);
                            });

                            const requestBody = {
                              sortBy: ["-createdOn"],
                              data: {
                                criteria: [
                                  {
                                    operator: "or",
                                    criteria: primaryCriteria,
                                  },
                                ],
                              },
                            };

                            actStore.fetchClientGroups(requestBody, (data: Record<string, any>) => {
                              if (!!data.data) setOrganizations(data.data[0].clients);
                            });
                          } else {
                            setOrganizations([]);
                          }
                        }}
                        value={clientTypes.find((item: any) => item.value === field.value) ?? null}
                        renderOption={(props, option) => (
                          <li {...props} key={option.order_seq}>
                            {option.title_ru}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label="Выберите тип клиента"
                            error={!!errors.clientType}
                            helperText={errors.clientType?.message}
                            sx={{ minWidth: 170 }}
                          />
                        )}
                      />
                    )}
                  />

                  <Controller
                    name="organizationId"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        size="small"
                        options={organizations}
                        disabled={organizations?.length === 0}
                        getOptionLabel={(option: any) => option?.name ?? ""}
                        noOptionsText="Нет данных"
                        onChange={(e, value) => {
                          field.onChange(value?.id ?? undefined);
                          if (value?.id) setDefaultStartDate(value?.id);
                          else {
                            resetField("startDate");
                            setDoNotTouchStartDate(false);
                          }
                        }}
                        value={organizations?.find((item: any) => item.id === field.value) ?? null}
                        renderOption={(props, option) => (
                          <li {...props} key={option.id}>
                            {option.name}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label="Выберите организации"
                            error={!!errors.organizationId}
                            helperText={errors.organizationId?.message}
                            sx={{ minWidth: 170 }}
                          />
                        )}
                      />
                    )}
                  />
                </>
              ) : (
                <Controller
                  name="accountantId"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      size="small"
                      options={accountants}
                      disabled={accountants?.length === 0}
                      getOptionLabel={(option: any) => option?.name ?? ""}
                      noOptionsText="Нет данных"
                      onChange={(e, value) => field.onChange(value?.id ?? undefined)}
                      value={accountants?.find((item: any) => item.id === field.value) ?? null}
                      renderOption={(props, option) => (
                        <ListItem {...props} key={option.id} sx={{ whiteSpace: "nowrap" }}>
                          {option.name}
                        </ListItem>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          label="Выберите бухгалтер"
                          error={!!errors.accountantId}
                          helperText={errors.accountantId?.message}
                          sx={{ minWidth: 210 }}
                        />
                      )}
                    />
                  )}
                />
              )}

              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Дата от:"
                    value={field.value ? dayjs(field.value) : null}
                    disabled={disableStartDate() || currentUserRoles?.isAdmin}
                    maxDate={dayjs()}
                    onChange={field.onChange}
                    sx={{ maxWidth: 170 }}
                    slotProps={{
                      textField: {
                        size: "small",
                        ...(!!errors.startDate
                          ? {
                              color: "error",
                              focused: !!errors.startDate,
                              helperText: `${errors.startDate?.message}`,
                              FormHelperTextProps: {
                                sx: {
                                  color: "#b66369",
                                },
                              },
                            }
                          : {}),
                      },
                    }}
                    format="D/M/YYYY"
                  />
                )}
              />
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Дата до:"
                    value={field.value ? dayjs(field.value) : null}
                    disabled={disableEndDate() || currentUserRoles?.isAdmin}
                    maxDate={dayjs()}
                    onChange={field.onChange}
                    sx={{ maxWidth: 170 }}
                    slotProps={{
                      textField: {
                        size: "small",
                        ...(!!errors.endDate
                          ? {
                              color: "error",
                              focused: !!errors.endDate,
                              helperText: `${errors.endDate?.message}`,
                              FormHelperTextProps: {
                                sx: {
                                  color: "#b66369",
                                },
                              },
                            }
                          : {}),
                      },
                    }}
                    format="D/M/YYYY"
                  />
                )}
              />
            </Box>
            <Button
              type="submit"
              disabled={disableGenerateButton()}
              variant="contained"
              sx={{
                mt: 1,
                backgroundColor: "#5F8CCC",
                "&:hover": {
                  backgroundColor: "#497ec9",
                },
              }}
            >
              Генерировать
            </Button>
          </Box>
        </LocalizationProvider>
      </form>
    </Card>
  );
};

export default ActsGenerate;
