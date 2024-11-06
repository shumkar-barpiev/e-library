"use client";

import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { useForm, Controller } from "react-hook-form";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import { Box, IconButton, Autocomplete, TextField, ListItem } from "@mui/material";
import { getFilterDateRange, FILTER_BY_DAY } from "@/components/account/personal-area/_helpers/user-tickets-helper";

type propsType = {
  currentUser: Record<string, any> | null;
  currentUserRoles: Record<string, any> | null;
  setFilter: (data: Record<string, any> | null) => void;
};

const NewsFilter = ({ currentUser, currentUserRoles, setFilter }: propsType) => {
  const [filterIsVisible, SetFilterIsVisible] = useState(false);
  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      status: "",
      searchField: "",
      filterByDay: "",
      filterByUsers: "",
    },
  });

  const statuses: Record<string, any>[] = [
    { id: 1, value: "current", name: "Актуально" },
    { id: 2, value: "irrelevant", name: "Неактуально" },
  ];

  const filterByUsers: Record<string, any>[] = [
    { id: 1, value: "mine", name: "Мои новости" },
    { id: 2, value: "subagent", name: "Для субагентов" },
    { id: 3, value: "agent", name: "Для сотрудников" },
  ];

  const applyFilter = (data: any) => {
    const criteria = [];

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
            fieldName: "pubTopic",
            operator: "like",
            value: `%${data.searchField}%`,
          },
          {
            fieldName: "createdBy.fullName",
            operator: "like",
            value: `%${data.searchField}%`,
          },
          {
            fieldName: "description",
            operator: "like",
            value: `%${data.searchField}%`,
          },
        ],
      });
    }

    if (data.status) {
      criteria.push({
        fieldName: "pubStatus",
        operator: "=",
        value: data.status,
      });
    }

    if (data.filterByUsers) {
      switch (`${data.filterByUsers}`) {
        case "mine":
          criteria.push({
            fieldName: "createdBy.id",
            operator: "=",
            value: currentUser?.id,
          });
          break;
        case "subagent":
          criteria.push({
            fieldName: "forWhom",
            operator: "=",
            value: "subagent",
          });
          break;
        case "agent":
          criteria.push({
            fieldName: "forWhom",
            operator: "=",
            value: "agent",
          });
          break;
        default:
          return;
      }
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
      <Box sx={{ my: 3 }}>
        <Box
          sx={{
            width: 1,
            display: "flex",
            flexDirection: { xs: "column-reverse", md: "row" },
            alignItems: { xs: "left", md: "center" },
            justifyContent: { md: "space-between" },
            height: { xs: "auto", xl: "50px" },
            gap: { xs: 2, md: 0 },
          }}
        >
          <Box>
            {filterIsVisible && (
              <Box sx={{ width: "100%" }}>
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
                              <ListItem {...props} key={option?.id}>
                                {option?.title}
                              </ListItem>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                label="Фильтровать по дням"
                                sx={{ minWidth: { xs: 250 } }}
                              />
                            )}
                          />
                        )}
                      />
                    </Box>

                    {(currentUserRoles?.isAdmin || currentUserRoles?.isManager) && (
                      <Box sx={{ marginBottom: { xs: 2, md: 0 } }}>
                        <Controller
                          name="filterByUsers"
                          control={control}
                          render={({ field }) => (
                            <Autocomplete
                              {...field}
                              options={filterByUsers ?? []}
                              getOptionLabel={(option: Record<string, any>) => `${option?.name}`}
                              noOptionsText="Нет данных"
                              onChange={(e, v) => {
                                field.onChange(v?.value ?? null);
                                handleSubmit(applyFilter)();
                              }}
                              value={filterByUsers?.find((item: any) => item?.value === field.value) ?? null}
                              renderOption={(props, option) => (
                                <ListItem {...props} key={option?.id} sx={{ whiteSpace: "nowrap" }}>
                                  {option?.name}
                                </ListItem>
                              )}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="standard"
                                  label="Пользователь"
                                  sx={{ minWidth: { xs: 180 } }}
                                />
                              )}
                            />
                          )}
                        />
                      </Box>
                    )}

                    <Box sx={{ marginBottom: { xs: 2, md: 0 } }}>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <Autocomplete
                            {...field}
                            options={statuses ?? []}
                            getOptionLabel={(option: Record<string, any>) => `${option?.name}`}
                            noOptionsText="Нет данных"
                            onChange={(e, v) => {
                              field.onChange(v?.value ?? null);
                              handleSubmit(applyFilter)();
                            }}
                            value={statuses?.find((item: any) => item?.value === field.value) ?? null}
                            renderOption={(props, option) => (
                              <ListItem {...props} key={option?.id}>
                                {option?.name}
                              </ListItem>
                            )}
                            renderInput={(params) => (
                              <TextField {...params} variant="standard" label="Статус" sx={{ minWidth: { xs: 150 } }} />
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
                                placeholder="Ввести пользователя, названию поста или описанию и т. д."
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
              </Box>
            )}
          </Box>
          <IconButton
            sx={{ color: "#5F8CCC", width: "fit-content" }}
            onClick={() => SetFilterIsVisible((prev) => !prev)}
          >
            {filterIsVisible ? <FilterAltOffIcon /> : <FilterAltIcon />}
          </IconButton>
        </Box>
      </Box>
    </>
  );
};

export default NewsFilter;
