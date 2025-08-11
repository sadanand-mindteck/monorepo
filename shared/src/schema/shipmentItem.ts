import {shipmentItems} from "../db/schema.js"
import {z} from "zod"
import { createSelectSchema } from "drizzle-zod"
import {pagination, querySchema} from "./common.js"

export const shipmentSchema = createSelectSchema(shipmentItems,{
    id: z.number().int().positive(),
    shipmentId: z.number().int().positive(),
    jammerId: z.number().int().positive(),

}).omit({createdAt: true });

export const createShipmentSchema = shipmentSchema;
export const updateShipmentSchema = shipmentSchema.partial();
export const shipmentResponse = z.object({data: shipmentSchema.array(), pagination })
export const shipmentQuerySchema = querySchema;

export type Shipment = z.infer<typeof shipmentSchema>;
export type ShipmentInput = z.infer<typeof createShipmentSchema>;   
export type UpdateShipmentInput = z.infer<typeof updateShipmentSchema>;
export type ShipmentResponse = z.infer<typeof shipmentResponse>;
export type ShipmentQuery = z.infer<typeof shipmentQuerySchema>;