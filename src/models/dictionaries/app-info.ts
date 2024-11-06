import { z } from "zod";

export const AppInfoModel = z.object({
  "user.id": z.number().int().positive().optional(),
});

export type TAppInfoModel = z.infer<typeof AppInfoModel>;
