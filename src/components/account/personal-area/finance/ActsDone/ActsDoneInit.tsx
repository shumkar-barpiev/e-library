import { Box, Card } from "@mui/material";
import { TUserModel } from "@/models/user/user";
import React, { useState, useEffect, useContext } from "react";
import { useUserActsStore } from "@/stores/personal-area/acts/acts";
import ActsTable from "@/components/account/personal-area/finance/ActComponents/ActsTable";
import ActsFilter from "@/components/account/personal-area/finance/ActComponents/ActsFilter";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";

export const ACTS_LIMIT = 10;

const ActsDoneInit = () => {
  const actStore = useUserActsStore();
  const [page, setPage] = useState(1);
  const currentUserContext = useContext(CurrentUserContext);
  const [loadingActs, setLoadingActs] = useState<boolean>(true);
  const [filter, setFilter] = useState<Record<string, any> | null>(null);
  const [currentUser, setCurrentUser] = useState<TUserModel | null>(null);
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);
  const [_requestBody, setRequestBody] = useState<Record<string, any> | null>(null);

  const setFilterParams = (data: Record<string, any> | null) => {
    setPage(1);
    setFilter(data);
  };

  const setPaginationParams = (pageNumber: number) => {
    setPage(pageNumber);
  };

  const getActs = () => {
    let criteria = [];
    const offset = Number(page - 1) * ACTS_LIMIT;

    if (filter) criteria.push(filter);

    if (currentUserRoles?.isSubagent) {
      criteria.push({
        fieldName: "organization.id",
        operator: "=",
        value: `${currentUser?.organization?.id}`,
      });
    }

    if (currentUserRoles?.isAccountant) {
      criteria.push({
        fieldName: "accountant.id",
        operator: "=",
        value: `${currentUser?.id}`,
      });
    }

    criteria.push({
      fieldName: "status",
      operator: "=",
      value: "done",
    });

    const reqBody = {
      offset: offset,
      limit: ACTS_LIMIT,
      sortBy: ["-createdOn"],
      ...(criteria.length > 0 && {
        data: {
          criteria: [
            {
              operator: "and",
              criteria: criteria,
            },
          ],
        },
      }),
    };

    setLoadingActs(true);
    setRequestBody(reqBody);
    actStore.fetchActs(reqBody, "done").then(() => {
      setLoadingActs(false);
    });
  };

  useEffect(() => {
    if (currentUser) getActs();
    return () => {
      actStore.clearStore();
    };
  }, [filter, page, currentUser]);

  useEffect(() => {
    if (currentUserContext?.currentUser) setCurrentUser(currentUserContext?.currentUser);
    if (currentUserContext?.userRoles) setCurrentUserRoles(currentUserContext?.userRoles);
  }, [currentUserContext]);

  return (
    <Box>
      <Card sx={{ px: { xs: 1, sm: 2 }, pb: { xs: 1, sm: 2 } }}>
        <ActsFilter showStatus={false} setFilter={setFilterParams} />
        <ActsTable
          acts={actStore.actsDone}
          loading={loadingActs}
          actsPagination={page}
          setActsPagination={setPaginationParams}
          tableType="done"
        />
      </Card>
    </Box>
  );
};

export default ActsDoneInit;
