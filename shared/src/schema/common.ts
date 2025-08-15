import { z } from 'zod';
import { entityType } from './file.js';


export const requestParam = z.object({ id: z.string() });
export const requestParamEntity = z.object({ id: z.string(),entityType,  });
export const requestParamLimit = z.object({ limit: z.number().int().positive() });
export const pagination = z.object({ page: z.number(), limit: z.number(), total: z.number(), pages: z.number() });
export const querySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});
export const getDataPagination=  z.object({ page: z.string().optional(), limit: z.string().optional(), search:z.string().optional(),  status: z.string().optional(), });
export const getDataPaginationUser=  getDataPagination.extend({role: z.string().optional()});

export type GetDataPagination = z.infer<typeof getDataPagination>;
export type GetDataPaginationUser = z.infer<typeof getDataPaginationUser>;