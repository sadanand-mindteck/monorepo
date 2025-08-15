import { db } from "@jims/shared/db/connection.js";
import { organizations } from "@jims/shared/db/schema.js";
import { createOrganizationSchema, updateOrganizationSchema, organizationQuerySchema } from "@jims/shared/schema/organization.js";
import { requestParam } from "@jims/shared/schema/common.js";
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
      },
    },
    async () => {
      return await db.select().from(organizations).orderBy(desc(organizations.createdAt));
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
      const newOrganization = await db.insert(organizations).values(request.body).returning();

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
