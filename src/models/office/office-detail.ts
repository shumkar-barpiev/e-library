import { z } from "zod";

export const OfficeModel = z.object({
  id: z.number().int().positive(),
  name: z.string().optional(),
});

export type TOfficeModel = z.infer<typeof OfficeModel>;
