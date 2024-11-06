import { z } from "zod";

export const CurrencyModel = z
  .object({
    id: z.number().int().positive().optional(),
    name: z.string().trim(),
    code: z.string().trim(),
    "$t:name": z.string().trim(),
  })
  .nullable()
  .optional();

export type TCurrencyModel = z.infer<typeof CurrencyModel>;
