import {
entityParamsSchema,
getFilesQuerySchema
} from "../schemas/files"
import { z } from "zod"

export type GetFilesQuery = z.infer<typeof getFilesQuerySchema>;
export type EntityParams = z.infer<typeof entityParamsSchema>;
