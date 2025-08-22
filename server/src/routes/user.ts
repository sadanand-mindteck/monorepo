import { db } from "@jims/shared/db/connection.js";
import { users as usersTable, organizations } from "@jims/shared/db/schema.js";
import { eq, desc, like, or, count, and } from "drizzle-orm";
import { FastifyInstance } from "fastify";
import { createUserSchema, userQuerySchema, userSchemaUpdate, userResponse } from "@jims/shared/schema/user.js";
import { requestParam } from "@jims/shared/schema/common.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { alias } from "drizzle-orm/pg-core";
import bcrypt from "bcryptjs";

const defaultPassword = process.env.DEFAULT_PASSWORD;

export default async function userRoutes(fastify: FastifyInstance) {
  // Get all users
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "",
    {
      schema: {
        tags: ["User"],
        summary: "Get all users pagination",
        querystring: userQuerySchema,
        // response: {
        //   200: userResponse,
        // },
      },
    },
    async (request) => {
      const { search, role, isActive, page = 1, limit = 10 } = request.query;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (search) {
        conditions.push(
          or(like(usersTable.name, `%${search}%`), like(usersTable.email, `%${search}%`), like(usersTable.phone, `%${search}%`))
        );
      }
      if (role) {
        conditions.push(eq(usersTable.role, role));
      }
      if (typeof isActive === "boolean") {
        conditions.push(eq(usersTable.isActive, isActive));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Alias creator
      const creator = alias(usersTable, "creator");

      const dataQuery = db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          phone: usersTable.phone,
          role: usersTable.role,
          isActive: usersTable.isActive,
          organizationId: usersTable.organizationId,
          // createdBy: usersTable.createdBy,
          createdAt: usersTable.createdAt,
          updatedAt: usersTable.updatedAt,
          // creatorName: creator.name,
          organizationName: organizations.name,
        })
        .from(usersTable)
        // .leftJoin(creator, eq(usersTable.createdBy, creator.id))
        .leftJoin(organizations, eq(usersTable.organizationId, organizations.id))
        .where(whereClause)
        .orderBy(desc(usersTable.createdAt))
        .limit(limit)
        .offset(offset);

      const totalQuery = db.select({ count: count() }).from(usersTable).where(whereClause);

      const [results, totalResult] = await Promise.all([dataQuery, totalQuery]);
      const total = totalResult.at(0) || { count: 0 };

      const a = {
        data: results,
        pagination: {
          page,
          limit,
          total: total.count,
          pages: Math.ceil(total.count / limit),
        },
      };

      return a;
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/getAllByAgencyId/:id",
    {
      schema: {
        tags: ["User"],
        summary: "Get all users",
        params: requestParam,

        // response: {
        //   200: userResponse,
        // },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const data = await db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          isActive: usersTable.isActive,
          organizationType: organizations.type,
        })
        .from(usersTable)
        .leftJoin(organizations, eq(usersTable.organizationId, organizations.id))
        .where(and(eq(organizations.id, +id), usersTable.isActive));

      reply.code(200).send(data);
    }
  );

  // Get single user
  fastify.withTypeProvider<ZodTypeProvider>().get("/:id", { schema: { params: requestParam } }, async (request, reply) => {
    const { id } = request.params;

    const creator = alias(usersTable, "creator");

    const user = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        phone: usersTable.phone,
        role: usersTable.role,
        isActive: usersTable.isActive,
        organizationId: usersTable.organizationId,
        createdBy: usersTable.createdBy,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
        creatorName: creator.name,
        organizationName: organizations.name,
      })
      .from(usersTable)
      .leftJoin(creator, eq(usersTable.createdBy, creator.id))
      .leftJoin(organizations, eq(usersTable.organizationId, organizations.id))
      .where(eq(usersTable.id, +id))
      .limit(1);

    if (!user.length) {
      return reply.code(404).send({ error: "User not found" });
    }

    return user[0];
  });

  // Create user
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "",
    {
      schema: {
        body: createUserSchema,
        tags: ["User"],
      },
    },
    async (request, reply) => {
      const hashedPassword = await bcrypt.hash(defaultPassword!, 10);
      console.log({
        ...request.body,
        organizationId: 4,
        password: hashedPassword,
        createdBy: request.jwtPayload.id,
        createdAt: new Date(),
      });

      const newUser = await db
        .insert(usersTable)
        .values({
          ...request.body,
          organizationId: +request.body.organizationId,
          password: hashedPassword,
          createdBy: request.jwtPayload.id,
          createdAt: new Date(),
        })
        .returning();

      return reply.code(201).send(newUser[0]);
    }
  );

  // Update user
  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/:id",
    {
      schema: {
        body: userSchemaUpdate,
        params: requestParam,
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const updatedUser = await db
        .update(usersTable)
        .set({
          ...request.body,
          organizationId: request.body.organizationId ? +request.body.organizationId : undefined,
          updatedAt: new Date(),
          createdBy: request.jwtPayload.id,
        })
        .where(eq(usersTable.id, +id))
        .returning();

      if (!updatedUser.length) {
        return reply.code(404).send({ error: "User not found" });
      }

      return updatedUser[0];
    }
  );

  // Delete user
  fastify.withTypeProvider<ZodTypeProvider>().delete("/:id", { schema: { params: requestParam } }, async (request, reply) => {
    const { id } = request.params;

    const deleted = await db.delete(usersTable).where(eq(usersTable.id, +id)).returning();

    if (!deleted.length) {
      return reply.code(404).send({ error: "User not found" });
    }

    return { message: "User deleted successfully" };
  });
}
