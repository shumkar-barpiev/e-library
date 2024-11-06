export interface ShiftType {
  order_seq: number;
  title_ru: string;
  title: string;
  value: string;
}

export interface CashierType {
  code: string;
  id: number;
  name: string;
}

export interface CurrencyType {
  "$t:name": string;
  code: string;
  name: string;
  id: number;
  isBase: boolean;
}

export interface CurrentUserIdType {
  id: number;
}
export interface CurrentUserType {
  id: number;
  activeCompany: {
    code: string;
    name: string;
    id: number;
  };
}

export interface AirlineCompanyType {
  id: number;
  code: string;
  version: number;
  name: string;
  $wkfStatus: unknown;
}

export interface ShiftRequestType {
  translate: boolean;
}

export interface GetOrderNumType {
  airlineId: number;
  shiftId: number;
}

export interface OrderNumResponseType {
  electronicSequenceId: number;
  numberInvoice: string;
}

export interface Response<T = any> {
  data: T[];
  object?: any;
  total?: number;
  status: number;
  offset?: number;
  codeStatus?: number;
  messageStatus?: string;
}
