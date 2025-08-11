import { shipments } from "@jims/db";
import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { pagination, querySchema } from "./common";

export const shipmentSchema = createSelectSchema(shipments, {
  id: z.number().int().positive(),
  shipmentCode: z.string().min(1, "Shipment code is required"),
  fromLocationId: z.number().int().positive(),
  toLocationId: z.number().int().positive(),
  toCenterId: z.number().int().positive().optional(),
  docketNumber: z.string().max(100).optional(),
  totalJammers: z.number().int().min(0, "Total jammers must be a non-negative integer"),
}).omit({ updatedAt: true, createdAt: true });

export const createShipmentSchema = shipmentSchema.omit({
  id: true,
  createdBy: true,
  status: true,
  shipmentCode: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  jammerIds:z.array(z.number().int().positive())
});

export const updateShipmentSchema = shipmentSchema.pick({
  status: true,
  dispatchedAt: true,
  deliveredAt: true,
});

export const shipmentResponse = z.object({
  data: shipmentSchema.array(),
  pagination,
});
export const shipmentQuerySchema = querySchema.extend({
  status: shipmentSchema.shape.status.optional(),
});

export type Shipment = z.infer<typeof shipmentSchema>;
export type ShipmentInput = z.infer<typeof createShipmentSchema>;
export type ShipmentInputUpdate = z.infer<typeof updateShipmentSchema>;
export type ShipmentResponse = z.infer<typeof shipmentResponse>;
export type ShipmentQuery = z.infer<typeof shipmentQuerySchema>;
export type ShipmentStatus = z.infer<typeof shipmentSchema.shape.status>;
