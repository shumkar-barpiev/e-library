import { z } from "zod";
import { UserModel } from "@/models/user/user";
import { OrderModel } from "@/models/orders/order";

export const AppealModel = z.object({
  id: z.number().int().positive(),
  client: UserModel.optional(),
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  chat: z.any(),
  saleOrder: z
    .object({
      id: OrderModel.shape.id.nullable().optional(),
    })
    .nullable(),
  firstName: z.string().optional(),
  importOrigin: z.string().optional(),
  processInstanceId: z.string().optional(),
});

export type TAppealModel = z.infer<typeof AppealModel>;
