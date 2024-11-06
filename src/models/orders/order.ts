import { z } from "zod";
import { OrderPreferenceModel } from "@/models/orders/order-client-preference";
import { UserModel } from "@/models/user/user";
import { CurrencyModel } from "@/models/dictionaries/currency";

export const OrderModel = z.object({
  id: z.number().int().positive().optional(),
  soNumber: z.string().optional(),
  soStatus: z.string().optional(),
  preference: z.array(OrderPreferenceModel),
  clientPartner: UserModel,
  currency: CurrencyModel.optional(),
  saleOrderSeq: z.string().optional(),
  createdOn: z.string().optional(),
  total: z.string().optional(),
});

export type TOrderModel = z.infer<typeof OrderModel>;
