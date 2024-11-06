"use client";

import { Box } from "@mui/material";
import { TUserModel } from "@/models/user/user";
import React, { useEffect, useState, useContext } from "react";
import CreateAgreement from "@/components/employee_agreements/CreateAgreement";
import AgreementsTable from "@/components/employee_agreements/AgreementsTable";
import AgreementsFilter from "@/components/employee_agreements/AgreementsFilter";
import { useEmployeeAgreementsStore } from "@/stores/hr/employee-agreements/employee-agreements";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";

export const AGREEMENTS_LIMIT = 10;

function EmployeeAgreementMain() {
  const agreementStore = useEmployeeAgreementsStore();
  const currentUserContext = useContext(CurrentUserContext);
  const [filter, setFilter] = useState<Record<string, any> | null>(null);
  const [currentUser, setCurrentUser] = useState<TUserModel | null>(null);
  const [loadingAgreements, setLoadingAgreements] = useState<boolean>(true);
  const [agreementsPagination, setAgreementsPagination] = useState<number>(1);
  const [agreements, setAgreements] = useState<Record<string, any> | null>(null);
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);
  const [_requestBody, setRequestBody] = useState<Record<string, any> | null>(null);

  const setPaginationParams = (page: number) => {
    setAgreementsPagination(page);
  };

  const setFilterParams = (data: Record<string, any> | null) => {
    setLoadingAgreements(true);
    setAgreements(null);
    setAgreementsPagination(1);
    setFilter(data);
  };

  const reloadTable = () => {
    if (_requestBody) {
      agreementStore.fetchAgreements(_requestBody, (data: Record<string, any>) => {
        if (data.status === 0) {
          agreementStore.setReloadAgreementsTable(false);
          setAgreements(data.data);
        } else {
          console.log("Agreements haven't been loaded!!!");
        }
      });
    }
  };

  useEffect(() => {
    if (agreementStore.reloadAgreementsTable) reloadTable();
  }, [agreementStore.reloadAgreementsTable]);

  useEffect(() => {
    if (!!currentUser?.id) {
      let criteria = [];
      const offset = (agreementsPagination - 1) * AGREEMENTS_LIMIT;
      if (filter) criteria.push(filter);

      const requestBody = {
        offset: offset,
        limit: AGREEMENTS_LIMIT,
        fields: [
          "id",
          "partner",
          "dmsFile",
          "fullName",
          "template",
          "createdOn",
          "createdBy",
          "employeeUser",
          "conversation",
        ],
        sortBy: ["-createdOn"],
        ...(criteria.length > 0 && {
          data: {
            criteria: criteria,
          },
        }),
      };

      setRequestBody(requestBody);
      setLoadingAgreements(true);

      agreementStore.fetchAgreements(requestBody, (data: Record<string, any>) => {
        setLoadingAgreements(false);
        if (data.status === 0 && data.data) {
          setAgreements(data.data);
        } else {
          console.log("Agreements haven't been loaded!!!");
        }
      });
    }
  }, [currentUser, filter, agreementsPagination]);

  useEffect(() => {
    if (currentUserContext?.currentUser) setCurrentUser(currentUserContext?.currentUser);
    if (currentUserContext?.userRoles) setCurrentUserRoles(currentUserContext?.userRoles);
  }, [currentUserContext]);

  return (
    <Box sx={{ p: 3 }}>
      <CreateAgreement />
      <AgreementsFilter setFilter={setFilterParams} />
      <AgreementsTable
        agreements={agreements}
        loading={loadingAgreements}
        setPagination={setPaginationParams}
        agreementsPagination={agreementsPagination}
      />
    </Box>
  );
}

export default EmployeeAgreementMain;
