"use client";

import { enqueueSnackbar } from "notistack";
import { TUserModel } from "@/models/user/user";
import { useUserStore } from "@/stores/users/users";
import { useAxelorStore } from "@/stores/axelor/axelor";
import {
  isHR,
  isAdmin,
  isAccountant,
  isSubManagers,
  isChiefAccountant,
  isExcludedBonusUser,
  isComponentAvailableForAgents,
  isComponentAvailableForManagers,
  isComponentAvailableForSubagents,
} from "@/components/account/personal-area/_helpers/roles";
import { useUserActsStore } from "@/stores/personal-area/acts/acts";
import React, { useState, useEffect, ReactNode, createContext } from "react";

export type RolesType = {
  isHR: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  isManager: boolean;
  isSubagent: boolean;
  isSubManager: boolean;
  isAccountant: boolean;
  isChiefAccountant: boolean;
  isExcludedBonusUser: boolean;
};

type CurrentUserType = {
  currentUserId?: number;
  actsCounter?: number | null;
  userRoles?: RolesType | null;
  reloadCurrentUser?: () => void;
  currentUserProfileImage?: string | null;
  currentUser?: Record<string, any> | null;
  reloadActsCounter?: (id: number) => void;
} | null;

export const CurrentUserContext = createContext<CurrentUserType | null>(null);

export const CurrentUserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const userStore = useUserStore();
  const actStore = useUserActsStore();
  const axelorStore = useAxelorStore();
  const [actsCounter, setActsCounter] = useState<number | null>(null);
  const [roles, setRoles] = useState<Record<string, any> | null>(null);
  const [currentUserContext, setCurrentUserContext] = useState<CurrentUserType>(null);

  const getCurrentUserIdCallback = (data: Record<string, any>) => {
    if (data.status === 0) {
      const userId = data?.data?.id ?? null;
      if (userId) {
        reloadActsCounter(userId);
        let user: TUserModel | null;
        let userRoles: RolesType | null;
        let profileImage: string | null;
        let promises: Promise<void>[] = [];

        promises.push(
          userStore.fetchUser(userId, (data: Record<string, any>) => {
            if (data.status === 0) {
              user = data.data[0];
              userRoles = {
                isHR: isHR(data.data[0], roles?.hr),
                isAdmin: isAdmin(data.data[0]),
                isChiefAccountant: isChiefAccountant(data.data[0]),
                isAccountant: isAccountant(data.data[0], roles?.accountant),
                isSubManager: isSubManagers(data.data[0], roles?.subManager),
                isAgent: isComponentAvailableForAgents(data.data[0], roles?.agent),
                isExcludedBonusUser: isExcludedBonusUser(data.data[0], roles?.exclude),
                isManager: isComponentAvailableForManagers(data.data[0], roles?.manager),
                isSubagent: isComponentAvailableForSubagents(data.data[0], roles?.subAgent),
              };
            }
          })
        );

        promises.push(
          userStore.fetchUserProfileImage(userId, (data: string) => {
            if (!!data) profileImage = data;
          })
        );

        Promise.all(promises)
          .then(() => {
            setCurrentUserContext({
              currentUser: user,
              userRoles: userRoles,
              currentUserId: userId,
              actsCounter: actsCounter,
              reloadCurrentUser: reloadCurrentUser,
              reloadActsCounter: () => reloadActsCounter(userId),
              currentUserProfileImage: profileImage,
            });
          })
          .catch((error) => {
            console.error("Error in CurrentUserProvider", error);
          });
      }
    } else {
      enqueueSnackbar("Что то пошло не так", { variant: "error" });
    }
  };

  const reloadCurrentUser = () => {
    userStore.getCurrentUserId(getCurrentUserIdCallback);
  };

  const reloadActsCounter = (id: number) => {
    actStore.fetchNewCreatedActsCount(id, (data: Record<string, any>) => {
      if (data.status === 0) {
        setActsCounter(data.total);
      } else {
        setActsCounter(null);
      }
    });
  };

  useEffect(() => {
    setCurrentUserContext({
      ...currentUserContext,
      actsCounter: actsCounter,
    });
  }, [actsCounter]);

  useEffect(() => {
    userStore.getCurrentUserId(getCurrentUserIdCallback);
  }, [roles]);

  useEffect(() => {
    axelorStore.fetchConfig().then((resp: Record<string, any> | null) => {
      if (resp?.roles) setRoles(resp?.roles);
    });
  }, []);

  return <CurrentUserContext.Provider value={currentUserContext}>{children}</CurrentUserContext.Provider>;
};
