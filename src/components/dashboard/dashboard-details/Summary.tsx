"use client";

import { formatNumber } from "@/utils/utils";
import { TUserModel } from "@/models/user/user";
import { useUserStore } from "@/stores/users/users";
import { Grid, Box, Typography } from "@mui/material";
import React, { useState, useEffect, useContext, useMemo } from "react";
import { getFilterDateRange } from "@/components/account/personal-area/_helpers/user-tickets-helper";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";

export default function Summary() {
  const userStore = useUserStore();
  const currentUserContext = useContext(CurrentUserContext);
  const [weeklyBonus, setWeeklyBonus] = useState<number>(0);
  const [monthlyBonus, setMonthlyBonus] = useState<number>(0);
  const [unfinishedBonus, setUnfinishedBonus] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<TUserModel | null>(null);
  const [monthStartDate, monthEndDate] = useMemo(() => getFilterDateRange(4), []);
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);
  const [isWeeklyBonusVisible, setIsWeeklyBonusVisible] = useState<boolean>(false);
  const [weeklyStartDate, weeklyEndDate] = useMemo(() => getFilterDateRange(3), []);
  const [isMonthlyBonusVisible, setIsMonthlyBonusVisible] = useState<boolean>(false);
  const [isUnfinishedBonusVisible, setIsUnfinishedBonusVisible] = useState<boolean>(false);

  const BONUS_DATA = [
    // { id: 1, title: "Бонусы за 7 дней", text: `${weeklyBonus} сом` },
    // { id: 2, title: "Бонусы за 30 дней", text: `${monthlyBonus} сом` },
    // { id: 3, title: "Незавершенные", text: `${unfinishedBonus} сом` },
  ];

  const getRequestType = () => {
    if (currentUserRoles?.isAdmin) return "general";
    if (currentUserRoles?.isAgent || currentUserRoles?.isManager) return "agent";
    if (currentUserRoles?.isSubagent) return "subagent";
    return "agent";
  };

  const getIdValue = () => {
    if (currentUserRoles?.isAdmin) return {};
    if (currentUserRoles?.isAgent || currentUserRoles?.isManager) return { agentId: currentUser?.id };
    if (currentUserRoles?.isSubagent) return { subagentId: currentUser?.id };
    return { agentId: currentUser?.id };
  };

  const createRequestBody = (fromDate: string, toDate: string, requestType: string | null) => {
    return {
      data: {
        type: requestType,
        ...getIdValue(),
        fromDate,
        toDate,
      },
    };
  };

  useEffect(() => {
    if (!!currentUser && !!currentUserRoles) {
      const requestType = getRequestType();

      const requestBodyWeek = createRequestBody(weeklyStartDate, weeklyEndDate, requestType);
      const requestBodyMonth = createRequestBody(monthStartDate, monthEndDate, requestType);

      userStore.getUserBonus(requestBodyWeek, (data: Record<string, any>) => {
        if (data.status === 0) setWeeklyBonus(Number(data.data.bonus));
      });

      userStore.getUserBonus(requestBodyMonth, (data: Record<string, any>) => {
        if (data.status === 0) setMonthlyBonus(Number(data.data.bonus));
      });
    }
  }, [currentUser, currentUserRoles]);

  useEffect(() => {
    if (currentUserContext?.currentUser) setCurrentUser(currentUserContext?.currentUser);
    if (currentUserContext?.userRoles) setCurrentUserRoles(currentUserContext?.userRoles);
  }, [currentUserContext]);

  const handleHover = (id: number) => {
    switch (id) {
      case 1:
        setIsWeeklyBonusVisible(!isWeeklyBonusVisible);
        break;
      case 2:
        setIsMonthlyBonusVisible(!isMonthlyBonusVisible);
        break;
      case 3:
        setIsUnfinishedBonusVisible(!isUnfinishedBonusVisible);
        break;
      default:
        return;
    }
  };

  const RenderBox = (item: Record<string, any>) => {
    const isVisible =
      (item.id === 1 && isWeeklyBonusVisible) ||
      (item.id === 2 && isMonthlyBonusVisible) ||
      (item.id === 3 && isUnfinishedBonusVisible);

    return (
      <Grid item md={4} xs={12} key={item.id}>
        <Box
          onMouseEnter={() => handleHover(item.id)}
          onMouseLeave={() => handleHover(item.id)}
          sx={{
            background: "#5F8CCC",
            color: "#fff",
            p: 2,
            borderRadius: 2,
          }}
        >
          <Typography color="text.main">{item.title}</Typography>
          <Typography variant="h6">{isVisible ? `${formatNumber(item.text)}` : "*".repeat(8)}</Typography>
        </Box>
      </Grid>
    );
  };

  return (
    <Grid container spacing={2}>
      {/* {!currentUserRoles?.isExcludedBonusUser && BONUS_DATA.map(RenderBox)} */}
    </Grid>
  );
}
