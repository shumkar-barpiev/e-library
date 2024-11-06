"use client";

import { formatNumber } from "@/utils/utils";
import { MenuProps } from "@mui/material/Menu";
import React, { useState, useEffect } from "react";
import { useUserStore } from "@/stores/users/users";
import { styled, alpha } from "@mui/material/styles";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  getFilterDateRange,
  FILTER_BY_DAY,
  getListTicketDates,
} from "@/components/account/personal-area/_helpers/user-tickets-helper";
import { Box, Typography, Menu, MenuItem, IconButton } from "@mui/material";

type PropsType = {
  currentUser: Record<string, any> | null;
  currentUserRoles: Record<string, any> | null;
};

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: "rgb(55, 65, 81)",
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      "&:active": {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
      },
    },
    ...theme.applyStyles("dark", {
      color: theme.palette.grey[300],
    }),
  },
}));

const Bonus = ({ currentUser, currentUserRoles }: PropsType) => {
  const [isSubBalanceVisible, setIsSubBalanceVisible] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [bonus, setBonus] = useState<number>(0);
  const userStore = useUserStore();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSelect = (value: string) => {
    const requestType = getRequestType();
    const [startDate, endDate]: string[] = getFilterDateRange(Number(value));

    const requestBody = {
      data: {
        type: requestType,
        ...getIdValue(),
        fromDate: `${startDate}`,
        toDate: `${endDate}`,
      },
    };

    if (currentUserRoles) getBonus(requestBody);
    setIsSubBalanceVisible(true);
    setAnchorEl(null);
  };

  const getBonus = (requestBody: Record<string, any>) => {
    userStore.getUserBonus(requestBody, (data: Record<string, any>) => {
      if (data.status === 0) setBonus(Number(`${data.data.bonus}`));
    });
  };

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

  useEffect(() => {
    const [startDate, endDate] = getListTicketDates();
    const requestType = getRequestType();

    const requestBody = {
      data: {
        type: requestType,
        ...getIdValue(),
        fromDate: `${startDate}`,
        toDate: `${endDate}`,
      },
    };

    if (currentUserRoles) getBonus(requestBody);
  }, [currentUserRoles]);

  return (
    <Box
      onMouseEnter={() => setIsSubBalanceVisible(true)}
      onMouseLeave={() => setIsSubBalanceVisible(false)}
      sx={{
        p: 1,
        color: "#fff",
        width: "200px",
        borderRadius: 2,
        background: "#5F8CCC",
        position: "relative",
      }}
    >
      <Typography color="text.main">Бонус</Typography>
      <Typography variant="h6">{isSubBalanceVisible ? `${formatNumber(`${bonus}`)} сом` : "*".repeat(8)}</Typography>

      <Box sx={{ position: "absolute", top: 2, right: 2 }}>
        <IconButton
          size="small"
          id="basic-button"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          sx={{ color: "white" }}
        >
          <MoreVertIcon fontSize="small" color="inherit" />
        </IconButton>
        <StyledMenu
          id="demo-customized-menu"
          MenuListProps={{
            "aria-labelledby": "demo-customized-button",
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleSelect}
        >
          {FILTER_BY_DAY.map((filter: Record<string, any>) => {
            return (
              <MenuItem key={filter.id} onClick={() => handleSelect(filter.value)} disableRipple>
                {filter.title}
              </MenuItem>
            );
          })}
        </StyledMenu>
      </Box>
    </Box>
  );
};

export default Bonus;
