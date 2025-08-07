import { z } from "zod";
import { examStatusEnum } from "../db/schema";
import { pagination } from "./common";

export const createExaminationSchema = z.object({
  name: z.string().min(3, "Examination name must be at least 3 characters"),
  examCode: z.string().min(3, "Exam code must be at least 3 characters"),
  examDate: z.coerce.date({ message: "Invalid date format" }),
  status: z.enum(["draft", "planning", "active", "completed", "cancelled"]).optional().nullable(),
});

export const examinationResponse = z.object({
  data: createExaminationSchema.extend({ id: z.number(), totalCenters: z.number(), totalJammersRequired: z.number() }).array(),
  pagination,
});

export const updateExaminationSchema = createExaminationSchema.partial();

export const createExamCenterSchema = z.object({
  examinationId: z.number(),
  name: z.string().min(3, "Center name must be at least 3 characters"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  jammersRequired: z.number().min(1, "At least 1 jammer is required"),
  assignedAgencyId: z.number().optional(),
  assignedOperatorId: z.number().optional(),
  reportingTime: z.string().optional(),
  examStartTime: z.string().optional(),
});

export const examinationQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(examStatusEnum.enumValues).optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});
