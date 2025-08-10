import { z } from 'zod';
import { entityType } from './file';


export const requestParam = z.object({ id: z.string() });
export const requestParamEntity = z.object({ id: z.string(),entityType,  });
export const requestParamLimit = z.object({ limit: z.number().int().positive() });
export const pagination = z.object({ page: z.number(), limit: z.number(), total: z.number(), pages: z.number() });
export const querySchema = z.object({
  search: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});