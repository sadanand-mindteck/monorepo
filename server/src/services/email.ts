// import nodemailer, { Transporter } from "nodemailer";
// import dotenv from "dotenv";
// import { EmailResponse, MfaEmailParams, PasswordResetParams, WelcomeEmailParams } from "@jims/types/user";

// dotenv.config();


// // --- Email Service Implementation ---

// class EmailService {
//   private transporter: Transporter;

//   constructor() {
//     this.transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: Number(process.env.SMTP_PORT), // Ensure port is a number
//       secure: process.env.SMTP_PORT === "465", // Secure is true for port 465
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });
//   }

//   /**
//    * Sends a Multi-Factor Authentication (MFA) code to a user.
//    */
//   async sendMFACode({ email, code, name }: MfaEmailParams): EmailResponse {
//     const mailOptions = {
//       from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
//       to: email,
//       subject: "JIMS - Your Verification Code",
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #2563eb;">JIMS - Verification Code</h2>
//           <p>Hello ${name},</p>
//           <p>Your verification code is:</p>
//           <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
//             <h1 style="color: #1f2937; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
//           </div>
//           <p>This code will expire in 5 minutes.</p>
//           <p>If you didn't request this code, please ignore this email.</p>
//           <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
//           <p style="color: #6b7280; font-size: 12px;">
//             This is an automated message from JIMS (Jammer Installation Management System).
//           </p>
//         </div>
//       `,
//     };

//     try {
//       await this.transporter.sendMail(mailOptions);
//       return { success: true };
//     } catch (error) {
//       console.error("Email sending failed:", error);
//       return { success: false, error: (error as Error).message };
//     }
//   }

//   /**
//    * Sends a welcome email with temporary credentials to a new user.
//    */
//   async sendWelcomeEmail({ email, name, tempPassword }: WelcomeEmailParams): EmailResponse {
//     const mailOptions = {
//       from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
//       to: email,
//       subject: "Welcome to JIMS - Your Account Details",
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #2563eb;">Welcome to JIMS</h2>
//           <p>Hello ${name},</p>
//           <p>Your account has been created successfully. Here are your login details:</p>
//           <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0;">
//             <p><strong>Email:</strong> ${email}</p>
//             <p><strong>Temporary Password:</strong> ${tempPassword}</p>
//           </div>
//           <p><strong>Important:</strong> Please change your password after your first login.</p>
//           <p>You can access the system at: <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}">${process.env.FRONTEND_URL || "http://localhost:3000"}</a></p>
//           <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
//           <p style="color: #6b7280; font-size: 12px;">
//             This is an automated message from JIMS (Jammer Installation Management System).
//           </p>
//         </div>
//       `,
//     };

//     try {
//       await this.transporter.sendMail(mailOptions);
//       return { success: true };
//     } catch (error) {
//       console.error("Welcome email sending failed:", error);
//       return { success: false, error: (error as Error).message };
//     }
//   }

//   /**
//    * Sends a password reset link to a user.
//    */
//   async sendPasswordResetEmail({ email, name, resetToken }: PasswordResetParams): EmailResponse {
//     const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

//     const mailOptions = {
//       from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
//       to: email,
//       subject: "JIMS - Password Reset Request",
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #2563eb;">Password Reset Request</h2>
//           <p>Hello ${name},</p>
//           <p>You requested a password reset for your JIMS account.</p>
//           <p>Click the button below to reset your password:</p>
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
//           </div>
//           <p>Or copy and paste this link in your browser:</p>
//           <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
//           <p>This link will expire in 1 hour.</p>
//           <p>If you didn't request this reset, please ignore this email.</p>
//           <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
//           <p style="color: #6b7280; font-size: 12px;">
//             This is an automated message from JIMS (Jammer Installation Management System).
//           </p>
//         </div>
//       `,
//     };

//     try {
//       await this.transporter.sendMail(mailOptions);
//       return { success: true };
//     } catch (error) {
//       console.error("Password reset email sending failed:", error);
//       return { success: false, error: (error as Error).message };
//     }
//   }
// }

// export const emailService = new EmailService();