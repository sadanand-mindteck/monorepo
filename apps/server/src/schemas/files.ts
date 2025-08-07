import { z } from "zod";
import { fileTypeEnum } from "../db/schema";

export const FileTypeEnum = z.enum(fileTypeEnum.enumValues);

export const entityParamsSchema = z.object({
  entityType: z.string(),
  entityId: z.string(),
});

export const getFilesQuerySchema = z.object({
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  type: FileTypeEnum.optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});


