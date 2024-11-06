export interface RemarkType {
  numPnr: string;
  operId: number;
  salesId: number;
  formOfPayment: string;
  status: string;
  remark: string;
  remOsh?: string;
  type?: number;
}

export interface RequestBodyType {
  translate?: string;
  offset?: number;
  sortBy?: string[];
  fields?: string[];
  data: RemarkType;
}

export interface FetchRemarkType {
  remark: string;
}

export interface StatusType {
  order_seq: number;
  title: string;
  value: string;
}

export interface OperSalesType {
  id: number;
  fullName: string;
  version: number;
}

export interface PaymentFormType {
  order_seq: number;
  title_ru: string;
  title_fr: string;
  title_en: string;
  title: string;
  value: string;
}

export interface Response<T> {
  status: number;
  data: T[];
}
