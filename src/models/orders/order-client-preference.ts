import { z } from "zod";

interface IBase {
  id: number;
  name: string;
  "$t:name"?: string;
  parent?: IBase;
  isChild?: boolean;
}

interface ISpecificChild extends IBase {
  children?: Array<ISpecificChild>;
}

export const OrderPreferenceModel: z.ZodType<IBase> = z.object({
  id: z.number().int().positive(),
  name: z.string().trim(),
  "$t:name": z.string().trim().optional(),
  isChild: z.boolean().optional().default(false),
});

const specificChildSchema: z.ZodType<ISpecificChild> = OrderPreferenceModel.and(
  z.object({
    children: z.tuple([]),
  })
);

export const OrderClientPreferenceModel: z.ZodType<ISpecificChild> = OrderPreferenceModel.and(
  z.object({
    children: z
      .union([specificChildSchema, z.lazy(() => OrderClientPreferenceModel)])
      .array()
      .optional(),
  })
);

export type TOrderClientPreferenceModel = z.infer<typeof OrderClientPreferenceModel>;
