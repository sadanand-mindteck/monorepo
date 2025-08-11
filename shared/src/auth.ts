import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { users } from "@jims/db";

export const userSchema = createSelectSchema(users, {
  id: z.number().int().positive(),
  email: z.email("Invalid email format").min(1, "Email is required"),
  name: z.string().min(1, "Name is required"),
  emailVerified: z.boolean().default(false),
  phoneVerified: z.boolean().default(false),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  organizationId: z.number(),
});

export const loginSchema = userSchema.pick({
  email: true,
  password: true,
});

export const mfaVerifySchema = userSchema
  .pick({
    mfaMethod: true,
  })
  .extend({
    token: z.string().min(6, "MFA token must be at least 6 characters"),
  });

export const registerSchema = userSchema.pick({
  email: true,
  password: true,
  name: true,
  phone: true,
  role: true,
  organizationId: true,
});

export const setupMFASchema = userSchema.pick({
  method: true,
  phone: true,
});

export const enableTOTPSchema = z.object({
  secret: z.string(),
  token: z.string().length(6, "TOTP token must be 6 digits"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const accessTokenPayload = userSchema.pick({
  id: true,
  email: true,
  role: true,
  organizationId: true,
}).extend({
  iat: z.number(),
  exp: z.number(), 
})


export type LoginInput = z.infer<typeof loginSchema>;
export type MfaVerifyInput = z.infer<typeof mfaVerifySchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SetupMFAInput = z.infer<typeof setupMFASchema>;
export type EnableTOTPInput = z.infer<typeof enableTOTPSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type AccessTokenPayload = z.infer<typeof accessTokenPayload>;