import bcrypt from "bcryptjs";
import { db } from "@jims/db/connection";
import { users, organizations } from "@jims/db/schema";
import {
  registerSchema,
  changePasswordSchema,
   
  LoginInput,
  loginSchema,

} from "@jims/types/auth";
import { eq } from "drizzle-orm";
// import { mfaService } from "../services/mfa.js";
// import { emailService } from "../services/email.js";
import { smsService } from "../services/sms.js";
// import speakeasy from "speakeasy";
import { FastifyInstance, FastifyRequest } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export default async function authRoutes(fastify: FastifyInstance) {
  // Login
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/login",
    {
      schema: {
        tags: ["Authentication"],
        summary: "User login",
        body:loginSchema
        // body: zodToJsonSchema(loginSchema,{$refStrategy: "none"}),
        // response: {
        //   200: {
        //     type: "object",
        //     properties: {
        //       requiresMFA: { type: "boolean" },
        //       token: { type: "string" },
        //       user: {
        //         type: "object",
        //         properties: {
        //           id: { type: "number" },
        //           email: { type: "string" },
        //           name: { type: "string" },
        //           role: { type: "string" },
        //         },
        //       },
        //     },
        //   },
        // },
      },
    },
    async (request, reply) => {
      
        const { email, password } = request.body;

        // Find user with organization details
        const user = await db
          .select({
            id: users.id,
            email: users.email,
            password: users.password,
            name: users.name,
            phone: users.phone,
            role: users.role,
            organizationId: users.organizationId,
            organizationName: organizations.name,
            isActive: users.isActive,
            mfaEnabled: users.mfaEnabled,
            mfaMethod: users.mfaMethod,
          })
          .from(users)
          .leftJoin(organizations, eq(users.organizationId, organizations.id))
          .where(eq(users.email, email))
          .limit(1);

        if (!user.length || !user[0]?.isActive) {
          return reply.code(401).send({ error: "Invalid credentials" });
        }
        

        const isValidPassword = await bcrypt.compare(
          password,
          user[0].password
        );
        if (!isValidPassword) {
          return reply.code(401).send({ error: "Invalid credentials" });
        }

        const { password: _, ...userWithoutPassword } = user[0];

        // Check if MFA is enabled
        // if (user[0].mfaEnabled) {
        //   // Send MFA code
        //   const mfaResult = await mfaService.sendMFACode(
        //     user[0].id,
        //     user[0].mfaMethod,
        //     user[0].email,
        //     user[0].phone,
        //     user[0].name,
        //   )

        //   if (!mfaResult || !mfaResult.success) {
        //     return reply.code(500).send({ error: "Failed to send MFA code" })
        //   }

        //   // Generate temporary token for MFA verification
        //   const tempToken = fastify.jwt.sign(
        //     {
        //       id: user[0].id,
        //       email: user[0].email,
        //       mfaPending: true,
        //     },
        //     { expiresIn: "10m" },
        //   )

        //   return {
        //     requiresMFA: true,
        //     tempToken,
        //     mfaMethod: user[0].mfaMethod,
        //   }
        // }

        // Update last login
        await db
          .update(users)
          .set({ lastLogin: new Date() })
          .where(eq(users.id, user[0].id));

        // Generate JWT token
        const token = fastify.jwt.sign({
          id: user[0].id,
          email: user[0].email,
          role: user[0].role,
          organizationId: user[0].organizationId,
        });

        // reply.setCookie("token", token, {
        //   httpOnly: true,
        //   secure: process.env.NODE_ENV === "production",
        //   sameSite: "lax",
        //   path: "/",
        //   maxAge: 60 * 60 * 24, // 1 day
        // });

        return {
          token,
          requiresMFA: false,
          user: userWithoutPassword,
        };
      
    }
  );

  // Register
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/register",
    {
      schema: {
        tags: ["Authentication"],
        summary: "User registration",
        body: registerSchema,
      },
    },
    async (request, reply) => {
      
        const { email, password, name, phone, role, organizationId } =
          request.body;

        // Check if user already exists
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (existingUser.length) {
          return reply.code(400).send({ error: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await db
          .insert(users)
          .values({
            email,
            password: hashedPassword,
            name,
            phone,
            role,
            organizationId,
          })
          .returning();

        // Send welcome email
        // await emailService.sendWelcomeEmail({
        //   email,
        //   name,
        //   tempPassword: "Please set your password",
        // });

        // Send welcome SMS if phone provided
        if (phone) {
          await smsService.sendWelcomeMessage(phone, name);
        }

        const userWithoutPassword = newUser[0];

        return reply.code(201).send({
          message: "User created successfully",
          user: userWithoutPassword,
        });
      
    }
  );

  // Get current user profile
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/profile",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Get current user profile",
      },
    },
    async (request, reply) => {

        const user = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            phone: users.phone,
            role: users.role,
            organizationId: users.organizationId,
            organizationName: organizations.name,
            isActive: users.isActive,
            emailVerified: users.emailVerified,
            phoneVerified: users.phoneVerified,
            mfaEnabled: users.mfaEnabled,
            mfaMethod: users.mfaMethod,
            lastLogin: users.lastLogin,
            createdAt: users.createdAt,
          })
          .from(users)
          .leftJoin(organizations, eq(users.organizationId, organizations.id))
          .where(eq(users.id, request.jwtPayload.id))
          .limit(1);

        if (!user.length) {
          return reply.code(404).send({ error: "User not found" });
        }

        return user[0];
      
    }
  );

  // Change password
 fastify.withTypeProvider<ZodTypeProvider>().post(
  "/change-password",
  {
    schema: {
      tags: ["Authentication"],
      summary: "Change user password",
      body: changePasswordSchema,
    },
  },
  async (request, reply) => {
    const { currentPassword, newPassword } = request.body;
    const userId = request.jwtPayload.id;

    // Get current password — single record instead of array
    const foundUser = await db
        .select({ password: users.password })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
        .then(res => res[0]);

    if (!foundUser) {
      return reply.code(404).send({ error: "User not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      foundUser.password
    );

    if (!isValidPassword) {
      return reply
        .code(400)
        .send({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return { message: "Password changed successfully" };
  }
);


  // Verify MFA
  // fastify.post(
  //   "/verify-mfa",
  //   {
  //     schema: {
  //       tags: ["Authentication"],
  //       summary: "Verify MFA code",
  //       body: zodToJsonSchema(mfaVerifySchema.extend({
  //         tempToken: z.string(),
  //       })),
  //     },
  //   },
  //   async (request:FastifyRequest<{Body:VerifyMFAInput}>, reply) => {
  //     try {
  //       const { tempToken, token, method } = request.body
  //       let decoded: AccessTokenPayload
  //       try {
  //          decoded = fastify.jwt.verify<AccessTokenPayload>(tempToken)
  //         if (!decoded.mfaPending) {
  //           return reply.code(401).send({ error: "Invalid temporary token" })
  //         }
  //       } catch (error) {
  //         return reply.code(401).send({ error: "Invalid or expired temporary token" })
  //       }

  //       // Verify MFA code
  //       const mfaResult = await mfaService.verifyMFACode(decoded.id, token, method)
  //       if (!mfaResult.success) {
  //         return reply.code(401).send({ error: mfaResult.error })
  //       }

  //       // Get user details
  //       const user = await db
  //         .select({
  //           id: users.id,
  //           email: users.email,
  //           name: users.name,
  //           role: users.role,
  //           organizationId: users.organizationId,
  //           organizationName: organizations.name,
  //         })
  //         .from(users)
  //         .leftJoin(organizations, eq(users.organizationId, organizations.id))
  //         .where(eq(users.id, decoded.id))
  //         .limit(1)

  //       // Update last login
  //       await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, decoded.id))

  //       // Generate final JWT token
  //       const finalToken = fastify.jwt.sign({
  //         id: user[0].id,
  //         email: user[0].email,
  //         role: user[0].role,
  //         organizationId: user[0].organizationId,
  //       })

  //       return {
  //         token: finalToken,
  //         user: user[0],
  //       }
  //     } catch (error) {
  //       fastify.log.error(error)
  //       return reply.code(500).send({ error: "Internal server error" })
  //     }
  //   },
  // )

  // // Setup MFA
  // fastify.post(
  //   "/setup-mfa",
  //   {

  //     schema: {
  //       tags: ["Authentication"],
  //       summary: "Setup MFA for user",
  //       body: zodToJsonSchema(setupMFASchema),
  //       security: [{ Bearer: [] }],
  //     },
  //   },
  //   async (request: FastifyRequest<{ Body: SetupMFAInput }>, reply) => {
  //     try {
  //       const { method, phone } = request.body
  //       const userId = request.jwtPayload.id;

  //       if (method === "totp") {
  //         // Generate TOTP secret and QR code
  //         const user = request.jwtPayload
  //         const secret = mfaService.generateTOTPSecret(user.email)
  //         const qrResult = await mfaService.generateQRCode(secret)

  //         if (!qrResult.success) {
  //           return reply.code(500).send({ error: "Failed to generate QR code" })
  //         }

  //         return {
  //           method: "totp",
  //           secret: qrResult.secret,
  //           qrCode: qrResult.qrCode,
  //           message: "Scan the QR code with your authenticator app and verify with a code",
  //         }
  //       } else {
  //         // For email/SMS, update phone if provided and send test code
  //         if (method === "sms" && phone) {
  //           await db.update(users).set({ phone }).where(eq(users.id, userId))
  //         }

  //         const user = await db
  //           .select({ email: users.email, phone: users.phone, name: users.name })
  //           .from(users)
  //           .where(eq(users.id, userId))
  //           .limit(1)

  //         const mfaResult = await mfaService.sendMFACode(userId, method, user[0].email, user[0].phone, user[0].name)

  //         if (!mfaResult || !mfaResult.success) {
  //           return reply.code(500).send({ error: "Failed to send MFA code" })
  //         }

  //         return {
  //           method,
  //           message: `Verification code sent via ${method}. Please verify to enable MFA.`,
  //         }
  //       }
  //     } catch (error) {
  //       fastify.log.error(error)
  //       return reply.code(500).send({ error: "Internal server error" })
  //     }
  //   },
  // )

  // // Enable TOTP
  // fastify.post(
  //   "/enable-totp",
  //   {

  //     schema: {
  //       tags: ["Authentication"],
  //       summary: "Enable TOTP MFA",
  //       body: zodToJsonSchema(enableTOTPSchema),
  //       security: [{ Bearer: [] }],
  //     },
  //   },
  //   async (request:FastifyRequest<{ Body: EnableTOTPInput }>, reply) => {
  //     try {
  //       const { secret, token } = request.body
  //       const userId = request.jwtPayload.id

  //       // Verify TOTP token
  //       const verified = speakeasy.totp.verify({
  //         secret,
  //         encoding: "base32",
  //         token,
  //         window: 2,
  //       })

  //       if (!verified) {
  //         return reply.code(400).send({ error: "Invalid TOTP code" })
  //       }

  //       // Enable MFA
  //       const result = await mfaService.enableMFA(userId, "totp", secret)
  //       if (!result.success) {
  //         return reply.code(500).send({ error: "Failed to enable MFA" })
  //       }

  //       return { message: "TOTP MFA enabled successfully" }
  //     } catch (error) {
  //       fastify.log.error(error)
  //       return reply.code(500).send({ error: "Internal server error" })
  //     }
  //   },
  // )

  // // Enable Email/SMS MFA
  // fastify.post(
  //   "/enable-mfa",
  //   {

  //     schema: {
  //       tags: ["Authentication"],
  //       summary: "Enable Email/SMS MFA",
  //       body: zodToJsonSchema(mfaVerifySchema),
  //       security: [{ Bearer: [] }],
  //     },
  //   },
  //   async (request: FastifyRequest<{ Body: VerifyMFAInput }>, reply) => {
  //     try {
  //       const { token, method } = request.body
  //       const userId = (request.user as { id: number }).id

  //       // Verify MFA code
  //       const mfaResult = await mfaService.verifyMFACode(userId, token, method)
  //       if (!mfaResult.success) {
  //         return reply.code(400).send({ error: mfaResult.error })
  //       }

  //       // Enable MFA
  //       const result = await mfaService.enableMFA(userId, method)
  //       if (!result.success) {
  //         return reply.code(500).send({ error: "Failed to enable MFA" })
  //       }

  //       return { message: `${method.toUpperCase()} MFA enabled successfully` }
  //     } catch (error) {
  //       fastify.log.error(error)
  //       return reply.code(500).send({ error: "Internal server error" })
  //     }
  //   },
  // )

  // // Disable MFA
  // fastify.post(
  //   "/disable-mfa",
  //   {

  //     schema: {
  //       tags: ["Authentication"],
  //       summary: "Disable MFA",
  //       security: [{ Bearer: [] }],
  //     },
  //   },
  //   async (request, reply) => {
  //     try {
  //       const userId = request.jwtPayload.id

  //       const result = await mfaService.disableMFA(userId)
  //       if (!result.success) {
  //         return reply.code(500).send({ error: "Failed to disable MFA" })
  //       }

  //       return { message: "MFA disabled successfully" }
  //     } catch (error) {
  //       fastify.log.error(error)
  //       return reply.code(500).send({ error: "Internal server error" })
  //     }
  //   },
  // )

  
}
