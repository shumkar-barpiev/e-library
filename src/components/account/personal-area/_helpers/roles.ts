export const SUBAGENTS_ROLES = ["Subagent"];
export const HR_ROLES = ["SpecialistHR", "ManagerHR"];
export const ACCOUNTANT_ROLES = ["Finance SUB", "SpecialistACC"];
export const SUB_MANAGERS_ROLES = ["SalesManager SUB", "Supervisior SUB"];
export const MANAGER_ROLES = ["ManagerHD", "MangerKCO", "ManagerCorp", "ManagerSuperRTL", "ManagerCCD"];
export const EXCLUDED_BONUS_ROLES = [
  "csh",
  "Cashier",
  "Accountant",
  "Finance SUB",
  "Cashier manager",
  "ChiefAccountant",
  "Account Manager",
];

export const AGENTS_ROLES = [
  "OperatorCCD",
  "SpecialistHD",
  "SpecialistRTL",
  "SpecialistKCO",
  "SpecialistCorp",
  "SalesSpecialistHD",
];

const hasRole = (user: Record<string, any> | null, roles: string[]): boolean => {
  if (user?.roles) return user.roles.some((role: { name: string }) => roles.includes(role?.name));

  return false;
};

export const isComponentAvailableForManagers = (user: Record<string, any> | null, roles: string[] | null): boolean => {
  if (!roles) return false;
  return hasRole(user, roles);
};

export const isComponentAvailableForSubagents = (user: Record<string, any> | null, roles: string[] | null): boolean => {
  if (!roles) return false;
  return hasRole(user, roles);
};

export const isComponentAvailableForAgents = (user: Record<string, any> | null, roles: string[] | null): boolean => {
  if (!roles) return false;
  return hasRole(user, roles);
};

export const isAdmin = (user: Record<string, any> | null): boolean => {
  if (user?.roles) return user.roles.some((role: { name: string }) => role?.name == "Admin");

  return false;
};

export const isSubManagers = (user: Record<string, any> | null, roles: string[] | null): boolean => {
  if (!roles) return false;
  return hasRole(user, roles);
};

export const isExcludedBonusUser = (user: Record<string, any> | null, roles: string[] | null): boolean => {
  if (!roles) return false;
  return hasRole(user, roles);
};

export const isAccountant = (user: Record<string, any> | null, roles: string[] | null): boolean => {
  if (!roles) return false;
  return hasRole(user, roles);
};

export const isHR = (user: Record<string, any> | null, roles: string[] | null): boolean => {
  if (!roles) return false;
  return hasRole(user, roles);
};

export const isChiefAccountant = (user: Record<string, any> | null): boolean => {
  if (user?.roles) return user.roles.some((role: { name: string }) => role?.name == "ChiefAccountant");

  return false;
};
