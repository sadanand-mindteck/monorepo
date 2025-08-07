import { fileService } from "../services/file.js"
import { db } from "../db/connection.js"
import { files } from "../db/schema.js"
import { eq, desc, and, count } from "drizzle-orm"
import fs from "fs"
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { MultipartFile } from "@fastify/multipart"
import { EntityParams, GetFilesQuery } from "../types/files.types.js"


interface IdParams {
  id: string
}



// --- Route Definitions ---

export default async function fileRoutes(fastify: FastifyInstance) {
  // Upload file
  fastify.post(
    "/upload",
    {
      schema: {
        tags: ["Files"],
        summary: "Upload a file",
        consumes: ["multipart/form-data"],
        querystring: {
          type: "object",
          properties: {
            entityType: { type: "string" },
            entityId: { type: "string" },
          },
        },
        security: [{ Bearer: [] }],
        // Response schema remains the same
      },
    },
    async (request: FastifyRequest<{ Querystring: { entityType?: string; entityId?: string } }>, reply) => {
      try {
        const data: MultipartFile | undefined = await request.file()
        if (!data) {
          return reply.code(400).send({ error: "No file uploaded" })
        }

        const { entityType, entityId } = request.query

        const result = await fileService.saveFile(
          data,
          request.jwtPayload.id,
          entityType,
          entityId ? parseInt(entityId, 10) : undefined,
        )

        if (!result.success) {
          return reply.code(400).send({ error: result.error || "File upload failed", errors: result.errors })
        }

        return result
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: "Internal Server Error" })
      }
    },
  )

  // Upload multiple files
  fastify.post(
    "/upload-multiple",
    {
      schema: {
        tags: ["Files"],
        summary: "Upload multiple files",
        consumes: ["multipart/form-data"],
        querystring: {
          type: "object",
          properties: {
            entityType: { type: "string" },
            entityId: { type: "string" },
          },
        },
        security: [{ Bearer: [] }],
      },
    },
    async (request: FastifyRequest<{ Querystring: { entityType?: string; entityId?: string } }>, reply) => {
      try {
        const parts = request.files()
        const results = []
        const { entityType, entityId } = request.query

        for await (const part of parts) {
          const result = await fileService.saveFile(
            part,
            request.jwtPayload.id,
            entityType,
            entityId ? parseInt(entityId, 10) : undefined,
          )
          results.push(result)
        }

        const successful = results.filter((r) => r.success)
        const failed = results.filter((r) => !r.success)

        return {
          success: failed.length === 0,
          uploaded: successful.length,
          failed: failed.length,
          files: successful.map((r) => r.file),
          errors: failed.map((r) => r.error),
        }
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: "Internal Server Error" })
      }
    },
  )

  // Get file by ID or Download file
  const getFileHandler =
    (disposition: "inline" | "attachment") =>
    async (request: FastifyRequest<{ Params: IdParams }>, reply :FastifyReply) => {
      try {
        const fileId = parseInt(request.params.id, 10)
        if (isNaN(fileId)) {
          return reply.code(400).send({ error: "Invalid file ID" })
        }
        const result = await fileService.getFile(fileId)

        if (!result.success || !result.path || !result.file) {
          return reply.code(404).send({ error: "File not found" })
        }

        const stream = fs.createReadStream(result.path)
        reply.type(result.file.mimeType)
        reply.header("Content-Disposition", `${disposition}; filename="${result.file.originalName}"`)
        return reply.send(stream)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: "Internal Server Error" })
      }
    }

  fastify.get<{ Params: IdParams }>(
    "/:id",
    {
      schema: {
        tags: ["Files"],
        summary: "Get file by ID",
        params: { type: "object", properties: { id: { type: "string" } } },
        security: [{ Bearer: [] }],
      },
    },
    getFileHandler("inline"),
  )

  fastify.get<{ Params: IdParams }>(
    "/:id/download",
    {
      schema: {
        tags: ["Files"],
        summary: "Download file",
        params: { type: "object", properties: { id: { type: "string" } } },
        security: [{ Bearer: [] }],
      },
    },
    getFileHandler("attachment"),
  )

  // Get files list
  fastify.get<{ Querystring: GetFilesQuery }>(
    "/",
    {
      schema: {
        tags: ["Files"],
        summary: "Get files list",
        querystring: {
          /* schema defined in handler */
        },
        security: [{ Bearer: [] }],
      },
    },
    async (request, reply) => {
      try {
        const { entityType, entityId, type } = request.query 
        const page = parseInt(request.query.page || "1", 10)
        const limit = parseInt(request.query.limit || "10", 10)
        const offset = (page - 1) * limit

        const conditions = []
        if (entityType) conditions.push(eq(files.entityType, entityType))
        if (entityId) conditions.push(eq(files.entityId, parseInt(entityId, 10)))
        if (type) conditions.push(eq(files.type, type))
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const dataQuery = db.select().from(files).where(whereClause).orderBy(desc(files.createdAt)).limit(limit).offset(offset)

        // For production, you must run the count query separately without limit/offset
        const totalQuery = db.select({ value: count() }).from(files).where(whereClause)

        const [results, totalResult] = await Promise.all([dataQuery, totalQuery])
        const total = totalResult[0].value

        const filesWithUrls = results.map((file) => ({
          ...file,
          url: `/api/files/${file.id}`,
          downloadUrl: `/api/files/${file.id}/download`,
        }))

        return {
          data: filesWithUrls,
          pagination: { page, limit, total },
        }
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: "Internal Server Error" })
      }
    },
  )

  // Delete file
  fastify.delete<{ Params: IdParams }>(
    "/:id",
    {
      schema: {
        tags: ["Files"],
        summary: "Delete file",
        params: { type: "object", properties: { id: { type: "string" } } },
        security: [{ Bearer: [] }],
      },
    },
    async (request, reply) => {
      try {
        const fileId = parseInt(request.params.id, 10)
        const result = await fileService.deleteFile(fileId, request.jwtPayload.id)

        if (!result.success) {
          return reply.code(404).send({ error: result.error })
        }

        return { success: true, message: "File deleted successfully" }
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: "Internal Server Error" })
      }
    },
  )

  // Get files by entity
  fastify.get<{ Params: EntityParams }>(
    "/entity/:entityType/:entityId",
    {
      schema: {
        tags: ["Files"],
        summary: "Get files by entity",
        params: {
          /* schema defined in handler */
        },
        security: [{ Bearer: [] }],
      },
    },
    async (request, reply) => {
      try {
        const { entityType } = request.params
        const entityId = parseInt(request.params.entityId, 10)
        const result = await fileService.getFilesByEntity(entityType, entityId)

        if (!result.success) {
          return reply.code(500).send({ error: result.error })
        }

        return result.files
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: "Internal Server Error" })
      }
    },
  )
}