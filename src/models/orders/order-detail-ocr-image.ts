import { z } from "zod";

export const OrderDetailOcrImageModel = z.object({
  id: z.number().int().positive().optional(),
  filename: z.string().trim().optional(),
});

export type TOrderDetailOcrImageModel = z.infer<typeof OrderDetailOcrImageModel>;
