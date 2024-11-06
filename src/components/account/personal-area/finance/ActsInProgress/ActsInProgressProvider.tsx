import { TUserModel } from "@/models/user/user";
import { useUserActsStore } from "@/stores/personal-area/acts/acts";
import React, { useState, useEffect, ReactNode, createContext, useContext } from "react";
import { ACTS_LIMIT } from "@/components/account/personal-area/finance/ActsInProgress/ActsInProgressInit";
import { CurrentUserContext, RolesType } from "@/components/account/personal-area/current-user/CurrentUserProvider";

type PropsType = {
  reloadActs: () => void;
} | null;

type ProviderPropsType = {
  children: ReactNode;
  requestBody: Record<string, any> | null;
};

export const ActsContext = createContext<PropsType | null>(null);

export const ActsInProgressProvider: React.FC<ProviderPropsType> = ({ children, requestBody }) => {
  const actStore = useUserActsStore();
  const currentUserContext = useContext(CurrentUserContext);
  const [actsContext, setActsContext] = useState<PropsType>(null);
  const [currentUser, setCurrentUser] = useState<TUserModel | null>(null);
  const [currentUserRoles, setCurrentUserRoles] = useState<RolesType | null>(null);

  useEffect(() => {
    setActsContext({
      reloadActs: reloadActs,
    });
  }, [currentUser]);

  useEffect(() => {
    if (currentUserContext?.currentUser) setCurrentUser(currentUserContext?.currentUser);
    if (currentUserContext?.userRoles) setCurrentUserRoles(currentUserContext?.userRoles);
  }, [currentUserContext]);

  const reloadActs = () => {
    if (currentUser) {
      let criteria = [];
      criteria.push({
        fieldName: "status",
        operator: "!=",
        value: "done",
      });
      const offset = Number(1 - 1) * ACTS_LIMIT;

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

      const reqBody = {
        offset: offset,
        limit: ACTS_LIMIT,
        sortBy: ["-createdOn"],
        data: {
          criteria: [
            {
              operator: "and",
              criteria: criteria,
            },
          ],
        },
      };

      actStore.fetchActs(reqBody, "inProgress");
    }
  };

  return <ActsContext.Provider value={actsContext}>{children}</ActsContext.Provider>;
};
