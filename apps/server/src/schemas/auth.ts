import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const mfaVerifySchema = z.object({
  token: z.string().min(6, "MFA token must be at least 6 characters"),
  method: z.enum(["email", "sms", "totp"]),
})

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  role: z.enum(["admin", "warehouse", "operator"]),
  organizationId: z.number().optional(),
})

export const setupMFASchema = z.object({
  method: z.enum(["email", "sms", "totp"]),
  phone: z.string().optional(),
})

export const enableTOTPSchema = z.object({
  secret: z.string(),
  token: z.string().length(6, "TOTP token must be 6 digits"),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
})

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters"),
})
