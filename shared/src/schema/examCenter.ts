import { examCenters } from "../db/schema.js";
import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { pagination, querySchema } from "./common.js";

export const examCenterSchema = createSelectSchema(examCenters, {
  id: z.number().int().positive(),
  examinationId: z.string(),
  assignedOperatorId: z.string(),
  address: z.string(),
  name: z.string().min(1, "Name is required"),
  jammersRequired: z.number().int().min(0, "Jammers required must be a non-negative integer"),
  assignedAgencyId: z.string(),
  examStartTime: z.string(),
  reportingTime: z.string(),
}).omit({ updatedAt: true, createdAt: true });

export const createExamCenterSchema = examCenterSchema.omit({ id: true, createdBy: true });
export const updateExamCenterSchema = createExamCenterSchema.partial();

export const examCenterResponse = z.object({
  data: examCenterSchema.array(),
  pagination,
});
export const examCenterQuerySchema = querySchema;

export type ExamCenter = z.infer<typeof examCenterSchema>;
export type ExamCenterInput = z.infer<typeof createExamCenterSchema>;
export type UpdateExamCenterInput = z.infer<typeof updateExamCenterSchema>;
export type ExamCenterResponse = z.infer<typeof examCenterResponse>;
export type ExamCenterQuery = z.infer<typeof examCenterQuerySchema>;
