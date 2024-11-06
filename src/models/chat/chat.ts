interface messageAuthorType {
  fullName: string;
  id: number;
  $version: number;
}

interface latestTransferType {
  fromTr: {
    code: string;
    fullName: string;
    id: number;
    version: number;
  };
  id: number;
  toTr: [];
  version: number;
}
interface AppealType {
  id: number;
  $version: number;
  status: number;
  firstName: string;
  name: string;
  importOrigin: string;
  processInstanceId: string;
  phoneNumber: string;
  latestTransfer?: latestTransferType;
  transfer?: latestTransferType[];
  client: {
    id: number | null;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    fullName: string | null;
    mobilePhone: string | null;
  };
}
export interface ContactlastMessage {
  id: number;
  body: string;
  timestamp: number;
  messageAuthor: messageAuthorType | null;
  type: any;
  status: messageStatusType;
  fileName: string;
  appealType: appelTypeEnum;
}

export interface ColleaguesModel {
  id: number;
  code: string;
  fullName: string;
  collegaId: number;
  lastMessage: ContactlastMessage | null;
  unreadMessageCount: number;
  status: string;
  isTyping: MemberType[];
}

export interface ClientType {
  id: number;
  appealId: number;
  fullName: string;
  phoneNumber: string;
  lastMessage: ContactlastMessage | null;
  unreadMessageCount: number;
  commentary: string;
  appeal?: AppealType | null;
  isTyping: MemberType[];
  members: {
    code: string;
    fullName: string;
    id: number;
    version: number;
  }[];
  completedUsers: {
    code: string;
    fullName: string;
    id: number;
    version: number;
  }[];
}

export enum ChatMessageType {
  CURRENT_USER,
  CLIENT,
  USER,
}

export enum messageTypeEnum {
  TEXT = "TEXT",
  TODAY = "TODAY",
  DATE = "DATE",
  IMAGE = "IMAGE",
  DOCUMENT = "DOCUMENT",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
  TEMPLATE = "TEMPLATE",
  TRANSFER = "TRANSFER",
  CALL = "CALL",
  COMMENTARY = "COMMENTARY",
}

export enum messageStatusType {
  sent = "sent",
  delivered = "delivered",
}

export enum appelTypeEnum {
  whatsapp = "whatsapp",
  instagram = "instagram",
  telegram = "telegram",
  call = "call",
}
export interface TransferType {
  id: number;
  fromTr: {
    id: number;
    fullName: string;
    code: string;
  };
  toTr: [
    {
      id: number;
      fullName: string;
      code: string;
    },
  ];
}
export interface TransferToTrType {
  name: string;
  fullName: string;
  id: number;
}
export interface MessageType {
  author: ChatMessageType;
  fileName: string;
  appeal: AppealType | null;
  appealType: appelTypeEnum | null;
  type: messageTypeEnum;
  body: string;
  version?: number;
  $wkfStatus?: string | null;
  fromNumber: string;
  fileSize: string;
  chat: {
    id: number;
    $version: number;
  };
  messageAuthor?: {
    fullName: string;
    id: number;
    $version: number;
  };
  id: number;
  messageSecretKey: string;
  fileType: string;
  fileId: string;
  timestamp: number;
  flags: {
    id: number;
    isRead: boolean;
    userId: number;
    version: 0;
  }[];
  ["transfer.fromTr"]?: {
    fullName: string;
    id: number;
  };
  ["toTr"]?: TransferToTrType[];
  status: messageStatusType;
  prevMessageSecretKey: string | null;
  prevMessageId: number | null;
  caption: string | null;
  ["messageCall.id"]: number | null;
  ["messageCall.type"]: string | null;
  ["messageCall.status"]: string | null;
  ["messageCall.recordId"]: string | null;
  ["messageCall.duration"]: number | null;
  ["messageCall.user"]: {
    fullName: string;
    id: number;
    $version: number;
  } | null;
  callResponsible?: {
    name: string;
    fullName: string;
    id: number;
  }[];
  prevAnswerMessage?: MessageType;
}

export type ChatBoxProps = {
  order?: boolean;
};

export type templateButton = {
  id: number;
  type: string;
  text: string;
  textLngError: boolean;
  textEmpty: boolean;
  phone_number?: string;
  phone_number_error?: boolean;
  url?: string;
  urlError?: boolean;
};

export type chatStoresEvent = {
  event: string;
  data: {};
};

export type MemberType = {
  code: string;
  fullName: string;
  id: number;
  $version: number;
};

export type chatType = {
  fromNumber?: string;
  id: number | null;
  typeChats?: string;
  members?: MemberType[];
  chatSeans?: true;
  version?: 0;
  phoneNumberId?: string;
  phoneNumber?: string;
  name?: string;
  $wkfStatus?: any;
  commentary?: string | null;
  completedUsers?: {
    code: string;
    fullName: string;
    id: number;
    version: number;
  }[];
  fullName: string;
  appeal?: AppealType | null;
  saleOrder?: {
    fullName: string;
    id: number;
    soStatus: string;
    version: number;
  } | null;
  isTyping: MemberType[];
} | null;

export type contactType = {
  linkedUser?: {
    fullName: string;
    id: number;
    $verison: number;
  };
  companyDepartment: {
    name: string;
    id: number;
    $version: number;
  };
  status: string;
  checked: false;
  id: number;
  version: number;
};

export type addChatContactsType = {
  [key: string]: contactType[];
};

export type clientContactType = {
  id: number;
  name: string;
  phoneNumber: string;
  "client.id": number;
  "client.name": string;
  "client.fullName": string;
  "client.mobilePhone": string;
};

export type templateType = {
  id: number;
  name: string;
  header: string | null;
  body: string;
  footer: string | null;
  language: string;
  status: any;
  category: string;
  buttons: templateButton[] | null;
};

export type departMentType = {
  code: string;
  name: string;
  id: number;
  checked: boolean;
  version: number;
};

export enum httpStatusEnum {
  loading = "loading",
  success = "success",
  error = "error",
  noStatus = "noStatus",
}

export enum statusMessageEnum {
  createTemplate = "createTemplate",
  updateTemplate = "updateTemplate",
  deleteTemplate = "deleteTemplate",
  noStatus = "",
}

export enum successMessageEnum {
  createTemplate = "Успешно создано",
  updateTemplate = "Успешно сохранено",
  deleteTemplate = "Успешно удалено",
}

export enum errorMessageEnum {}
