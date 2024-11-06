import { z } from "zod";
import { ProductModel } from "../products/product";
import { OrderModel } from "./order";
import { CurrencyModel } from "../dictionaries/currency";
import { OrderDetailOcrImageModel } from "@/models/orders/order-detail-ocr-image";
import { ServiceModel } from "@/models/dictionaries/service";

export const OrderDetailModel = z.object({
  id: z.number().int().positive().optional(),
  qty: z.number().int().positive().optional(),
  listPrice: z.number().positive().optional(),
  unitPrice: z.number().positive().optional(),
  description: z.string().trim().optional(),
  productName: z.string().trim(),
  numberInvoice: z.string().trim().optional(),
  status: z.string().trim().nullable().optional(),
  listPriceCur: CurrencyModel,
  saleOrder: OrderModel.pick({ id: true }),
  product: ProductModel,
  service: ServiceModel,
  ocrImage: z.array(OrderDetailOcrImageModel).optional(),
});

export type TOrderDetailModel = z.infer<typeof OrderDetailModel>;
