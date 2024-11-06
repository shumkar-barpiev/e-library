import { z } from "zod";
// success: true

export const OrderUserTaskModel = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim(),
  deadline: z.date(),
  isComplete: z.boolean().default(false),
});

export type TOrderUserTaskModel = z.infer<typeof OrderUserTaskModel>;
