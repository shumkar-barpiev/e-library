import { z } from "zod";
import { CurrencyModel } from "@/models/dictionaries/currency";
import { LanguageModel } from "@/models/dictionaries/language";

export const AxelorConfigModel = z.object({
  defaultStatusSaleOrderLine: z.string(),
  defaultCurrencySaleOrderLine: CurrencyModel,
  defaultLanguageSaleOrderLine: LanguageModel,
  chatLimit: z.string(),
});

export type TAxelorConfigModel = z.infer<typeof AxelorConfigModel>;
