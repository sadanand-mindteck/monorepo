import { db } from "@jims/shared/db/connection.js";
import { examCenters, examinations, organizations, users } from "@jims/shared/db/schema.js";
import { eq, desc, like, or, count, and } from "drizzle-orm";
import { FastifyInstance } from "fastify";
import { createExamCenterSchema, updateExamCenterSchema, examCenterQuerySchema } from "@jims/shared/schema/examCenter.js";
import { requestParam } from "@jims/shared/schema/common.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export default async function examCenterRoutes(fastify: FastifyInstance) {
  // Get all exam centers (with pagination + filters)
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "",
    {
      schema: {
        tags: ["Exam Centers"],
        summary: "Get all exam centers with pagination",
        querystring: examCenterQuerySchema,
      },
    },
    async (request) => {
      const { search, page = 1, limit = 10 } = request.query;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (search) {
        conditions.push(or(like(examCenters.name, `%${search}%`), like(examCenters.address, `%${search}%`)));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const dataQuery = db
        .select({
          id: examCenters.id,
          name: examCenters.name,
          address: examCenters.address,
          latitude: examCenters.latitude,
          longitude: examCenters.longitude,
          jammersRequired: examCenters.jammersRequired,
          reportingTime: examCenters.reportingTime,
          examStartTime: examCenters.examStartTime,
          assignedAgencyId: examCenters.assignedAgencyId,
          assignedOperatorId: examCenters.assignedOperatorId,
          agencyName: organizations.name,
          operatorName: users.name,
          createdAt: examCenters.createdAt,
        })
        .from(examCenters)
        .leftJoin(organizations, eq(examCenters.assignedAgencyId, organizations.id))
        .leftJoin(users, eq(examCenters.assignedOperatorId, users.id))
        .where(whereClause)
        .orderBy(desc(examCenters.createdAt))
        .limit(limit)
        .offset(offset);

      const totalQuery = db.select({ count: count() }).from(examCenters).where(whereClause);

      const [results, totalResult] = await Promise.all([dataQuery, totalQuery]);
      const total = totalResult.at(0) || { count: 0 };

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

  // Get exam center by ID
  fastify.withTypeProvider<ZodTypeProvider>().get("/:id", { schema: { params: requestParam } }, async (request, reply) => {
    const { id } = request.params;

    const center = await db
      .select({
        id: examCenters.id,
        examinationId: examCenters.examinationId,
        name: examCenters.name,
        address: examCenters.address,
        latitude: examCenters.latitude,
        longitude: examCenters.longitude,
        jammersRequired: examCenters.jammersRequired,
        reportingTime: examCenters.reportingTime,
        examStartTime: examCenters.examStartTime,
        assignedAgencyId: examCenters.assignedAgencyId,
        assignedOperatorId: examCenters.assignedOperatorId,
        agencyName: organizations.name,
        operatorName: users.name,
      })
      .from(examCenters)
      .leftJoin(organizations, eq(examCenters.assignedAgencyId, organizations.id))
      .leftJoin(users, eq(examCenters.assignedOperatorId, users.id))
      .where(eq(examCenters.id, +id))
      .limit(1);

    if (!center.length) {
      return reply.code(404).send({ error: "Exam Center not found" });
    }

    return center[0];
  });

  // Create exam center
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "",
    {
      schema: {
        body: createExamCenterSchema,
        tags: ["Exam Centers"],
        summary: "Create a new exam center",
      },
    },
    async (request, reply) => {
      const centerData = {
        ...request.body,
        assignedAgencyId: +request.body.assignedAgencyId,
        assignedOperatorId: +request.body.assignedOperatorId,
        examinationId: +request.body.examinationId,
        examStartTime: new Date(request.body.examStartTime),
        reportingTime: new Date(request.body.reportingTime),
        createdBy: request.jwtPayload.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newCenter = await db.insert(examCenters).values(centerData).returning();
      return reply.code(201).send(newCenter[0]);
    }
  );

  // Update exam center
  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/:id",
    {
      schema: {
        body: updateExamCenterSchema,
        params: requestParam,
        tags: ["Exam Centers"],
        summary: "Update exam center by ID",
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const updateData = {
        ...request.body,
        assignedAgencyId: request.body.assignedAgencyId ? +request.body.assignedAgencyId : undefined,
        assignedOperatorId: request.body.assignedOperatorId ? +request.body.assignedOperatorId : undefined,
        examinationId: request.body.examinationId ? +request.body.examinationId : undefined,
        examStartTime: request.body.examStartTime ? new Date(request.body.examStartTime) : undefined,
        reportingTime: request.body.reportingTime ? new Date(request.body.reportingTime) : undefined,
        updatedAt: new Date(),
      };

      const updatedCenter = await db.update(examCenters).set(updateData).where(eq(examCenters.id, +id)).returning();

      if (!updatedCenter.length) {
        return reply.code(404).send({ error: "Exam Center not found" });
      }

      return updatedCenter[0];
    }
  );

  // Delete exam center
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .delete(
      "/:id",
      { schema: { params: requestParam, tags: ["Exam Centers"], summary: "Delete exam center by ID" } },
      async (request, reply) => {
        const { id } = request.params;

        const deletedCenter = await db.delete(examCenters).where(eq(examCenters.id, +id)).returning();

        if (!deletedCenter.length) {
          return reply.code(404).send({ error: "Exam Center not found" });
        }

        return { message: "Exam Center deleted successfully" };
      }
    );
}
