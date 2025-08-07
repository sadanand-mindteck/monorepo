import {
createOrganizationSchema,
updateOrganizationSchema,
organizationQuerySchema,
OrganizationTypeEnum,
} from "../schemas/organization"
import { z } from "zod"

export type OrganizationInput = z.infer<typeof createOrganizationSchema>
export type OrganizationUpdate = z.infer<typeof updateOrganizationSchema>
export type OrganizationQuery = z.infer<typeof organizationQuerySchema>
export type OrganizationType = z.infer<typeof OrganizationTypeEnum>


