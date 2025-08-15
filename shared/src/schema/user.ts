import { users } from "../db/schema.js";
import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { pagination, querySchema } from "./common.js";

export const userSchema = createSelectSchema(users, {
  id: z.number().int().positive(),
  email: z.email("Invalid email format").min(1, "Email is required"),
  name: z.string().min(1, "Name is required"),
  emailVerified: z.boolean().default(false),
  phoneVerified: z.boolean().default(false),
  organizationId: z.string(),
}).omit({ password: true, mfaSecret: true, updatedAt: true, createdAt: true });

export const createUserSchema = userSchema.omit({
  id: true,
  emailVerified: true,
  phoneVerified: true,
  isActive: true,
  lastLogin: true,
  createdBy: true,
});
export const userSchemaUpdate = userSchema.partial();
export const userResponse = z.object({
  data: userSchema.array(),
  pagination,
});
export const userRole = userSchema.shape.role;
export const userQuerySchema = querySchema.extend({
  role: userSchema.shape.role.optional(),
  isActive: userSchema.shape.isActive.optional(),
});

export type User = z.infer<typeof userSchema>;
export type UserInput = z.infer<typeof createUserSchema>;
export type UserInputUpdate = z.infer<typeof userSchemaUpdate>;
export type UserResponse = z.infer<typeof userResponse>;
export type UserQuery = z.infer<typeof userQuerySchema>;
export type UserRole = z.infer<typeof userRole>;
