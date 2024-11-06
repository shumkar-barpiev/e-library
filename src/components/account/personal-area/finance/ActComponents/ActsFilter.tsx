"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Box, Autocomplete, TextField } from "@mui/material";
import { useUserActsStore } from "@/stores/personal-area/acts/acts";
import { usePersonalAreaTicketsStore } from "@/stores/personal-area/tickets/user-tickets";
import { StatusTranslation, capitalizeTheString } from "@/components/other/BadgeComponent";

type StatusKeys = keyof typeof StatusTranslation;

type PropsType = {
  showStatus: boolean;
  setFilter: (data: Record<string, any> | null) => void;
};

const ActsFilter = ({ showStatus, setFilter }: PropsType) => {
  const actStore = useUserActsStore();
  const userTicketStore = usePersonalAreaTicketsStore();
  const [statuses, setStatuses] = useState<Record<string, any>[]>([]);
  const [organizations, setOrganizations] = useState<Record<string, any>[]>([]);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      status: "",
      organizationId: 0,
    },
  });

  const applyFilter = (data: any) => {
    const criteria = [];

    if (data.organizationId) {
      criteria.push({
        fieldName: "organization.id",
        operator: "=",
        value: data.organizationId,
      });
    }

    if (data.status) {
      criteria.push({
        fieldName: "status",
        operator: "=",
        value: data.status,
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

  useEffect(() => {
    userTicketStore.fetchAllAccount((data: Record<string, any>) => {
      if (data.status === 0) setOrganizations(data.data);
    });

    actStore.fetchStatuses((data) => {
      if (data.status == 0) setStatuses(data.data);
    });
  }, []);

  return (
    <>
      <Box sx={{ mb: 3, mt: 1, px: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            flexDirection: { xs: "column", sm: "row" },
            gap: 3,
          }}
        >
          <Box sx={{ marginBottom: { xs: 2, md: 0 } }}>
            <Controller
              name="organizationId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  size="small"
                  options={organizations}
                  disabled={organizations.length === 0}
                  getOptionLabel={(option: any) => option?.name ?? ""}
                  noOptionsText="Нет данных"
                  onChange={(e, value) => {
                    field.onChange(value?.id ?? 0);
                    handleSubmit(applyFilter)();
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
                      label="Фильтровать по организации"
                      sx={{ minWidth: 230 }}
                    />
                  )}
                />
              )}
            />
          </Box>

          {showStatus && (
            <Box sx={{ marginBottom: { xs: 2, md: 0 } }}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    size="small"
                    options={statuses}
                    disabled={statuses?.length === 0}
                    getOptionLabel={(option: Record<string, any>) =>
                      `${capitalizeTheString(StatusTranslation[`${option?.value as StatusKeys}`])}`
                    }
                    noOptionsText="Нет данных"
                    onChange={(e, v) => {
                      field.onChange(v?.value ?? null);
                      handleSubmit(applyFilter)();
                    }}
                    value={statuses?.find((item: any) => item?.value === field.value) ?? null}
                    renderOption={(props, option) => (
                      <li {...props} key={option?.order_seq}>
                        {capitalizeTheString(StatusTranslation[`${option?.value as StatusKeys}`])}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField {...params} variant="standard" label="Статус" sx={{ minWidth: { xs: 150 } }} />
                    )}
                  />
                )}
              />
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default ActsFilter;
