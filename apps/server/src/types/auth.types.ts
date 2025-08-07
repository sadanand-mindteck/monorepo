import {
  loginSchema,
  registerSchema,
  setupMFASchema,
  enableTOTPSchema,
  mfaVerifySchema,
  changePasswordSchema,
} from "../schemas/auth.js"
import { z } from "zod"

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type SetupMFAInput = z.infer<typeof setupMFASchema>
export type EnableTOTPInput = z.infer<typeof enableTOTPSchema>
export type VerifyMFAInput = z.infer<typeof mfaVerifySchema> & { tempToken: string }
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
