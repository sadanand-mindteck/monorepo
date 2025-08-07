import speakeasy, { GeneratedSecret } from "speakeasy"
import qrcode from "qrcode"
import { db } from "../db/connection.js"
import { mfaTokens, users } from "../db/schema.js"
import { eq, and, gt } from "drizzle-orm"
import { emailService } from "./email.js"
import { smsService } from "./sms.js"

type MFAMethod = "email" | "sms" | "totp"

class MFAService {
  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  generateTOTPSecret(userEmail: string): GeneratedSecret {
    return speakeasy.generateSecret({
      name: `JIMS (${userEmail})`,
      issuer: process.env.MFA_ISSUER || "JIMS",
      length: 32,
    })
  }

  async generateQRCode(secret: GeneratedSecret): Promise<{
    success: boolean
    qrCode?: string
    secret?: string
    error?: string
  }> {
    try {
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!)
      return { success: true, qrCode: qrCodeUrl, secret: secret.base32 }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async sendMFACode(
    userId: number,
    method: MFAMethod,
    userEmail: string,
    userPhone: string,
    userName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const code = this.generateCode()
      const expiresAt = new Date(Date.now() + Number(process.env.MFA_TOKEN_EXPIRY || "300") * 1000)

      await db.insert(mfaTokens).values({
        userId,
        token: code,
        method,
        expiresAt,
      })
      let result
      if (method === "email") {
        result = await emailService.sendMFACode({email: userEmail, code, name: userName})
      } else if (method === "sms") {
        result = await smsService.sendMFACode(userPhone, code, userName)
      } else {
        result = { success: false, error: "Unsupported MFA method" }
      }

      return result
    } catch (error: any) {
      console.error("MFA code sending failed:", error)
      return { success: false, error: error.message }
    }
  }

  async verifyMFACode(
    userId: number,
    code: string,
    method: MFAMethod
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (method === "totp") {
        const user = await db
          .select({ mfaSecret: users.mfaSecret })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1)

        if (!user.length || !user[0].mfaSecret) {
          return { success: false, error: "TOTP not configured" }
        }

        const verified = speakeasy.totp.verify({
          secret: user[0].mfaSecret,
          encoding: "base32",
          token: code,
          window: 2,
        })

        return { success: verified, error: verified ? undefined : "Invalid TOTP code" }
      } else {
        const token = await db
          .select()
          .from(mfaTokens)
          .where(
            and(
              eq(mfaTokens.userId, userId),
              eq(mfaTokens.token, code),
              eq(mfaTokens.method, method),
              eq(mfaTokens.used, false),
              gt(mfaTokens.expiresAt, new Date())
            )
          )
          .limit(1)

        if (!token.length) {
          return { success: false, error: "Invalid or expired code" }
        }

        await db.update(mfaTokens).set({ used: true }).where(eq(mfaTokens.id, token[0].id))
        return { success: true }
      }
    } catch (error: any) {
      console.error("MFA verification failed:", error)
      return { success: false, error: error.message }
    }
  }

  async enableMFA(
    userId: number,
    method: MFAMethod,
    secret?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {
        mfaEnabled: true,
        mfaMethod: method,
        updatedAt: new Date(),
      }

      if (method === "totp" && secret) {
        updateData.mfaSecret = secret
      }

      await db.update(users).set(updateData).where(eq(users.id, userId))
      return { success: true }
    } catch (error: any) {
      console.error("MFA enable failed:", error)
      return { success: false, error: error.message }
    }
  }

  async disableMFA(userId: number): Promise<{ success: boolean; error?: string }> {
    try {
      await db
        .update(users)
        .set({
          mfaEnabled: false,
          mfaMethod: null,
          mfaSecret: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))

      return { success: true }
    } catch (error: any) {
      console.error("MFA disable failed:", error)
      return { success: false, error: error.message }
    }
  }
}

export const mfaService = new MFAService()
