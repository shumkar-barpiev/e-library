import { z } from "zod";

export const CountryModel = z
  .object({
    id: z.number().int().positive().optional(),
    name: z.string().trim(),
  })
  .nullable()
  .optional();

export type TCountryModel = z.infer<typeof CountryModel>;
