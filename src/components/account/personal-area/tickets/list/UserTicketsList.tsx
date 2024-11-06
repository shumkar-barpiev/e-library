import { TUserModel } from "@/models/user/user";
import { useState, useEffect, useContext } from "react";
import {
  getListTicketDates,
  getDefaultCriteria,
  getToday,
} from "@/components/account/personal-area/_helpers/user-tickets-helper";
import { Box, CircularProgress, Divider, Typography } from "@mui/material";
import { usePersonalAreaTicketsStore } from "@/stores/personal-area/tickets/user-tickets";
import { INITIAL as initialRequestBody } from "@/components/account/personal-area/tickets/UserTickets";
import UserTicketsListTable from "@/components/account/personal-area/tickets/list/UserTicketsListTable";
import UserTicketsListFilter from "@/components/account/personal-area/tickets/list/UserTicketsListFilter";
import UserTicketsListInfoCard from "@/components/account/personal-area/tickets/list/UserTicketsListInfoCard";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";

export const TICKETS_LIMIT = 7;

function UserTicketsList() {
  const userTicketStore = usePersonalAreaTicketsStore();
  const currentUserContext = useContext(CurrentUserContext);
  const [loadingTickets, setLoadingTickets] = useState<boolean>(true);
  const [filter, setFilter] = useState<Record<string, any> | null>(null);
  const [currentUser, setCurrentUser] = useState<TUserModel | null>(null);
  const [loadingIncomeSum, setLoadingIncomeSum] = useState<boolean>(false);
  const [userTicketsPagination, setUserTicketsPagination] = useState<number>(1);
  const [incomeSum, setIncomeSum] = useState<Record<string, any> | null>(null);
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);
  const [_requestBody, setRequestBody] = useState<Record<string, any> | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, any> | null>(null);

  const setFilterParams = (data: Record<string, any> | null) => {
    setUserTicketsPagination(1);
    setFilter(data);
  };

  const setPaginationParams = (page: number) => {
    setUserTicketsPagination(page);
  };

  const setFilterValuesParams = (params: Record<string, any>) => {
    setFilterValues((prev: Record<string, any>) => {
      return { ...prev, params };
    });
  };

  const sendIncomeSumRequest = (reqBody: Record<string, any>) => {
    setLoadingIncomeSum(true);
    userTicketStore.fetchIncomeSum(reqBody, (data: Record<string, any>) => {
      setLoadingIncomeSum(false);
      if (data.status === 0) {
        setIncomeSum(data.data);
      }
    });
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
        const [startDate, endDate] = getListTicketDates();
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

  useEffect(() => {
    if (currentUser) {
      let incomeRequestBody;
      let [formattedFirsDateOfCurrentMonth, formattedTodaysDateOfCurrentMonth] = getListTicketDates();

      if (filterValues?.params?.filterDates) {
        formattedFirsDateOfCurrentMonth = filterValues?.params?.filterDates?.startDate;
        formattedTodaysDateOfCurrentMonth = filterValues?.params?.filterDates?.endDate;
      }

      if (currentUserRoles?.isAgent) {
        incomeRequestBody = {
          data: {
            type: "individual",
            salesId: currentUser?.id,
            fromDate: formattedFirsDateOfCurrentMonth,
            toDate: formattedTodaysDateOfCurrentMonth,
          },
        };
      } else {
        incomeRequestBody = {
          data: {
            ...(filterValues?.params?.filterUserId ? { type: "individual" } : { type: "general" }),
            ...(filterValues?.params?.filterUserId ? { salesId: filterValues?.params?.filterUserId } : {}),
            fromDate: formattedFirsDateOfCurrentMonth,
            toDate: formattedTodaysDateOfCurrentMonth,
          },
        };
      }

      setIncomeSum(null);
      if (incomeRequestBody) sendIncomeSumRequest(incomeRequestBody);
    }
  }, [filterValues, currentUser]);

  return (
    <Box>
      <UserTicketsListFilter
        currentUser={currentUser}
        setFilter={setFilterParams}
        currentUserRoles={currentUserRoles}
        setFilterValues={setFilterValuesParams}
      />

      {loadingIncomeSum ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, m: 3 }}>
          <Typography variant="inherit" color={"inherit"}>
            Загрузка...
          </Typography>
          <CircularProgress color="inherit" size={15} />
        </Box>
      ) : (
        <>
          {!!userTicketStore?.tickets && (
            <>
              <Divider sx={{ my: 1 }} />
              <UserTicketsListInfoCard
                total={incomeSum?.total}
                serFee={incomeSum?.serviceFee}
                commission={incomeSum?.commission}
              />
            </>
          )}
        </>
      )}
      <Divider sx={{ my: 1 }} />
      <UserTicketsListTable
        loading={loadingTickets}
        setPagination={setPaginationParams}
        userTicketPagination={userTicketsPagination}
      />
    </Box>
  );
}

export default UserTicketsList;
