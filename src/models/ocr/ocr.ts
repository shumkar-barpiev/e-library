import { z } from "zod";

export const OcrChatModel = z.object({
  airport: z.string().optional(),
  arrivalDate: z.string().optional(),
  arrivalTime: z.string().optional(),
  cost: z.number().optional(),
  currency: z.string().optional(),
  departureDate: z.string().optional(),
  departureTime: z.string().optional(),
  operator: z.string().optional(),
});

export type TOcrChatModel = z.infer<typeof OcrChatModel>;
