import { examCenters } from "@jims/db";
import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { pagination, querySchema } from "./common";

export const examCenterSchema = createSelectSchema(examCenters, {
  id: z.number().int().positive(),
  examinationId: z.number().int().positive().optional(),
  assignedOperatorId:z.number().int().positive().optional(),
  address:z.string(),
  name: z.string().min(1, "Name is required"),
  latitude: z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),
  longitude: z.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180"),
  jammersRequired: z.number().int().min(0, "Jammers required must be a non-negative integer"),
  assignedAgencyId: z.number().int().positive(),
  reportingTime: z.coerce.date(),
  examStartTime: z.coerce.date(),
}).omit({ updatedAt: true, createdAt: true, });

export const createExamCenterSchema = examCenterSchema.omit({ id: true });
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