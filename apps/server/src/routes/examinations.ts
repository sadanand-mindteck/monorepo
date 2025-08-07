import { db } from "../db/connection.js";
import { examinations, examCenters, organizations, users } from "../db/schema.js";
import {
  createExaminationSchema,
  updateExaminationSchema,
  createExamCenterSchema,
  examinationQuerySchema,
  examinationResponse,
} from "../schemas/examination.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { eq, desc, like, or, count, and, sum } from "drizzle-orm";
import { FastifyInstance, FastifyRequest } from "fastify";
import { ExamCenterInput, ExaminationInput, ExaminationInputUpdate, ExaminationQuery } from "../types/examination.types.js";

import { ZodTypeProvider } from "fastify-type-provider-zod";
import { requestParam } from "../schemas/common.js";

export default async function examinationRoutes(fastify: FastifyInstance) {
  // Get all examinations
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "",
    {
      schema: {
        tags: ["Examinations"],
        summary: "Get all examinations",
        querystring: examinationQuerySchema,
       
      },
    },
    async (request ) => {
      
        // 1. Safely parse query parameters into numbers
        const { search, status } = request.query;
        const page = request.query.page ?? 1;
        const limit = request.query.limit ?? 10;
        
        const offset = (page - 1) * limit;

        // 2. Build filter conditions first
        const conditions = [];
        if (search) {
          conditions.push(or(like(examinations.name, `%${search}%`), like(examinations.examCode, `%${search}%`)));
        }
        if (status) {
          conditions.push(eq(examinations.status, status));
        }
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // 3. Build the data query and total count query using the same filters
        const dataQuery = db
          .select({
            id: examinations.id,
            name: examinations.name,
            examCode: examinations.examCode,
            examDate: examinations.examDate,
            status: examinations.status,
            totalCenters: examinations.totalCenters,
            totalJammersRequired: examinations.totalJammersRequired,
            createdBy: examinations.createdBy,
            createdAt: examinations.createdAt,
            creatorName: users.name,
          })
          .from(examinations)
          .leftJoin(users, eq(examinations.createdBy, users.id))
          .where(whereClause) // Apply filters BEFORE pagination
          .orderBy(desc(examinations.createdAt))
          .limit(limit)
          .offset(offset);

        const totalQuery = db.select({ count: count() }).from(examinations).where(whereClause); // Apply the same filters to the count

        // 4. Execute queries concurrently for better performance
        const [results, totalResult] = await Promise.all([dataQuery, totalQuery]);

        const total = totalResult[0].count;

        return {
          data: results,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        };
     
    }
  );

  // Get examination by ID
  fastify.withTypeProvider<ZodTypeProvider>().get("/:id", { schema: { params: requestParam } }, async (request, reply) => {
    try {
      const { id } = request.params;

      const examination = await db
        .select({
          id: examinations.id,
          name: examinations.name,
          examCode: examinations.examCode,
          examDate: examinations.examDate,
          status: examinations.status,
          totalCenters: examinations.totalCenters,
          totalJammersRequired: examinations.totalJammersRequired,
          createdBy: examinations.createdBy,
          createdAt: examinations.createdAt,
          creatorName: users.name,
        })
        .from(examinations)
        .leftJoin(users, eq(examinations.createdBy, users.id))
        .where(eq(examinations.id, +id))
        .limit(1);

      if (!examination.length) {
        return reply.code(404).send({ error: "Examination not found" });
      }

      // Get exam centers for this examination
      const centers = await db
        .select({
          id: examCenters.id,
          name: examCenters.name,
          address: examCenters.address,
          jammersRequired: examCenters.jammersRequired,
          assignedAgencyId: examCenters.assignedAgencyId,
          assignedOperatorId: examCenters.assignedOperatorId,
          agencyName: organizations.name,
          operatorName: users.name,
        })
        .from(examCenters)
        .leftJoin(organizations, eq(examCenters.assignedAgencyId, organizations.id))
        .leftJoin(users, eq(examCenters.assignedOperatorId, users.id))
        .where(eq(examCenters.examinationId, +id));

      return {
        ...examination[0],
        centers,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: "Internal server error" });
    }
  });

  // Create examination
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/",
    {
      schema: {
        body: createExaminationSchema,
      },
    },
    async (request, reply) => {
      try {
        const { name, examCode, examDate, status = "draft" } = request.body;

        const newExamination = await db
          .insert(examinations)
          .values({
            name,
            examCode,
            examDate: new Date(examDate),
            status,
            createdBy: request.jwtPayload.id,
          })
          .returning();

        return reply.code(201).send(newExamination[0]);
      } catch (error: any) {
        fastify.log.error(error);
        if (error.code === "23505") {
          // Unique constraint violation
          return reply.code(400).send({ error: "Exam code already exists" });
        }
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  // Update examination
  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/:id",
    {
      schema: {
        body: updateExaminationSchema,
        params: requestParam,
      },
    },

    async (request, reply) => {
      try {
        const { id } = request.params;
        const updateData = { ...request.body, updatedAt: new Date() };

        if (updateData.examDate) {
          updateData.examDate = new Date(updateData.examDate);
        }

        const updatedExamination = await db.update(examinations).set(updateData).where(eq(examinations.id, +id)).returning();

        if (!updatedExamination.length) {
          return reply.code(404).send({ error: "Examination not found" });
        }

        return updatedExamination[0];
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  // Delete examination
  fastify.withTypeProvider<ZodTypeProvider>().delete("/:id", { schema: { params: requestParam } }, async (request, reply) => {
    const { id } = request.params;

    const deletedExamination = await db.delete(examinations).where(eq(examinations.id, +id)).returning();

    if (!deletedExamination.length) {
      return reply.code(404).send({ error: "Examination not found" });
    }

    return { message: "Examination deleted successfully" };
  });

  // Create exam center
  fastify.post(
    "/:id/centers",
    {
      schema: {
        body: zodToJsonSchema(createExamCenterSchema),
      },
    },
    async (request: FastifyRequest<{ Body: ExamCenterInput }>, reply) => {
      try {
        const { id } = request.params as { id: string };
        const centerData = {
          ...request.body,
          examinationId: Number.parseInt(id),
        };

        const newCenter = await db.insert(examCenters).values(centerData).returning();

        // Update examination totals
        const result = await db
          .select({
            centerCount: count(),
            totalJammers: sum(examCenters.jammersRequired),
          })
          .from(examCenters)
          .where(eq(examCenters.examinationId, parseInt(id, 10)));

        const { centerCount, totalJammers } = result[0] ?? {
          centerCount: 0,
          totalJammers: "0",
        };

        await db
          .update(examinations)
          .set({
            totalCenters: centerCount,
            totalJammersRequired: Number(totalJammers ?? "0"),
            updatedAt: new Date(),
          })
          .where(eq(examinations.id, parseInt(id, 10)));

        return reply.code(201).send(newCenter[0]);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );
}
