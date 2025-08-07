import { db } from "../db/connection.js";
import { jammers, organizations } from "../db/schema.js";
import { createJammerSchema, updateJammerSchema } from "../schemas/jammer.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { eq, desc, like, or, count, and } from "drizzle-orm";
import { FastifyInstance, FastifyRequest } from "fastify";
import { JammerInput, JammerQuery, JammerStatus, JammerUpdate } from "../types/jammers.types.js";


export default async function jammerRoutes(fastify: FastifyInstance) {
  // Get all jammers
  fastify.get(
    "/",
    {},
    async (request: FastifyRequest<{ Querystring: JammerQuery }>, reply) => {
      try {
        const {
          status,
          location,
          model,
          search,
          page = 1,
          limit = 10,
        } = request.query;
        const offset = (page - 1) * limit;

        const conditions = [];
        if (status) {
          conditions.push(eq(jammers.status, status));
        }
        if (model) {
          conditions.push(like(jammers.model, `%${model}%`));
        }
        if (search) {
          conditions.push(
            or(
              like(jammers.serialNumber, `%${search}%`),
              like(jammers.model, `%${search}%`)
            )
          );
        }

        const queryBuilder = db
          .select({
            id: jammers.id,
            serialNumber: jammers.serialNumber,
            model: jammers.model,
            status: jammers.status,
            batteryLevel: jammers.batteryLevel,
            currentLocationId: jammers.currentLocationId,
            locationName: organizations.name,
            lastMaintenance: jammers.lastMaintenance,
            createdAt: jammers.createdAt,
          })
          .from(jammers)
          .leftJoin(
            organizations,
            eq(jammers.currentLocationId, organizations.id)
          );

        const query = queryBuilder
          .where(
            conditions.length === 0
              ? undefined!
              : conditions.length === 1
                ? conditions[0]
                : and(...conditions)
          )
          .orderBy(desc(jammers.createdAt))
          .limit(limit)
          .offset(offset);

        const results = await query;

        // Get total count
        const totalQuery = db.select({ count: count() }).from(jammers);
        const [{ count: total }] = await totalQuery;

        return {
          data: results,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  // Get jammer by ID
  fastify.get("/:id", {}, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const jammer = await db
        .select({
          id: jammers.id,
          serialNumber: jammers.serialNumber,
          model: jammers.model,
          status: jammers.status,
          batteryLevel: jammers.batteryLevel,
          currentLocationId: jammers.currentLocationId,
          locationName: organizations.name,
          lastMaintenance: jammers.lastMaintenance,
          createdAt: jammers.createdAt,
          updatedAt: jammers.updatedAt,
        })
        .from(jammers)
        .leftJoin(
          organizations,
          eq(jammers.currentLocationId, organizations.id)
        )
        .where(eq(jammers.id, Number(id)))
        .limit(1);

      if (!jammer.length) {
        return reply.code(404).send({ error: "Jammer not found" });
      }

      return jammer[0];
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: "Internal server error" });
    }
  });

  // Create jammer
  fastify.post(
    "/",
    {
      schema: {
        body: zodToJsonSchema(createJammerSchema),
      },
    },
    async (request: FastifyRequest<{ Body: JammerInput }>, reply) => {
      try {
        const jammerData = request.body;

        const newJammer = await db
          .insert(jammers)
          .values(jammerData)
          .returning();

        return reply.code(201).send(newJammer[0]);
      } catch (error: any) {
        fastify.log.error(error);
        if (error.code === "23505") {
          // Unique constraint violation
          return reply
            .code(400)
            .send({ error: "Serial number already exists" });
        }
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  // Update jammer
  fastify.put(
    "/:id",
    {
      schema: {
        body: zodToJsonSchema(updateJammerSchema),
      },
    },
    async (request: FastifyRequest<{ Body: JammerUpdate }>, reply) => {
      try {
        const { id } = request.params as { id: string };
        const updateData = { ...request.body, updatedAt: new Date() };

        const updatedJammer = await db
          .update(jammers)
          .set(updateData)
          .where(eq(jammers.id, Number(id)))
          .returning();

        if (!updatedJammer.length) {
          return reply.code(404).send({ error: "Jammer not found" });
        }

        return updatedJammer[0];
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  // Delete jammer
  fastify.delete("/:id", {}, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const deletedJammer = await db
        .delete(jammers)
        .where(eq(jammers.id, Number(id)))
        .returning();

      if (!deletedJammer.length) {
        return reply.code(404).send({ error: "Jammer not found" });
      }

      return { message: "Jammer deleted successfully" };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: "Internal server error" });
    }
  });

  // Get jammer statistics
  fastify.get("/stats/overview", {}, async (request, reply) => {
    try {
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
        byStatus: stats.reduce((acc, stat) => {
          acc[stat.status] = stat.count;
          return acc;
        }, {} as Record<JammerStatus, number>),
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: "Internal server error" });
    }
  });
}
