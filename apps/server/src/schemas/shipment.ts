import { z } from "zod"
import { organizationTypeEnum, shipmentStatusEnum } from "../db/schema"

export const ShipmentStatusSchema = z.enum(shipmentStatusEnum.enumValues)

export const createShipmentSchema = z.object({
  shipmentCode: z.string().max(50),
  fromLocationId: z.number().int().positive(),
  toLocationId: z.number().int().positive(),
  toCenterId: z.number().int().positive(),
  status: ShipmentStatusSchema.optional().default("pending"),
  docketNumber: z.string().max(100).optional(),
  jammerIds: z.array(z.number().int().positive()).min(1, "At least one jammer is required"),
  createdBy: z.number().int().positive(),
  dispatchedAt: z.coerce.date().optional(),
  deliveredAt: z.coerce.date().optional(),
});

export const updateShipmentSchema = z.object({
  shipmentCode: z.string().max(50).optional(),
  fromLocationId: z.number().int().positive().optional(),
  toLocationId: z.number().int().positive().optional(),
  toCenterId: z.number().int().positive().optional(),
  status: ShipmentStatusSchema.optional(),
  docketNumber: z.string().max(100).optional(),
  totalJammers: z.number().int().min(0).optional(),
  dispatchedAt: z.coerce.date().optional(),
  deliveredAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(), // If client is setting this
});


export const updateShipmentStatusSchema = z.object({
  status: ShipmentStatusSchema,
  dispatchedAt: z.coerce.date().optional(),
  deliveredAt: z.coerce.date().optional(),
});

export const shipmentQuerySchema = z.object({
  status: ShipmentStatusSchema.optional(),
  fromLocationId: z.string().optional(), // If from query params
  toLocationId: z.string().optional(),
  toCenterId: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(), // for shipmentCode or docketNumber
});

