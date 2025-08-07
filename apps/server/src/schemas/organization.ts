import { z } from "zod"
import { organizationTypeEnum } from "../db/schema"

export const OrganizationTypeEnum = z.enum(organizationTypeEnum.enumValues)

export const createOrganizationSchema = z.object({
  name: z.string().min(3, "Organization name must be at least 3 characters"),
  type: OrganizationTypeEnum,
  location: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  capacity: z.string().optional(),
})

export const organizationQuerySchema = z.object({
  search: z.string().optional(),
  type: OrganizationTypeEnum.optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

export const updateOrganizationSchema = createOrganizationSchema.partial()
