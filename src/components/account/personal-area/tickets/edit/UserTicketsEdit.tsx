import { Box, Grid } from "@mui/material";
import { TUserModel } from "@/models/user/user";
import React, { useState, useEffect, useContext } from "react";
import {
  getEditTicketDates,
  getDefaultCriteria,
} from "@/components/account/personal-area/_helpers/user-tickets-helper";
import { usePersonalAreaTicketsStore } from "@/stores/personal-area/tickets/user-tickets";
import { INITIAL as initialRequestBody } from "@/components/account/personal-area/tickets/UserTickets";
import UserTicketsEditTable from "@/components/account/personal-area/tickets/edit/UserTicketsEditTable";
import UserTicketsEditFilter from "@/components/account/personal-area/tickets/edit/UserTicketsEditFilter";
import UserTicketsEditTicket from "@/components/account/personal-area/tickets/edit/UserTicketsEditTicket";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";

export const TICKETS_LIMIT = 10;

function UserTicketsEdit() {
  const userTicketStore = usePersonalAreaTicketsStore();
  const currentUserContext = useContext(CurrentUserContext);
  const [loadingTickets, setLoadingTickets] = useState<boolean>(true);
  const [filter, setFilter] = useState<Record<string, any> | null>(null);
  const [currentUser, setCurrentUser] = useState<TUserModel | null>(null);
  const [userTicketsPagination, setUserTicketsPagination] = useState<number>(1);
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);
  const [_requestBody, setRequestBody] = useState<Record<string, any> | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Record<string, any> | null>(null);

  const setFilterParams = (data: Record<string, any> | null) => {
    setUserTicketsPagination(1);
    setFilter(data);
  };

  const setPaginationParams = (page: number) => {
    setUserTicketsPagination(page);
  };

  const handleRowClick = (ticket: Record<string, any>) => {
    setSelectedTicket(ticket);
  };

  const resetSelectedRow = () => {
    setSelectedTicket(null);
  };

  const reloadTheTable = () => {
    if (!!_requestBody) {
      setLoadingTickets(true);
      userTicketStore.fetchAllTickets(_requestBody).then(() => {
        setLoadingTickets(false);
      });
    }
  };

  useEffect(() => {
    if (currentUserContext?.currentUser) setCurrentUser(currentUserContext?.currentUser);
    if (currentUserContext?.userRoles) setCurrentUserRoles(currentUserContext?.userRoles);
  }, [currentUserContext]);

  useEffect(() => {
    if (!!currentUser?.id) {
      let criteria = [];
      const offset = (userTicketsPagination - 1) * TICKETS_LIMIT;
      if (filter) {
        criteria.push(filter);
      } else {
        const [startDate, endDate] = getEditTicketDates();
        if (currentUserRoles?.isAdmin) {
          criteria.push({
            fieldName: "docIss",
            operator: "between",
            value: `${startDate}`,
            value2: `${endDate}`,
          });
        } else if (currentUserRoles?.isAgent) {
          const agentPrimaryCriteria = getDefaultCriteria("AGENT", `${endDate}`, `${startDate}`, currentUser);
          if (agentPrimaryCriteria) criteria.push(agentPrimaryCriteria);
        } else if (currentUserRoles?.isManager) {
          const managerPrimaryCriteria = getDefaultCriteria("MANAGER", `${endDate}`, `${startDate}`, currentUser);
          if (managerPrimaryCriteria) criteria.push(managerPrimaryCriteria);
        }
      }

      const requestBody = {
        limit: TICKETS_LIMIT,
        offset: offset,
        ...initialRequestBody,
        sortBy: ["-createdOn"],
        ...(criteria.length > 0 && {
          data: {
            operator: "or",
            criteria: criteria,
          },
        }),
      };

      setRequestBody(requestBody);
      setLoadingTickets(true);
      userTicketStore.fetchAllTickets(requestBody).then(() => {
        setLoadingTickets(false);
      });
    }

    return () => {
      userTicketStore.clearStore();
    };
  }, [currentUser, filter, userTicketsPagination]);

  return (
    <Box>
      <UserTicketsEditFilter setFilter={setFilterParams} />
      <Grid container spacing={2}>
        <Grid item xs={12} xl={8}>
          <UserTicketsEditTable
            loading={loadingTickets}
            onRowClick={handleRowClick}
            selectedTicket={selectedTicket}
            setPagination={setPaginationParams}
            userTicketPagination={userTicketsPagination}
          />
        </Grid>
        <Grid item xs={12} xl={4}>
          <UserTicketsEditTicket
            ticket={selectedTicket}
            reloadTheTable={reloadTheTable}
            resetSelectedRow={resetSelectedRow}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default UserTicketsEdit;
