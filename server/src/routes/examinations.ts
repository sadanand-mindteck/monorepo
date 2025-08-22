import { db } from "@jims/shared/db/connection.js";
import { examinations, examCenters, organizations, users } from "@jims/shared/db/schema.js";
import { eq, desc, like, or, count, and, sum } from "drizzle-orm";
import { FastifyInstance } from "fastify";
import { createExaminationSchema, examinationSchemaUpdate, examinationQuerySchema } from "@jims/shared/schema/examination.js";

import { requestParam } from "@jims/shared/schema/common.js";

import { ZodTypeProvider } from "fastify-type-provider-zod";

export default async function examinationRoutes(fastify: FastifyInstance) {
  // Get all examinations
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "",
    {
      schema: {
        tags: ["Examinations"],
        summary: "Get all examinations pagination",
        querystring: examinationQuerySchema,
      },
    },
    async (request) => {
      // 1. Safely parse query parameters into numbers
      const { search, status, page = 1, limit = 10 } = request.query;

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

      const total = totalResult.at(0) || { count: 1 };

      return {
        data: results,
        pagination: {
          page,
          limit,
          total: total.count,
          pages: Math.ceil(total.count / limit),
        },
      };
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/getAllActive",
    {
      schema: {
        tags: ["Examinations"],
        summary: "Get all examinations",
      },
    },
    async (request, reply) => {
      const dataQuery = await db
        .select({
          id: examinations.id,
          name: examinations.name,
          examCode: examinations.examCode,
          examDate: examinations.examDate,
        })
        .from(examinations)
        .where(eq(examinations.status, "active"));

      reply.code(200).send(dataQuery);
    }
  );

  // Get examination by ID
  fastify.withTypeProvider<ZodTypeProvider>().get("/:id", { schema: { params: requestParam } }, async (request, reply) => {
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
  });

  // Create examination
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "",
    {
      schema: {
        body: createExaminationSchema,
      },
    },
    async (request, reply) => {
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
    }
  );

  // Update examination
  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/:id",
    {
      schema: {
        body: examinationSchemaUpdate,
        params: requestParam,
      },
    },

    async (request, reply) => {
      const { id } = request.params;
      const updateData = {
        ...request.body,
        updatedAt: new Date(),
        createdBy: request.jwtPayload.id,
        examDate: new Date(request.body.examDate),
      };

      const updatedExamination = await db.update(examinations).set(updateData).where(eq(examinations.id, +id)).returning();

      if (!updatedExamination.length) {
        return reply.code(404).send({ error: "Examination not found" });
      }

      return updatedExamination[0];
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
}
