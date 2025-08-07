import { createSelectSchema } from "drizzle-zod";
import {examinations} from "@jims/db";
import { z } from "zod";
import { pagination, querySchema } from "./common";

export const examinationSchema = createSelectSchema(examinations);
export const createExaminationSchema = examinationSchema.omit({
  totalCenters: true,
  totalJammersRequired: true,
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});
export const updateExaminationSchema = examinationSchema.partial();
export const examinationResponse = z.object({
  data: examinationSchema.omit({ createdAt: true, updatedAt: true }).array(),
  pagination,
});
export const examinationQuerySchema = querySchema.extend({
    status: examinationSchema.pick({status:true}).optional(),
})

export type Examination = z.infer<typeof examinationSchema>;
export type ExaminationInput = z.infer<typeof createExaminationSchema>;
export type UpdateExaminationInput = z.infer<typeof updateExaminationSchema>;
export type ExaminationResponse = z.infer<typeof examinationResponse>;
export type ExaminationQuery = z.infer<typeof examinationQuerySchema>;