"use client";

import { formatNumber } from "@/utils/utils";
import { TUserModel } from "@/models/user/user";
import News from "@/components/account/personal-area/news/News";
import Orders from "@/components/account/personal-area/orders/Orders";
import { SyntheticEvent, useEffect, useState, useContext } from "react";
import Finance from "@/components/account/personal-area/finance/Finance";
import { Box, Tabs, Tab, Stack, Typography, Badge } from "@mui/material";
import Bonus from "@/components/account/personal-area/tabbar-components/Bonus";
import UserTickets from "@/components/account/personal-area/tickets/UserTickets";
import UserAttendance from "@/components/account/personal-area/user-attendance/UserAttendance";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";

export const PersonalAreaTabBar = () => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const currentUserContext = useContext(CurrentUserContext);
  const [counter, setCounter] = useState<number | null>(null);
  const [isAvailableTab, setIsAvailableTab] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<TUserModel | null>(null);
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(false);
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);

  useEffect(() => {
    const tempActiveTab = localStorage.getItem("activeTab");
    if (!!tempActiveTab) {
      setActiveTab(parseInt(tempActiveTab, 10));
      localStorage.removeItem("activeTab");
    } else {
      if (currentUserRoles?.isSubagent) setActiveTab(2);
      else setActiveTab(1);
    }
  }, []);

  useEffect(() => {
    if (currentUserContext?.currentUser) setCurrentUser(currentUserContext?.currentUser);
    if (currentUserContext?.userRoles) setCurrentUserRoles(currentUserContext?.userRoles);
  }, [currentUserContext]);

  useEffect(() => {
    if (currentUserContext?.actsCounter != undefined) setCounter(currentUserContext?.actsCounter);
  }, [currentUserContext?.actsCounter]);

  useEffect(() => {
    setIsAvailableTab(!!(currentUserRoles?.isManager || currentUserRoles?.isSubagent || currentUserRoles?.isAdmin));
  }, [currentUser]);

  const handleChange = (e: SyntheticEvent, newActiveTab: number) => {
    setActiveTab(newActiveTab);
  };

  return (
    <Box
      p={2}
      sx={{
        overflow: { xs: "auto", xl: "hidden" },
        width: 1,
        height: "100vh",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      <Box
        sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", width: "100%" }}
      >
        <Tabs
          value={activeTab}
          onChange={handleChange}
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#5F8CCC",
            },
            "& .MuiTab-root": {
              color: "gray",
              "&.Mui-selected": {
                color: "#5F8CCC",
              },
            },
          }}
        >
          {!currentUserRoles?.isSubagent && <Tab value={1} label="Посещаемость" />}
          <Tab value={2} label="Авиа Билеты" />
          {isAvailableTab && <Tab value={3} label="Заказы" />}
          {currentUserRoles?.isSubagent && currentUser?.partner?.departments?.length > 0 && (
            <Tab value={4} label="Финансы" />
          )}

          {(currentUserRoles?.isAdmin || currentUserRoles?.isAccountant || currentUserRoles?.isChiefAccountant) &&
            currentUser?.partner?.departments?.length > 0 && (
              <Tab
                value={4}
                label={
                  <Badge
                    badgeContent={counter}
                    sx={{
                      "& .MuiBadge-badge": {
                        width: 12,
                        color: "white",
                        fontSize: "0.6rem",
                        backgroundColor: activeTab === 4 ? "#5F8CCC" : "gray",
                      },
                      ...(!!counter ? { pr: 1.5 } : {}),
                    }}
                  >
                    Финансы
                  </Badge>
                }
              />
            )}
          <Tab value={5} label="Новости" />
        </Tabs>
        <Box p={2}>
          <Stack direction="row" gap={2}>
            {currentUserRoles?.isSubagent && (
              <Box
                onMouseEnter={() => setIsBalanceVisible(true)}
                onMouseLeave={() => setIsBalanceVisible(false)}
                sx={{
                  p: 1,
                  width: "200px",
                  color: "#fff",
                  borderRadius: 2,
                  background: "#5F8CCC",
                }}
              >
                <Typography color="text.main">Баланс</Typography>
                <Typography variant="h6">
                  {isBalanceVisible
                    ? `${formatNumber(`${currentUser?.organization?.currentBalance ? currentUser?.organization?.currentBalance : 0}`)} сом`
                    : "*".repeat(8)}
                </Typography>
              </Box>
            )}

            {!currentUserRoles?.isExcludedBonusUser && (
              <Bonus currentUser={currentUser} currentUserRoles={currentUserRoles} />
            )}
          </Stack>
        </Box>
      </Box>
      <Box sx={{ p: 2 }}>
        {activeTab === 1 && <UserAttendance />}
        {activeTab === 2 && <UserTickets />}
        {activeTab === 3 && <Orders />}
        {activeTab === 4 && <Finance />}
        {activeTab === 5 && <News />}
      </Box>
    </Box>
  );
};
