export interface UserNewsAssetsType {
  id: number;
  version: number;
  fileName: string;
}

export interface UserNewsType {
  id: number;
  updatedOn: null;
  createdOn: Date;
  forWhom: string;
  version: number;
  pubTopic: string;
  pubStatus: string;
  selected: boolean;
  importOrigin: null;
  description: string;
  trackablePub: boolean;
  processInstanceId: null;
  importId: number | null;
  $wkfStatus: string | null;
  image: UserNewsAssetsType[];
  video: UserNewsAssetsType[];
  comment: Record<string, any>[];
  attachment: UserNewsAssetsType[];
  attrs: Record<string, any> | null;
  viewHistories: Record<string, any>[];
  createdBy: Record<string, any> | null;
  updatedBy: Record<string, any> | null;
}
