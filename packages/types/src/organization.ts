import { createSelectSchema } from "drizzle-zod";
import { organizations } from "@jims/db";
import { z } from "zod";
import { pagination, querySchema } from "./common";

export const organizationSchema = createSelectSchema(organizations);
export const createOrganizationSchema = organizationSchema.omit({
  updatedAt: true,
  createdAt: true,
  id: true,
  isActive: true,
});
export const updateOrganizationSchema = organizationSchema.partial();
export const organizationResponse = z.object({
  data: organizationSchema.omit({ createdAt: true, updatedAt: true }).array(),
  pagination,
});
export const organizationQuerySchema = querySchema.extend({
  type: organizationSchema.pick({ type: true }).optional(),
});

export type Organization = z.infer<typeof organizationSchema>;
export type OrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type OrganizationResponse = z.infer<typeof organizationResponse>;
export type OrganizationQuery = z.infer<typeof organizationQuerySchema>;
