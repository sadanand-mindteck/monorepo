import { createSelectSchema } from "drizzle-zod";
import { jammers } from "@jims/db";
import { z } from "zod";
import { pagination, querySchema } from "./common";

export const jammerSchema = createSelectSchema(jammers,{
  serialNumber: z.string().min(1, "Serial number is required"),
  model: z.string().min(1, "Model is required"),
  currentLocationId: z.number(),
  assignedCenterId: z.number(),
  
});
export const createJammerSchema = jammerSchema.omit({
  updatedAt: true,
  createdAt: true,
  id: true,
});
export const updateJammerSchema = jammerSchema.partial();
export const jammerResponse = z.object({
  data: jammerSchema.omit({ createdAt: true, updatedAt: true }).array(),
  pagination,
});
export const jammerQuerySchema = querySchema.extend({
  status: jammerSchema.pick({ status: true }).optional(),
});

export type Jammer = z.infer<typeof jammerSchema>;
export type JammerInput = z.infer<typeof createJammerSchema>;
export type UpdateJammerInput = z.infer<typeof updateJammerSchema>;
export type JammerResponse = z.infer<typeof jammerResponse>;
export type JammerQuery = z.infer<typeof jammerQuerySchema>;
