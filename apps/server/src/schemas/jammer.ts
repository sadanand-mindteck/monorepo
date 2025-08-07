import { z } from "zod"

export const jammerStatusEnum = z.enum([
  "ok",
  "faulty",
  "in_transit",
  "deployed",
  "maintenance",
]);

export const createJammerSchema = z.object({
  serialNumber: z.string().min(3, "Serial number must be at least 3 characters"),
  model: z.string().min(3, "Model must be at least 3 characters"),
  status: jammerStatusEnum.optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  currentLocationId: z.number().optional(),
})

export const updateJammerSchema = createJammerSchema.partial()

export const jammerQuerySchema = z.object({
  status: jammerStatusEnum.optional(),
  location: z.string().optional(),
  model: z.string().optional(),
  search: z.string().optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})
