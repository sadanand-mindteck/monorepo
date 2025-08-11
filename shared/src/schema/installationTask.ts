import { installationTasks } from "../db/schema.js";
import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { pagination, querySchema } from "./common.js";

export const installationTaskSchema = createSelectSchema(installationTasks, {
  id: z.number().int().positive(),
  centerId: z.number().int().positive(),
  operatorId: z.number().int().positive(),
  gpsLatitude: z.number().min(-90).max(90).optional(),
  gpsLongitude: z.number().min(-180).max(180).optional(),
  notes: z.string().max(500).optional(),
  photoUrl: z.string().max(500).optional(),
}).omit({ updatedAt: true, createdAt: true });

export const createInstallationTaskSchema = installationTaskSchema.omit({id: true});
export const updateInstallationTaskSchema = createInstallationTaskSchema.partial();
export const installationTaskResponse = z.object({
  data: installationTaskSchema.array(),
  pagination,
});
export const installationTaskQuerySchema = querySchema.extend({
  status: installationTaskSchema.shape.status.optional(),
  taskType: installationTaskSchema.shape.taskType.optional(),
});

export type InstallationTask = z.infer<typeof installationTaskSchema>;
export type InstallationTaskInput = z.infer<typeof createInstallationTaskSchema>;
export type UpdateInstallationTaskInput = z.infer<typeof updateInstallationTaskSchema>;
export type InstallationTaskResponse = z.infer<typeof installationTaskResponse>;
export type InstallationTaskQuery = z.infer<typeof installationTaskQuerySchema>;
export type InstallationTaskType = z.infer<typeof installationTaskSchema.shape.taskType>;
export type InstallationTaskStatus = z.infer<typeof installationTaskSchema.shape.status>;
