import { z } from "zod";
import { CurrencyModel } from "../dictionaries/currency";
import { ServiceModel } from "../dictionaries/service";

export const ProductModel = z.object({
  id: z.number().int().positive().optional(),
  tNumber: z.string().trim().optional(),
  name: z.string().trim().optional(),
  pSurname: z.string().trim().optional(),
  resNumber: z.string().trim().optional(),
  pnrNumber: z.string().trim().optional(),
  numberInvoice: z.string().trim().optional(),
  service: z.optional(ServiceModel),
  route: z.string().trim().optional(),
  unitPrice: z.number().positive().optional(),
  reservation: z.string().trim().nullable().optional(),
  preOrderFromTo: z.string().trim().nullable().optional(),
  unitPriceCur: CurrencyModel,
});

export type TProductModel = z.infer<typeof ProductModel>;
