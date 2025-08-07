import { db } from "../db/connection.js";
import { organizations } from "../db/schema.js";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "../schemas/organization.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { eq, desc, like, count, and } from "drizzle-orm";
import { FastifyInstance, FastifyRequest } from "fastify";
import {
  OrganizationInput,
  OrganizationQuery,
  OrganizationUpdate,
} from "../types/organization.types.js";

export default async function organizationRoutes(fastify: FastifyInstance) {
  // Get all organizations
  fastify.get(
    "/",
    {},
    async (
      request: FastifyRequest<{ Querystring: OrganizationQuery }>,
      reply
    ) => {
      try {
        const { type, search } = request.query;
        const page = parseInt(request.query.page || "1", 10);
        const limit = parseInt(request.query.limit || "10", 10);
        const offset = (page - 1) * limit;

        const conditions = [];
        // Apply filters
        if (type) {
          conditions.push(eq(organizations.type, type));
        }
        if (search) {
          conditions.push(like(organizations.name, `%${search}%`));
        }
        const whereClause =
          conditions.length > 0 ? and(...conditions) : undefined;

        const query = db
          .select()
          .from(organizations)
          .where(whereClause)
          .orderBy(desc(organizations.createdAt))
          .limit(limit)
          .offset(offset);

        const results = await query;

        // Get total count
        const totalQuery = db.select({ count: count() }).from(organizations);
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

  // Get organization by ID
  fastify.get("/:id", {}, async (request, reply) => {
    try {
      const { id } = request.params as { id: number };

      const organization = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, id))
        .limit(1);

      if (!organization.length) {
        return reply.code(404).send({ error: "Organization not found" });
      }

      return organization[0];
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: "Internal server error" });
    }
  });

  // Create organization
  fastify.post(
    "/",
    {
      schema: {
        body: zodToJsonSchema(createOrganizationSchema),
      },
    },
    async (request: FastifyRequest<{ Body: OrganizationInput }>, reply) => {
      try {
        const organizationData = request.body;

        const newOrganization = await db
          .insert(organizations)
          .values(organizationData)
          .returning();

        return reply.code(201).send(newOrganization[0]);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  // Update organization
  fastify.put(
    "/:id",
    {
      schema: {
        body: zodToJsonSchema(updateOrganizationSchema),
      },
    },
    async (request: FastifyRequest<{ Body: OrganizationUpdate }>, reply) => {
      try {
        const { id } = request.params as { id: number };
        const updateData = { ...request.body, updatedAt: new Date() };

        const updatedOrganization = await db
          .update(organizations)
          .set(updateData)
          .where(eq(organizations.id, id))
          .returning();

        if (!updatedOrganization.length) {
          return reply.code(404).send({ error: "Organization not found" });
        }

        return updatedOrganization[0];
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  // Delete organization
  fastify.delete("/:id", {}, async (request, reply) => {
    try {
      const { id } = request.params as { id: number };

      const deletedOrganization = await db
        .delete(organizations)
        .where(eq(organizations.id, id))
        .returning();

      if (!deletedOrganization.length) {
        return reply.code(404).send({ error: "Organization not found" });
      }

      return { message: "Organization deleted successfully" };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: "Internal server error" });
    }
  });
}
