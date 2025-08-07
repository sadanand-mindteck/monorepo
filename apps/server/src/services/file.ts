import fs from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import sharp from "sharp"
import mime from "mime-types"
import { db } from "../db/connection.js"
import { files } from "../db/schema.js"
import { eq, and } from "drizzle-orm"

interface UploadedFile {
  file: { bytesRead: number }
  filename: string
  mimetype: string
  toBuffer: () => Promise<Buffer>
}

class FileService {
  private uploadPath: string
  private maxFileSize: number
  private allowedTypes: string[]

  constructor() {
    this.uploadPath = process.env.UPLOAD_PATH || "./uploads"
    this.maxFileSize = Number.parseInt(process.env.MAX_FILE_SIZE || "10485760") // 10MB
    this.allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(",") || [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
    ]
    this.initializeUploadDirectory()
  }

  private async initializeUploadDirectory() {
    try {
      await fs.access(this.uploadPath)
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true })
      await fs.mkdir(path.join(this.uploadPath, "images"), { recursive: true })
      await fs.mkdir(path.join(this.uploadPath, "documents"), { recursive: true })
      await fs.mkdir(path.join(this.uploadPath, "certificates"), { recursive: true })
      await fs.mkdir(path.join(this.uploadPath, "reports"), { recursive: true })
    }
  }

  private validateFile(file: UploadedFile): string[] {
    const errors: string[] = []

    if (file.file.bytesRead > this.maxFileSize) {
      errors.push(`File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`)
    }

    if (!this.allowedTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed`)
    }

    return errors
  }

  private getFileType(mimetype: string): string {
    if (mimetype.startsWith("image/")) return "image"
    if (mimetype === "application/pdf") return "document"
    if (mimetype.includes("msword") || mimetype.includes("officedocument")) return "document"
    return "document"
  }

  private async processImage(
    buffer: Buffer,
    options: { width?: number; height?: number; quality?: number } = {}
  ) {
    const { width = 1920, height = 1080, quality = 80 } = options

    try {
      const processedBuffer = await sharp(buffer)
        .resize(width, height, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality })
        .toBuffer()
      return processedBuffer
    } catch (error) {
      console.error("Image processing failed:", error)
      return buffer // fallback to original
    }
  }

  private getPublicURL(fileId: number): string {
    return `/api/files/${fileId}`
  }

  async saveFile(file: UploadedFile, userId: number, entityType: string | null = null, entityId: number | null = null) {
    try {
      const validationErrors = this.validateFile(file)
      if (validationErrors.length > 0) {
        return { success: false, errors: validationErrors }
      }

      const fileType = this.getFileType(file.mimetype)
      const fileExtension = mime.extension(file.mimetype) || "bin"
      const filename = `${uuidv4()}.${fileExtension}`
      const relativePath = path.join(fileType + "s", filename)
      const fullPath = path.join(this.uploadPath, relativePath)

      const buffer = await file.toBuffer()

      let processedBuffer = buffer
      if (fileType === "image") {
        processedBuffer = await this.processImage(buffer)
      }

      await fs.writeFile(fullPath, processedBuffer)

      const fileRecord = await db
        .insert(files)
        .values({
          filename,
          originalName: file.filename,
          mimeType: file.mimetype,
          size: processedBuffer.length,
          path: relativePath,
          type: fileType as "image" | "document" | "certificate" | "report",
          uploadedBy: userId,
          entityType,
          entityId,
        })
        .returning()

      return {
        success: true,
        file: fileRecord[0],
        url: this.getPublicURL(fileRecord[0].id),
      }
    } catch (error: any) {
      console.error("File save failed:", error)
      return { success: false, error: error.message }
    }
  }

  async getFile(fileId: number) {
    try {
      const fileRecord = await db.select().from(files).where(eq(files.id, fileId)).limit(1)

      if (!fileRecord.length) {
        return { success: false, error: "File not found" }
      }

      const fullPath = path.join(this.uploadPath, fileRecord[0].path)

      try {
        await fs.access(fullPath)
        return {
          success: true,
          file: fileRecord[0],
          path: fullPath,
        }
      } catch {
        return { success: false, error: "File not found on disk" }
      }
    } catch (error: any) {
      console.error("Get file failed:", error)
      return { success: false, error: error.message }
    }
  }

  async deleteFile(fileId: number, userId: number) {
    try {
      const fileRecord = await db.select().from(files).where(eq(files.id, fileId)).limit(1)

      if (!fileRecord.length) {
        return { success: false, error: "File not found" }
      }

      const fullPath = path.join(this.uploadPath, fileRecord[0].path)

      try {
        await fs.unlink(fullPath)
      } catch (error: any) {
        console.warn("File not found on disk:", error.message)
      }

      await db.delete(files).where(eq(files.id, fileId))

      return { success: true }
    } catch (error: any) {
      console.error("Delete file failed:", error)
      return { success: false, error: error.message }
    }
  }

  async getFilesByEntity(entityType: string, entityId: number) {
    try {
      const fileRecords = await db
        .select()
        .from(files)
        .where(and(eq(files.entityType, entityType), eq(files.entityId, entityId)))

      return {
        success: true,
        files: fileRecords.map((file) => ({
          ...file,
          url: this.getPublicURL(file.id),
        })),
      }
    } catch (error: any) {
      console.error("Get files by entity failed:", error)
      return { success: false, error: error.message }
    }
  }
}

export const fileService = new FileService()
