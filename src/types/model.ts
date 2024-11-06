export type TCriteria = {
  fieldName: string;
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "like" | "notLike" | "between" | "notBetween" | "isNull" | "notNull";
  value?: string | number | boolean | null;
  value2?: string | number | boolean | null;
};

export type TCriteriaList = {
  operator: "and" | "or" | "not";
  criteria: (TCriteria | TCriteriaList)[];
};

export type TModelFilters = {
  page?: number;
  pageSize?: number;
  translate?: boolean;
  sortBy?: string[];
  fields?: string[];
  criteria?: (TCriteria | TCriteriaList)[];
} | null;
