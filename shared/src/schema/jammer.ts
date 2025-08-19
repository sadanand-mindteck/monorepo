import { createSelectSchema } from "drizzle-zod";
import { jammers } from "../db/schema.js";
import { z } from "zod";
import { pagination, querySchema } from "./common.js";
import { organizationSchema } from "./organization.js";

export const jammerSchema = createSelectSchema(jammers, {
  serialNumber: z.string().min(1, "Serial number is required"),
  model: z.string().min(1, "Model is required"),
  currentLocationId: z.string().nullable(),
  lastMaintenance: z.date().nullable().optional(),
  assignedCenterId: z.number().optional(),
}).omit({ updatedAt: true, createdAt: true });
export const createJammerSchema = jammerSchema.omit({
  id: true,
  createdBy: true,
});
export const updateJammerSchema = createJammerSchema.partial();
export const jammerResponse = z.object({
  data: jammerSchema.extend({ locationName: z.string(), orgType: organizationSchema.shape.type }).array(),
  pagination,
});
export const jammerQuerySchema = querySchema.extend({
  status: jammerSchema.shape.status.optional(),
  model: jammerSchema.shape.model.optional(),
});

export type Jammer = z.infer<typeof jammerSchema>;
export type JammerInput = z.infer<typeof createJammerSchema>;
export type JammerInputUpdate = z.infer<typeof updateJammerSchema>;
export type JammerResponse = z.infer<typeof jammerResponse>;
export type JammerQuery = z.infer<typeof jammerQuerySchema>;
export type JammerStatus = z.infer<typeof jammerSchema.shape.status>;
