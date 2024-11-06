import { z } from "zod";
import { CurrencyModel } from "./currency";
import { ServiceModel } from "./service";

export const SettingsModel = z
  .object({
    id: z.number().int().positive().optional(),
    defaultAccountant: z.optional(z.object({ id: z.number().int().positive().optional() })),
    defaultCurrencySaleOrderLine: z.optional(CurrencyModel),
    defaultStatusSaleOrderLine: z.string().trim().optional(),
    serviceForProductSelector: z.optional(ServiceModel),
  })
  .nullable()
  .optional();

export type TSettingsModel = z.infer<typeof SettingsModel>;
