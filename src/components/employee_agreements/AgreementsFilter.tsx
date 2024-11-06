"use client";

import SearchIcon from "@mui/icons-material/Search";
import { useForm, Controller } from "react-hook-form";
import React, { useState, useEffect, useContext } from "react";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import { Box, TextField, IconButton, Autocomplete, Grid, Typography } from "@mui/material";
import { useEmployeeAgreementsStore } from "@/stores/hr/employee-agreements/employee-agreements";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";
import { getFilterDateRange, FILTER_BY_DAY } from "@/components/account/personal-area/_helpers/user-tickets-helper";

type AgreementsFilterPropsType = {
  setFilter: (data: Record<string, any> | null) => void;
};

const AgreementsFilter = ({ setFilter }: AgreementsFilterPropsType) => {
  const agreementStore = useEmployeeAgreementsStore();
  const currentUserContext = useContext(CurrentUserContext);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [employees, setEmployees] = useState<Record<string, any>[] | null>(null);
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      filterByUser: "",
      filterByDay: "",
      searchField: "",
    },
  });

  useEffect(() => {
    const requestBody = {
      offset: 0,
      data: {
        criteria: [
          {
            operator: "and",
            criteria: [{ fieldName: "partner.isEmployee", operator: "=", value: true }],
          },
        ],
      },
    };

    agreementStore.fetchEmployees(requestBody, (data: Record<string, any>) => {
      if (data.status == 0) setEmployees(data.data);
    });
  }, []);

  useEffect(() => {
    setIsAvailable(!!(currentUserRoles?.isAdmin || currentUserRoles?.isManager));
  }, [currentUserRoles]);

  useEffect(() => {
    if (currentUserContext?.userRoles) setCurrentUserRoles(currentUserContext?.userRoles);
  }, [currentUserContext]);

  const applyFilter = (data: Record<string, any>) => {
    const criteria = [];

    if (data.filterByUser) {
      criteria.push({
        fieldName: "partner.linkedUser.id",
        operator: "=",
        value: data.filterByUser,
      });
    }

    if (data.filterByDay) {
      const [startDate, endDate] = getFilterDateRange(data.filterByDay);
      criteria.push({
        operator: "and",
        criteria: [
          {
            fieldName: "createdOn",
            operator: ">=",
            value: startDate,
          },
          {
            fieldName: "createdOn",
            operator: "<",
            value: endDate,
          },
        ],
      });
    }

    if (data.searchField) {
      criteria.push({
        operator: "or",
        criteria: [
          {
            fieldName: "template.name",
            operator: "like",
            value: `%${data.searchField}%`,
          },
          {
            fieldName: "partner.fullName",
            operator: "like",
            value: `%${data.searchField}%`,
          },
          {
            fieldName: "fullName",
            operator: "like",
            value: `%${data.searchField}%`,
          },
        ],
      });
    }

    if (criteria.length > 0) {
      const filter = {
        operator: "and",
        criteria: criteria,
      };

      setFilter(filter);
    } else setFilter(null);
  };

  return (
    <>
      <Box sx={{ mb: 3, width: "100%" }}>
        <Grid container spacing={1} sx={{ width: "100%" }}>
          <Grid item xs={12}>
            <Box sx={{ width: 1, display: "flex", justifyContent: "center" }}>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 3,
                  justifyContent: "center",
                }}
              >
                <Box sx={{ marginBottom: { xs: 2, md: 0 } }}>
                  <Controller
                    name="filterByUser"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        options={employees ?? []}
                        noOptionsText="Нет данных"
                        disabled={!employees}
                        getOptionLabel={(option: any) => `${option?.fullName}`}
                        value={employees?.find((item: any) => item?.id === field.value) ?? null}
                        onChange={(e, v) => {
                          field.onChange(v?.id ?? null);
                          handleSubmit(applyFilter)();
                        }}
                        renderOption={(props, option) => (
                          <li {...props} key={option?.id}>
                            {option?.fullName}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label="Выберите сотрудник"
                            sx={{ minWidth: { xs: 250, md: 200 } }}
                          />
                        )}
                      />
                    )}
                  />
                </Box>

                <Box sx={{ marginBottom: { xs: 2, md: 0 } }}>
                  <Controller
                    name="filterByDay"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        options={FILTER_BY_DAY ?? []}
                        getOptionLabel={(option: any) => `${option?.title}`}
                        noOptionsText="Нет данных"
                        onChange={(e, v) => {
                          field.onChange(v?.id ?? null);
                          handleSubmit(applyFilter)();
                        }}
                        value={FILTER_BY_DAY?.find((item: any) => item?.id === field.value) ?? null}
                        renderOption={(props, option) => (
                          <li {...props} key={option?.id}>
                            {option?.title}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label="Фильтровать по дням"
                            sx={{ minWidth: { xs: 250, md: 200 } }}
                          />
                        )}
                      />
                    )}
                  />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Controller
                    name="searchField"
                    control={control}
                    render={({ field }) => (
                      <Box sx={{ display: "flex", alignItems: "center", width: { xs: "100%", md: "auto" } }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            border: 1,
                            borderColor: "#ccc",
                            borderRadius: 1,
                            padding: "0 10px",
                            width: { xs: "100%", md: "auto" },
                          }}
                        >
                          <SearchIcon />
                          <TextField
                            {...field}
                            variant="standard"
                            placeholder="ввести ФИО и нажать ENTER"
                            InputProps={{ disableUnderline: true, "aria-label": "search" }}
                            sx={{ width: { xs: "100%", md: 300 } }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && field.value.trim() !== "") {
                                handleSubmit(applyFilter)();
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      backgroundColor: "white",
                      color: "#5F8CCC",
                      "&:hover": {
                        backgroundColor: "#5F8CCC",
                        color: "white",
                      },
                    }}
                    onClick={handleSubmit(applyFilter)}
                  >
                    <ReplayRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default AgreementsFilter;
