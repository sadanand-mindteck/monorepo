import { db } from "@jims/shared/db/connection.js";
import { jammers, organizations } from "@jims/shared/db/schema.js";
import {
  createJammerSchema,
  updateJammerSchema,
  JammerInput,
  JammerQuery,
  JammerStatus,
  JammerInputUpdate,
  jammerQuerySchema,
} from "@jims/shared/schema/jammer.js";
import { eq, desc, like, or, count, and } from "drizzle-orm";
import { FastifyInstance, FastifyRequest } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { requestParam } from "@jims/shared/schema/common.js";

export default async function jammerRoutes(fastify: FastifyInstance) {
  // Get all jammers
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "",
    {
      schema: {
        tags: ["Jammers"],
        summary: "Get all jammer",
        querystring: jammerQuerySchema,
      },
    },
    async (request, reply) => {
      const { status, model, search, page = 1, limit = 10 } = request.query;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (status) {
        conditions.push(eq(jammers.status, status));
      }
      if (model) {
        conditions.push(like(jammers.model, `%${model}%`));
      }
      if (search) {
        conditions.push(or(like(jammers.serialNumber, `%${search}%`), like(jammers.model, `%${search}%`)));
      }

      const queryBuilder = db
        .select({
          id: jammers.id,
          serialNumber: jammers.serialNumber,
          model: jammers.model,
          status: jammers.status,
          currentLocationId: jammers.currentLocationId,
          locationName: organizations.name,
          lastMaintenance: jammers.lastMaintenance,
          createdAt: jammers.createdAt,
        })
        .from(jammers)
        .leftJoin(organizations, eq(jammers.currentLocationId, organizations.id));

      const query = queryBuilder
        .where(conditions.length === 0 ? undefined! : conditions.length === 1 ? conditions[0] : and(...conditions))
        .orderBy(desc(jammers.createdAt))
        .limit(limit)
        .offset(offset);

      const results = await query;

      // Get total count
      const totalQuery = await db.select({ count: count() }).from(jammers);
      const total = totalQuery[0]!.count;

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

  // Get jammer by ID
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/:id",
    {
      schema: {
        tags: ["Jammers"],
        summary: "Get all jammer by id",
        params: requestParam,
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const jammer = await db
        .select({
          id: jammers.id,
          serialNumber: jammers.serialNumber,
          model: jammers.model,
          status: jammers.status,
          currentLocationId: jammers.currentLocationId,
          locationName: organizations.name,
          lastMaintenance: jammers.lastMaintenance,
          createdAt: jammers.createdAt,
          updatedAt: jammers.updatedAt,
        })
        .from(jammers)
        .leftJoin(organizations, eq(jammers.currentLocationId, organizations.id))
        .where(eq(jammers.id, Number(id)))
        .limit(1);

      if (!jammer.length) {
        return reply.code(404).send({ error: "Jammer not found" });
      }

      return jammer[0];
    }
  );

  // Create jammer
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "",
    {
      schema: {
        tags: ["Jammers"],
        summary: "Get all jammer by id",
        body: createJammerSchema,
      },
    },
    async (request, reply) => {
      const jammerData = request.body;
      const newJammer = await db.insert(jammers).values({...jammerData,createdBy:request.jwtPayload.id}).returning();

      return reply.code(201).send(newJammer[0]);
    }
  );

  // Update jammer
  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/:id",
    {
      schema: {
        tags: ["Jammers"],
        summary: "Update",
        body: updateJammerSchema,
        params: requestParam,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const updateData = { ...request.body, updatedAt: new Date() };

      const updatedJammer = await db
        .update(jammers)
        .set({...updateData,createdBy:request.jwtPayload.id})
        .where(eq(jammers.id, Number(id)))
        .returning();

      if (!updatedJammer.length) {
        return reply.code(404).send({ error: "Jammer not found" });
      }

      return updatedJammer[0];
    }
  );

  // Delete jammer
  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/:id",
    {
      schema: {
        tags: ["Jammers"],
        summary: "delete jammer",
        body: updateJammerSchema,
        params: requestParam,
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const deletedJammer = await db
        .delete(jammers)
        .where(eq(jammers.id, Number(id)))
        .returning();

      if (!deletedJammer.length) {
        return reply.code(404).send({ error: "Jammer not found" });
      }

      return { message: "Jammer deleted successfully" };
    }
  );

  // Get jammer statistics
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/stats/overview",
    {
      schema: {
        tags: ["Jammers"],
        summary: "status jammer",
      },
    },
    async () => {
      const stats = await db
        .select({
          status: jammers.status,
          count: count(),
        })
        .from(jammers)
        .groupBy(jammers.status);

      const totalJammers = stats.reduce((sum, stat) => sum + stat.count, 0);

      return {
        total: totalJammers,
        byStatus: stats.reduce(
          (acc, stat) => {
            acc[stat.status] = stat.count;
            return acc;
          },
          {} as Record<JammerStatus, number>
        ),
      };
    }
  );
}
