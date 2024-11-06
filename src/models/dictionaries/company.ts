import { z } from "zod";

export const CompanyModel = z
  .object({
    id: z.number().int().positive().optional(),
    name: z.string().trim(),
    code: z.string().trim(),
  })
  .nullable()
  .optional();

export type TCompanyModel = z.infer<typeof CompanyModel>;
