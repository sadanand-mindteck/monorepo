import twilio, { Twilio } from "twilio"
import dotenv from "dotenv"

dotenv.config()

class SMSService {
  private client: Twilio
  private fromNumber: string

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const from = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !from) {
      throw new Error("Twilio environment variables not configured correctly.")
    }

    this.client = twilio(accountSid, authToken)
    this.fromNumber = from
  }

  async sendMFACode(phone: string, code: string, name: string) {
    try {
      const message = await this.client.messages.create({
        body: `JIMS Verification Code: ${code}. This code expires in 5 minutes. Do not share this code with anyone.`,
        from: this.fromNumber,
        to: phone,
      })

      return { success: true, messageId: message.sid }
    } catch (error: any) {
      console.error("SMS sending failed:", error)
      return { success: false, error: error.message }
    }
  }

  async sendWelcomeMessage(phone: string, name: string) {
    try {
      const message = await this.client.messages.create({
        body: `Welcome to JIMS, ${name}! Your account has been created successfully. Please check your email for login details.`,
        from: this.fromNumber,
        to: phone,
      })

      return { success: true, messageId: message.sid }
    } catch (error: any) {
      console.error("Welcome SMS sending failed:", error)
      return { success: false, error: error.message }
    }
  }

  async sendAlert(phone: string, message: string) {
    try {
      const sms = await this.client.messages.create({
        body: `JIMS Alert: ${message}`,
        from: this.fromNumber,
        to: phone,
      })

      return { success: true, messageId: sms.sid }
    } catch (error: any) {
      console.error("Alert SMS sending failed:", error)
      return { success: false, error: error.message }
    }
  }
}

export const smsService = new SMSService()
