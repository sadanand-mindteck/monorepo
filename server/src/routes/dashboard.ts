import { FastifyInstance } from "fastify/types/instance.js";
import { db } from "@jims/shared/db/connection.js";
import { jammers, shipments, examinations, users, organizations, activityLogs } from "@jims/shared/db/schema.js";
import { count, eq, desc, gte } from "drizzle-orm";
import { JammerStatus } from "@jims/shared/schema/jammer.js";
import { ShipmentStatus } from "@jims/shared/schema/shipment.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { requestParam, requestParamLimit } from "@jims/shared/schema/common.js";

export default async function dashboardRoutes(fastify: FastifyInstance) {
  // Get dashboard statistics
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/stats",
    {
      schema: {
        tags: ["Dashboard"],
        summary: "Get dashboard statistics",
      },
    },
    async (request, reply) => {
      // Get jammer statistics
      const jammerStats = await db
        .select({
          status: jammers.status,
          count: count(),
        })
        .from(jammers)
        .groupBy(jammers.status);

      // Get shipment statistics
      const shipmentStats = await db
        .select({
          status: shipments.status,
          count: count(),
        })
        .from(shipments)
        .groupBy(shipments.status);

      // Get active examinations
      const activeExams = await db.select({ count: count() }).from(examinations).where(eq(examinations.status, "active"));

      // Get total organizations
      const totalOrgs = await db.select({ count: count() }).from(organizations);

      // Get total users
      const totalUsers = await db.select({ count: count() }).from(users);

      return {
        jammers: {
          total: jammerStats.reduce((sum, stat) => sum + stat.count, 0),
          byStatus: jammerStats.reduce(
            (acc, stat) => {
              acc[stat.status] = stat.count;
              return acc;
            },
            {} as Record<JammerStatus, number>
          ),
        },
        shipments: {
          total: shipmentStats.reduce((sum, stat) => sum + stat.count, 0),
          byStatus: shipmentStats.reduce(
            (acc, stat) => {
              acc[stat.status] = stat.count;
              return acc;
            },
            {} as Record<ShipmentStatus, number>
          ),
        },
        examinations: {
          active: activeExams[0]?.count || 0,
        },
        organizations: {
          total: totalOrgs[0]?.count || 0,
        },
        users: {
          total: totalUsers[0]?.count || 0,
        },
      };
    }
  );

  // Get recent activity
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/activity",
    {
      schema: {
        tags: ["Dashboard"],
        summary: "Get recent activity logs",
        querystring: requestParamLimit,
      },
    },
    async (request, reply) => {
      const { limit = 10 } = request.query;

      const activities = await db
        .select({
          id: activityLogs.id,
          action: activityLogs.action,
          entityType: activityLogs.entityType,
          entityId: activityLogs.entityId,
          details: activityLogs.details,
          userName: users.name,
          createdAt: activityLogs.createdAt,
        })
        .from(activityLogs)
        .leftJoin(users, eq(activityLogs.userId, users.id))
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit);

      return activities;
    }
  );

  // Get system health
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/health",
    {
      schema: {
        tags: ["Dashboard"],
        summary: "Get system health status",
      },
    },
    async (request, reply) => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Check recent activity
      const recentActivity = await db.select({ count: count() }).from(activityLogs).where(gte(activityLogs.createdAt, oneDayAgo));

      // Check faulty jammers
      const faultyJammers = await db.select({ count: count() }).from(jammers).where(eq(jammers.status, "faulty"));

      // Check pending shipments
      const pendingShipments = await db.select({ count: count() }).from(shipments).where(eq(shipments.status, "pending"));

      return {
        status: "healthy",
        checks: {
          recentActivity: recentActivity[0]?.count || 0,
          faultyJammers: faultyJammers[0]?.count || 0,
          pendingShipments: pendingShipments[0]?.count || 0,
        },
        timestamp: now,
      };
    }
  );
}
