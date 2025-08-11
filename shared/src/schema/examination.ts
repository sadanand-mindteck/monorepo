import { createSelectSchema } from "drizzle-zod";
import {examinations} from "../db/schema.js";
import { z } from "zod";
import { pagination, querySchema } from "./common.js";

export const examinationSchema = createSelectSchema(examinations,{
  name:z.string(),
  examCode:z.string(),
  id:z.number().int().positive(),
  totalCenters:z.number().int().positive(),
  totalJammersRequired:z.number().int().positive()
});
export const createExaminationSchema = examinationSchema.omit({
  totalCenters: true,
  totalJammersRequired: true,
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});
export const examinationSchemaUpdate = createExaminationSchema.partial();
export const examinationResponse = z.object({
  data: examinationSchema.omit({ createdAt: true, updatedAt: true }).array(),
  pagination,
});
export const examinationQuerySchema = querySchema.extend({
    status: examinationSchema.shape.status.optional(),
})

export type Examination = z.infer<typeof examinationSchema>;
export type ExaminationInput = z.infer<typeof createExaminationSchema>;
export type ExaminationInputUpdate = z.infer<typeof examinationSchemaUpdate>;
export type ExaminationResponse = z.infer<typeof examinationResponse>;
export type ExaminationQuery = z.infer<typeof examinationQuerySchema>;