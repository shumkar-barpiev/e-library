"use client";

import React, { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { useForm, Controller } from "react-hook-form";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import { Box, TextField, Autocomplete, Grid, Typography, IconButton } from "@mui/material";
import { usePersonalAreaTicketsStore } from "@/stores/personal-area/tickets/user-tickets";
import {
  getFilterDateRange,
  FILTER_BY_DAY,
  getDefaultCriteria,
} from "@/components/account/personal-area/_helpers/user-tickets-helper";

type UserTicketsListFilterPropsType = {
  currentUser: Record<string, any> | null;
  currentUserRoles: Record<string, any> | null;
  setFilterValues: (data: Record<string, any>) => void;
  setFilter: (data: Record<string, any> | null) => void;
};

const UserTicketsListFilter = ({
  currentUser,
  currentUserRoles,
  setFilter,
  setFilterValues,
}: UserTicketsListFilterPropsType) => {
  const userTicketStore = usePersonalAreaTicketsStore();
  const [sales, setSales] = useState<Record<string, any>[] | null>(null);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      filterByUser: "",
      filterByDay: "",
      searchField: "",
    },
  });

  const applyFilter = (data: Record<string, any>) => {
    const criteria = [];
    let filterValues = {};

    if (data.filterByUser) {
      filterValues = { ...filterValues, filterUserId: data.filterByUser };
      criteria.push({
        fieldName: "sales.id",
        operator: "=",
        value: data.filterByUser,
      });
    }

    if (data.filterByDay) {
      const [startDate, endDate] = getFilterDateRange(data.filterByDay);
      filterValues = { ...filterValues, filterDates: { startDate: startDate, endDate: endDate } };
      if (currentUserRoles?.isAgent && currentUser) {
        const primaryCriteria = getDefaultCriteria("AGENT", `${endDate}`, `${startDate}`, currentUser);
        if (primaryCriteria) criteria.push(primaryCriteria);
      } else {
        criteria.push({
          operator: "and",
          criteria: [
            {
              fieldName: "docIss",
              operator: ">=",
              value: startDate,
            },
            {
              fieldName: "docIss",
              operator: "<",
              value: endDate,
            },
          ],
        });
      }
    }

    if (data.searchField) {
      criteria.push({
        operator: "or",
        criteria: [
          {
            fieldName: "docNum",
            operator: "like",
            value: `%${data.searchField}%`,
          },
          {
            fieldName: "recLoc",
            operator: "like",
            value: `%${data.searchField}%`,
          },
          {
            fieldName: "valCar",
            operator: "like",
            value: `%${data.searchField}%`,
          },
          {
            fieldName: "firName",
            operator: "like",
            value: `%${data.searchField}%`,
          },
          {
            fieldName: "lasNam",
            operator: "like",
            value: `%${data.searchField}%`,
          },
        ],
      });
    }

    setFilterValues(filterValues);
    if (criteria.length > 0) {
      if (currentUserRoles?.isAgent) {
        criteria.push({
          fieldName: "sales.id",
          operator: "=",
          value: currentUser?.id,
        });
      }

      const filter = {
        operator: "and",
        criteria: criteria,
      };

      setFilter(filter);
    } else setFilter(null);
  };

  useEffect(() => {
    if (currentUserRoles) {
      if (currentUserRoles?.isManager) {
        let criteriaOne: Record<string, any>[] = [];
        const managerDepartments = currentUser?.partner.departments;
        if (managerDepartments) {
          managerDepartments.map((department: Record<string, any>) => {
            criteriaOne.push({ fieldName: "partner.departments.code", operator: "=", value: `${department.code}` });
          });
        }

        const requestBody = {
          offset: 0,
          fields: ["id", "fullName", "name"],
          data: {
            criteria: [
              {
                operator: "or",
                criteria: criteriaOne,
              },
            ],
          },
        };
        userTicketStore.fetchAllSales(null, (data: Record<string, any>) => {
          if (data.status == 0) setSales(data.data);
        });
      } else {
        userTicketStore.fetchAllSales(null, (data: Record<string, any>) => {
          if (data.status == 0) setSales(data.data);
        });
      }
    }
  }, [currentUserRoles]);

  return (
    <>
      <Box sx={{ maxWidth: { xs: "100%", sm: "80%" }, mx: "auto" }}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ textAlign: "center", fontWeight: 700, color: "#5F8CCC" }}>
              Список билетов по ответственному
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ width: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "center", gap: 2 }}>
                <Box sx={{ marginBottom: 1 }}>
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

                {(currentUserRoles?.isAdmin || currentUserRoles?.isManager) && (
                  <Box sx={{ marginBottom: 1 }}>
                    <Controller
                      name="filterByUser"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          {...field}
                          options={sales ?? []}
                          noOptionsText="Нет данных"
                          disabled={!sales}
                          getOptionLabel={(option: any) => `${option?.fullName}`}
                          value={sales?.find((item: any) => item?.id === field.value) ?? null}
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
                              label="Выберите пользователь"
                              sx={{ minWidth: { xs: 250, md: 200 } }}
                            />
                          )}
                        />
                      )}
                    />
                  </Box>
                )}

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
                            placeholder="ввести РNR, ФИО, ѴС, № билета и т.д и нажать ENTER"
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

export default UserTicketsListFilter;
