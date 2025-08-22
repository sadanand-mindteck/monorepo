import { db } from "@jims/shared/db/connection.js";
import { shipments, shipmentItems, jammers, organizations } from "@jims/shared/db/schema.js";
import { createShipmentSchema, updateShipmentSchema, shipmentQuerySchema } from "@jims/shared/schema/shipment.js";
import { eq, desc, count, inArray } from "drizzle-orm";
import { FastifyInstance } from "fastify";
import { requestParam } from "@jims/shared/schema/common.js";

import { ZodTypeProvider } from "fastify-type-provider-zod";

export default async function shipmentRoutes(fastify: FastifyInstance) {
  // Get all shipments
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "",
    {
      schema: {
        tags: ["Shipments"],
        summary: "Get all shipments",
        querystring: shipmentQuerySchema,
      },
    },
    async (request, reply) => {
      const { status, page = 1, limit = 10 } = request.query;
      const offset = (page - 1) * limit;

      const whereClause = status ? eq(shipments.status, status) : undefined;

      let query = db
        .select({
          id: shipments.id,
          shipmentCode: shipments.shipmentCode,
          shipmentStage: shipments.shipmentStage,
          status: shipments.status,
          totalJammers: shipments.totalJammers,
          docketNumber: shipments.docketNumber,
          fromLocationName: organizations.name,
          dispatchedAt: shipments.dispatchedAt,
          deliveredAt: shipments.deliveredAt,
          createdAt: shipments.createdAt,
        })
        .from(shipments)
        .leftJoin(organizations, eq(shipments.fromLocationId, organizations.id))
        .where(whereClause)
        .orderBy(desc(shipments.createdAt))
        .limit(limit)
        .offset(offset);

      const results = await query;

      // Get total count
      const totalQuery = await db.select({ count: count() }).from(shipments);

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

  // Get shipment by ID
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/:id",
    {
      schema: {
        tags: ["Shipments"],
        summary: "Get all shipments by id",
        params: requestParam,
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const shipment = await db
        .select({
          id: shipments.id,
          shipmentStage: shipments.shipmentStage,
          shipmentCode: shipments.shipmentCode,
          status: shipments.status,
          totalJammers: shipments.totalJammers,
          docketNumber: shipments.docketNumber,
          fromLocationId: shipments.fromLocationId,
          toLocationId: shipments.toLocationId,
          toCenterId: shipments.toCenterId,
          fromLocationName: organizations.name,
          dispatchedAt: shipments.dispatchedAt,
          deliveredAt: shipments.deliveredAt,
          createdAt: shipments.createdAt,
        })
        .from(shipments)
        .leftJoin(organizations, eq(shipments.fromLocationId, organizations.id))
        .where(eq(shipments.id, +id))
        .limit(1);

      if (!shipment.length) {
        return reply.code(404).send({ error: "Shipment not found" });
      }

      // Get shipment items
      const items = await db
        .select({
          id: shipmentItems.id,
          jammerId: shipmentItems.jammerId,
          serialNumber: jammers.serialNumber,
          model: jammers.model,
          status: jammers.status,
        })
        .from(shipmentItems)
        .leftJoin(jammers, eq(shipmentItems.jammerId, jammers.id))
        .where(eq(shipmentItems.shipmentId, +id));

      return {
        ...shipment[0],
        items,
      };
    }
  );

  // Create shipment
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "",
    {
      schema: {
        tags: ["Shipments"],
        summary: "create shipment",
        body: createShipmentSchema,
      },
    },
    async (request, reply) => {
      const { fromLocationId, shipmentStage, toLocationId, toCenterId, docketNumber, jammerIds } = request.body;

      // Generate shipment code
      const shipmentCode = `SH-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      const newShipment = await db.transaction(async (tx) => {
        // 1. Create shipment
        const [shipment] = await tx
          .insert(shipments)
          .values({
            shipmentStage,
            shipmentCode,
            fromLocationId,
            toLocationId,
            toCenterId,
            docketNumber,
            totalJammers: jammerIds.length,
            createdBy: request.jwtPayload.id,
            updatedAt: new Date(),
            createdAt: new Date(),
          })
          .returning();

        // 2. Create shipment items
        const shipmentItemsData = jammerIds.map((jammerId) => ({
          shipmentId: shipment!.id,
          jammerId,
        }));

        await tx.insert(shipmentItems).values(shipmentItemsData);

        // 3. Update jammers status
        await tx.update(jammers).set({ status: "in_transit", updatedAt: new Date() }).where(inArray(jammers.id, jammerIds));

        return shipment;
      });

      return reply.code(201).send(newShipment);
    }
  );

  // Update shipment status
  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/:id/status",
    {
      schema: {
        body: updateShipmentSchema,
        params: requestParam,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { status, dispatchedAt, deliveredAt } = request.body;

      const updateData = {
        status,
        updatedAt: new Date(),
        dispatchedAt,
        deliveredAt,
      };
      if (dispatchedAt) updateData.dispatchedAt = new Date(dispatchedAt);
      if (deliveredAt) updateData.deliveredAt = new Date(deliveredAt);

      const updatedShipment = await db.update(shipments).set(updateData).where(eq(shipments.id, +id)).returning();

      if (!updatedShipment.length) {
        return reply.code(404).send({ error: "Shipment not found" });
      }

      // If delivered, update jammer status
      if (status === "delivered") {
        const shipmentJammers = await db
          .select({ jammerId: shipmentItems.jammerId })
          .from(shipmentItems)
          .where(eq(shipmentItems.shipmentId, +id));

        const jammerIds = shipmentJammers.map((item) => item.jammerId).filter((j) => j !== null);

        if (jammerIds.length > 0) {
          await db.update(jammers).set({ status: "deployed", updatedAt: new Date() }).where(inArray(jammers.id, jammerIds)); // This should be done for all jammerIds
        }
      }

      return updatedShipment[0];
    }
  );
}
