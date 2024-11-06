"use client";

import { Box, Tabs, Tab, Divider } from "@mui/material";
import { SyntheticEvent, useState, useEffect, useContext } from "react";
import CurrentStateAttendance from "./Components/CurrentStateAttendance";
import AppealsToHR from "./Components/AppealsToHR";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";

export const UserAttendanceTabbar = () => {
  const [value, setValue] = useState(1);
  const currentUserContext = useContext(CurrentUserContext);
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);

  const handleChange = (e: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (currentUserContext?.userRoles) setCurrentUserRoles(currentUserContext?.userRoles);
  }, [currentUserContext]);

  return (
    <Box sx={{ maxHeight: 650, overflowY: "auto", width: 1 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", width: "100%" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="inherit"
          sx={{
            bgcolor: "#5F8CCC",
            borderRadius: 1,
            "& .MuiTab-root": {
              color: "#fff",
            },
            "& .Mui-selected": {
              color: "#fff",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#5F8CCC",
            },
          }}
        >
          <Tab value={1} label="Посещаемость" />
          {(currentUserRoles?.isHR || currentUserRoles?.isAdmin) && <Tab value={2} label="Обращение в отдел кадров" />}
        </Tabs>
      </Box>
      <Divider sx={{ mt: 1 }} />
      <Box sx={{ p: 2 }}>
        {value === 1 && <CurrentStateAttendance />}
        {value === 2 && <AppealsToHR />}
      </Box>
    </Box>
  );
};
