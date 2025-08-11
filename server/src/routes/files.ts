import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { eq, desc, and, count } from "drizzle-orm";
import { MultipartFile } from "@fastify/multipart";
import fs from "fs";

import { files } from "@jims/shared/db/schema.js";
import { db } from "@jims/shared/db/connection.js";
import { requestParam, requestParamEntity } from "@jims/shared/schema/common.js";
import { fileQuerySchema } from "@jims/shared/schema/file.js";
import { fileService } from "../services/file.js";

export default async function fileRoutes(fastify: FastifyInstance) {
  // Upload file
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/upload",
    {
      schema: {
        tags: ["Files"],
        summary: "Upload a file",
        consumes: ["multipart/form-data"],
        querystring: requestParamEntity
      },
    },
    async (request, reply) => {
      
        const data: MultipartFile | undefined = await request.file();
        if (!data) {
          return reply.code(400).send({ error: "No file uploaded" });
        }

        const { entityType } = request.query;

        const result = await fileService.saveFile(data, request.jwtPayload.id, entityType);

        if (!result.success) {
          return reply.code(400).send({ error: result.error || "File upload failed", errors: result.errors });
        }

        return result;
     
    }
  );

  // Upload multiple files
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/upload-multiple",
    {
      schema: {
        tags: ["Files"],
        summary: "Upload multiple files",
        consumes: ["multipart/form-data"],
        querystring: requestParamEntity,
      },
    },
    async (request, reply) => {
      
        const parts = request.files();
        const results = [];
        const { entityType, id } = request.query;

        for await (const part of parts) {
          const result = await fileService.saveFile(part, request.jwtPayload.id, entityType);
          results.push(result);
        }

        const successful = results.filter((r) => r.success);
        const failed = results.filter((r) => !r.success);

        return {
          success: failed.length === 0,
          uploaded: successful.length,
          failed: failed.length,
          files: successful.map((r) => r.file),
          errors: failed.map((r) => r.error),
        };
      
    }
  );

  // Get file by ID or Download file
  const getFileHandler = (disposition: "inline" | "attachment") => async (request: FastifyRequest, reply: FastifyReply) => {
    const fileId = (request.params as { id: number }).id;
    if (isNaN(fileId)) {
      return reply.code(400).send({ error: "Invalid file ID" });
    }
    const result = await fileService.getFile(fileId);

    if (!result.success || !result.path || !result.file) {
      return reply.code(404).send({ error: "File not found" });
    }

    const stream = fs.createReadStream(result.path);
    reply.type(result.file.mimeType);
    reply.header("Content-Disposition", `${disposition}; filename="${result.file.originalName}"`);
    return reply.send(stream);
  };

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/:id",
    {
      schema: {
        tags: ["Files"],
        summary: "Get file by ID",
        params: requestParam,
      },
    },
    getFileHandler("inline")
  );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/:id/download",
    {
      schema: {
        tags: ["Files"],
        summary: "Download file",
      },
    },
    getFileHandler("attachment")
  );

  // Get files list
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/",
    {
      schema: {
        tags: ["Files"],
        summary: "Get files list",
        querystring: fileQuerySchema,
      },
    },
    async (request) => {
      const { entityType, id, type, page = 1, limit = 10 } = request.query;

      const offset = (page - 1) * limit;

      const conditions = [];
      if (entityType) conditions.push(eq(files.entityType, entityType));
      if (id) conditions.push(eq(files.id, +id));
      if (type) conditions.push(eq(files.type, type));
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const dataQuery = db.select().from(files).where(whereClause).orderBy(desc(files.createdAt)).limit(limit).offset(offset);

      // For production, you must run the count query separately without limit/offset
      const totalQuery = db.select({ value: count() }).from(files).where(whereClause);

      const [results, totalResult] = await Promise.all([dataQuery, totalQuery]);
      const total = totalResult[0];

      const filesWithUrls = results.map((file) => ({
        ...file,
        url: `/api/files/${file.id}`,
        downloadUrl: `/api/files/${file.id}/download`,
      }));

      return {
        data: filesWithUrls,
        pagination: { page, limit, total : total ? total.value : 0 },
      };
    }
  );

  // Delete file
  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/:id",
    {
      schema: {
        tags: ["Files"],
        summary: "Delete file",
        params: requestParam,
      },
    },
    async (request, reply) => {
      const fileId = request.params.id;
      const result = await fileService.deleteFile(+fileId, request.jwtPayload.id);

      if (!result.success) {
        return reply.code(404).send({ error: result.error });
      }

      return { success: true, message: "File deleted successfully" };
    }
  );

  // Get files by entity
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/entity/:entityType/:id",
    {
      schema: {
        tags: ["Files"],
        summary: "Get files by entity",
        params: requestParamEntity,
      },
    },
    async (request, reply) => {
      try {
        const { entityType, id } = request.params;

        const result = await fileService.getFilesByEntity(entityType, +id);

        if (!result.success) {
          return reply.code(500).send({ error: result.error });
        }

        return result.files;
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );
}
