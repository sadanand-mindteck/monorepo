import {
ShipmentStatusSchema,
createShipmentSchema,
updateShipmentSchema,
updateShipmentStatusSchema,
shipmentQuerySchema
} from "../schemas/shipment"
import { z } from "zod"

export type ShipmentInput = z.infer<typeof createShipmentSchema>
export type ShipmentUpdate = z.infer<typeof updateShipmentStatusSchema>
export type ShipmentStatus = z.infer<typeof ShipmentStatusSchema>
export type ShipmentQuery = z.infer<typeof shipmentQuerySchema>
export type UpdateShipmentInput = z.infer<typeof updateShipmentSchema>