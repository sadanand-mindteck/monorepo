import { positive, z } from 'zod';
import { files } from '@jims/db';
import { createSelectSchema, } from 'drizzle-zod';
import { pagination, querySchema, requestParamEntity } from './common';

export const fileSchema = createSelectSchema(files, {
  id: z.number().int().positive(),
  filename: z.string().min(1, "File name is required"),
  path: z.url("Invalid URL format"),
  size: z.number().int().positive("File size must be a positive integer"),
}).omit({ createdAt: true});
export const createFileSchema = fileSchema.omit({ id: true });
export const updateFileSchema = createFileSchema.partial();
export const fileResponse = z.object({
  data: fileSchema.array(),
  pagination,
});
export const entityType = fileSchema.shape.entityType;
export const fileQuerySchema = querySchema.extend({
  id:z.number().int().positive(),
  entityType,
  type:fileSchema.shape.type
})
  


export type File = z.infer<typeof fileSchema>;
export type FileInput = z.infer<typeof createFileSchema>;
export type UpdateFileInput = z.infer<typeof updateFileSchema>;
export type FileResponse = z.infer<typeof fileResponse>;
export type FileQuery = z.infer<typeof fileQuerySchema>;
export type FileType = z.infer<typeof fileSchema.shape.type>;
export type EntityType = z.infer< typeof fileSchema.shape.entityType>