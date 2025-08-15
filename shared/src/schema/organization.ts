import { createSelectSchema } from "drizzle-zod";
import { organizations } from "../db/schema.js";
import { z } from "zod";
import { pagination, querySchema } from "./common.js";

export const organizationSchema = createSelectSchema(organizations, {
  id: z.number().int().positive(),
  name: z.string().min(1, "Organization name is required"),
  address: z.string().min(1, "Address is required").optional(),
  contactPhone: z.string().min(1, "Contact number is required").optional(),
  contactEmail: z.email("Invalid email format").optional(),
  isActive: z.boolean().default(true),
  capacity: z.number().int().positive(),
}).omit({ updatedAt: true, createdAt: true });
export const createOrganizationSchema = organizationSchema.omit({
  id: true,
  isActive: true,
});
export const updateOrganizationSchema = organizationSchema.partial();
export const organizationResponse = organizationSchema.array();
export const organizationQuerySchema = querySchema.extend({
  type: organizationSchema.shape.type.optional(),
});

export type Organization = z.infer<typeof organizationSchema>;
export type OrganizationInput = z.infer<typeof createOrganizationSchema>;
export type OrganizationInputUpdate = z.infer<typeof updateOrganizationSchema>;
export type OrganizationResponse = z.infer<typeof organizationResponse>;
export type OrganizationQuery = z.infer<typeof organizationQuerySchema>;
