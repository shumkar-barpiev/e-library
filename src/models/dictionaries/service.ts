import { z } from "zod";

const BaseServiceModel = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().optional(),
  type: z.string().trim().optional(),
  "$t:name": z.string().trim().optional(),
});

export const ServiceModel = BaseServiceModel.extend({
  parent: z.optional(BaseServiceModel),
})
  .nullable()
  .optional();

export type TServiceModel = z.infer<typeof ServiceModel>;
