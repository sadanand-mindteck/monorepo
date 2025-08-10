import { db } from "@jims/db/connection";
import { organizations } from "@jims/db/schema";
import { createOrganizationSchema, updateOrganizationSchema, organizationQuerySchema } from "@jims/types/organization";
import { requestParam } from "@jims/types/common";
import { eq, desc, like, count, and } from "drizzle-orm";
import { FastifyInstance } from "fastify";

import { ZodTypeProvider } from "fastify-type-provider-zod";

export default async function organizationRoutes(fastify: FastifyInstance) {
  // Get all organizations
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/",
    {
      schema: {
        tags: ["Organization"],
        summary: "Get all Organization",
        querystring: organizationQuerySchema,
      },
    },
    async (request) => {
      const { type, search, page=1, limit =10 } = request.query;
     

      const offset = (page - 1) * limit;

      const conditions = [];
      // Apply filters
      if (type) {
        conditions.push(eq(organizations.type, type));
      }
      if (search) {
        conditions.push(like(organizations.name, `%${search}%`));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const query = db.select().from(organizations).where(whereClause).orderBy(desc(organizations.createdAt)).limit(limit).offset(offset);

      const results = await query;

      // Get total count
      const totalQuery = await db.select({ count: count() }).from(organizations);
      const total = totalQuery[0]!.count

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

  // Get organization by ID
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/:id",
    {
      schema: {
        tags: ["Organization"],
        summary: "Get all Organization",
        params: requestParam,
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const organization = await db.select().from(organizations).where(eq(organizations.id, +id)).limit(1);

      if (!organization.length) {
        return reply.code(404).send({ error: "Organization not found" });
      }

      return organization[0];
    }
  );

  // Create organization
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/",
    {
      schema: {
        tags: ["Organization"],
        summary: "create all Organization",
        body: createOrganizationSchema,
      },
    },
    async (request, reply) => {
      const organizationData = request.body;

      const newOrganization = await db.insert(organizations).values(organizationData).returning();

      return reply.code(201).send(newOrganization[0]);
    }
  );

  // Update organization
  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/:id",
    {
      schema: {
        tags: ["Organization"],
        summary: "update all Organization",
        body: updateOrganizationSchema,
        params: requestParam,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const updateData = { ...request.body, updatedAt: new Date() };

      const updatedOrganization = await db.update(organizations).set(updateData).where(eq(organizations.id, +id)).returning();

      if (!updatedOrganization.length) {
        return reply.code(404).send({ error: "Organization not found" });
      }

      return updatedOrganization[0];
    }
  );

  // Delete organization
  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/:id",
    {
      schema: {
        tags: ["Organization"],
        summary: "update all Organization",
        params: requestParam,
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const deletedOrganization = await db.delete(organizations).where(eq(organizations.id, +id)).returning();

      if (!deletedOrganization.length) {
        return reply.code(404).send({ error: "Organization not found" });
      }

      return { message: "Organization deleted successfully" };
    }
  );
}
