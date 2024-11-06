import { z } from "zod";

export const LanguageModel = z
  .object({
    id: z.number().int().positive(),
    name: z.string().trim(),
    code: z.string().trim(),
    "$t:name": z.string().trim().optional(),
  })
  .nullable()
  .optional();

export type TLanguageModel = z.infer<typeof LanguageModel>;
