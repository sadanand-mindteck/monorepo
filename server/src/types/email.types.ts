// import { z } from "zod";

// // --- Zod Schema Definitions ---

// /**
//  * Schema for the object returned by email methods.
//  */
// const EmailResponseObjectSchema = z.object({
//   success: z.boolean(),
//   error: z.string().optional(),
// });

// /**
//  * Schema for the Multi-Factor Authentication (MFA) code email parameters.
//  */
// export const MfaEmailParamsSchema = z.object({
//   email: z.string().email("Invalid email address"),
//   code: z.string().min(1, "Code cannot be empty"),
//   name: z.string().min(1, "Name cannot be empty"),
// });

// /**
//  * Schema for the welcome email parameters.
//  */
// export const WelcomeEmailParamsSchema = z.object({
//   email: z.string().email("Invalid email address"),
//   name: z.string().min(1, "Name cannot be empty"),
//   tempPassword: z.string().min(1, "Temporary password cannot be empty"),
// });

// /**
//  * Schema for the password reset email parameters.
//  */
// export const PasswordResetParamsSchema = z.object({
//   email: z.string().email("Invalid email address"),
//   name: z.string().min(1, "Name cannot be empty"),
//   resetToken: z.string().min(1, "Reset token cannot be empty"),
// });


// // --- Inferred Type Definitions ---

// /**
//  * Defines the structure for the email sending response.
//  * This is a Promise wrapping the inferred object type.
//  */
// export type EmailResponse = Promise<z.infer<typeof EmailResponseObjectSchema>>;

// /**
//  * Inferred type for MFA email parameters.
//  */
// export type MfaEmailParams = z.infer<typeof MfaEmailParamsSchema>;

// /**
//  * Inferred type for welcome email parameters.
//  */
// export type WelcomeEmailParams = z.infer<typeof WelcomeEmailParamsSchema>;

// /**
//  * Inferred type for password reset email parameters.
//  */
// export type PasswordResetParams = z.infer<typeof PasswordResetParamsSchema>;