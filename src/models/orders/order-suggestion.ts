import { z } from "zod";

export const OrderSuggestionModel = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().optional(),
});

export type TOrderSuggestionModel = z.infer<typeof OrderSuggestionModel>;
