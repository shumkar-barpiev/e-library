"use client";

import React from "react";
import Snackbar from "@/components/other/Snackbar";
import EmployeeAgreementMain from "@/components/employee_agreements/Main";
import { CurrentUserProvider } from "@/components/account/personal-area/current-user/CurrentUserProvider";

function EmployeeAgreement() {
  return (
    <>
      <CurrentUserProvider>
        <EmployeeAgreementMain />
      </CurrentUserProvider>
      <Snackbar />
    </>
  );
}

export default EmployeeAgreement;
