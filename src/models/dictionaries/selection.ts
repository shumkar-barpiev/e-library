import { z } from "zod";

export const SelectionModel = z
  .object({
    id: z.number().int().positive().optional(),
    title: z.string().trim(),
    value: z.string().trim(),
    title_kg: z.string().trim().optional(),
    title_ru: z.string().trim().optional(),
  })
  .nullable()
  .optional();

export type TSelectionModel = z.infer<typeof SelectionModel>;
