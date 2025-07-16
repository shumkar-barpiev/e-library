"use client";

import React from "react";
import { FormControl, Select, MenuItem, SelectChangeEvent, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Language } from "@mui/icons-material";

export const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (event: SelectChangeEvent) => {
    const language = event.target.value as string;
    i18n.changeLanguage(language);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", minWidth: 120 }}>
      <Language sx={{ mr: 1, fontSize: 20 }} />
      <FormControl size="small" variant="outlined">
        <Select
          value={i18n.language}
          onChange={handleLanguageChange}
          sx={{
            color: "inherit",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "currentColor",
              borderWidth: 1,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "currentColor",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "currentColor",
            },
            "& .MuiSelect-icon": {
              color: "inherit",
            },
            minWidth: 80,
          }}
        >
          <MenuItem value="ru">{t("settings.languages.ru")}</MenuItem>
          <MenuItem value="kg">{t("settings.languages.kg")}</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};
