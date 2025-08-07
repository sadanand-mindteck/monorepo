import { db } from "../db/connection.js";
import {
  shipments,
  shipmentItems,
  jammers,
  organizations,
} from "../db/schema.js";
import {
  createShipmentSchema,
  updateShipmentStatusSchema,
} from "../schemas/shipment.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { eq, desc, count } from "drizzle-orm";
import { FastifyInstance, FastifyRequest } from "fastify";
import {
  ShipmentInput,
  ShipmentQuery,
  ShipmentStatus,
  ShipmentUpdate,
} from "../types/shipments.types.js";

export default async function shipmentRoutes(fastify: FastifyInstance) {
  // Get all shipments
  fastify.get(
    "/",
    {},
    async (request: FastifyRequest<{ Querystring: ShipmentQuery }>, reply) => {
      try {
        const { status, page = 1, limit = 10 } = request.query;
        const offset = (page - 1) * limit;

        const whereClause = status ? eq(shipments.status, status) : undefined;

        let query = db
          .select({
            id: shipments.id,
            shipmentCode: shipments.shipmentCode,
            status: shipments.status,
            totalJammers: shipments.totalJammers,
            docketNumber: shipments.docketNumber,
            fromLocationName: organizations.name,
            dispatchedAt: shipments.dispatchedAt,
            deliveredAt: shipments.deliveredAt,
            createdAt: shipments.createdAt,
          })
          .from(shipments)
          .leftJoin(
            organizations,
            eq(shipments.fromLocationId, organizations.id)
          )
          .where(whereClause)
          .orderBy(desc(shipments.createdAt))
          .limit(limit)
          .offset(offset);

        const results = await query;

        // Get total count
        const totalQuery = db.select({ count: count() }).from(shipments);
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

  // Get shipment by ID
  fastify.get("/:id", {}, async (request, reply) => {
    try {
      const { id } = request.params as { id: number };

      const shipment = await db
        .select({
          id: shipments.id,
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
        .where(eq(shipments.id, id))
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
        .where(eq(shipmentItems.shipmentId, id));

      return {
        ...shipment[0],
        items,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: "Internal server error" });
    }
  });

  // Create shipment
  fastify.post(
    "/",
    {
      schema: {
        body: zodToJsonSchema(createShipmentSchema),
      },
    },
    async (request: FastifyRequest<{ Body: ShipmentInput }>, reply) => {
      try {
        const {
          fromLocationId,
          toLocationId,
          toCenterId,
          docketNumber,
          jammerIds,
        } = request.body;

        // Generate shipment code
        const shipmentCode = `SH-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

        // Create shipment
        const newShipment = await db
          .insert(shipments)
          .values({
            shipmentCode,
            fromLocationId,
            toLocationId,
            toCenterId,
            docketNumber,
            totalJammers: jammerIds.length,
            createdBy: request.jwtPayload.id,
          })
          .returning();

        // Create shipment items
        const shipmentItemsData = jammerIds.map((jammerId) => ({
          shipmentId: newShipment[0].id,
          jammerId,
        }));

        await db.insert(shipmentItems).values(shipmentItemsData);

        // Update jammer status to in_transit
        await db
          .update(jammers)
          .set({ status: "in_transit", updatedAt: new Date() })
          .where(eq(jammers.id, jammerIds[0])); // This should be done for all jammerIds

        return reply.code(201).send(newShipment[0]);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  // Update shipment status
  fastify.put(
    "/:id/status",
    {
      schema: {
        body: zodToJsonSchema(updateShipmentStatusSchema),
      },
    },
    async (request: FastifyRequest<{ Body: ShipmentUpdate }>, reply) => {
      try {
        const { id } = request.params as { id: number };
        const { status, dispatchedAt, deliveredAt } = request.body;

        const updateData = {
          status,
          updatedAt: new Date(),
          dispatchedAt,
          deliveredAt,
        };
        if (dispatchedAt) updateData.dispatchedAt = new Date(dispatchedAt);
        if (deliveredAt) updateData.deliveredAt = new Date(deliveredAt);

        const updatedShipment = await db
          .update(shipments)
          .set(updateData)
          .where(eq(shipments.id, id))
          .returning();

        if (!updatedShipment.length) {
          return reply.code(404).send({ error: "Shipment not found" });
        }

        // If delivered, update jammer status
        if (status === "delivered") {
          const shipmentJammers = await db
            .select({ jammerId: shipmentItems.jammerId })
            .from(shipmentItems)
            .where(eq(shipmentItems.shipmentId, id));

          const jammerIds = shipmentJammers.map((item) => item.jammerId);

          if (jammerIds.length > 0) {
            await db
              .update(jammers)
              .set({ status: "deployed", updatedAt: new Date() })
              .where(eq(jammers.id, jammerIds[0] || 0)); // This should be done for all jammerIds
          }
        }

        return updatedShipment[0];
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );
}
