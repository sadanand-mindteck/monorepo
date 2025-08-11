import { FastifyInstance } from "fastify";

export default async function corsPlugin(fastify:FastifyInstance) {
  await fastify.register(import("@fastify/cors"), {
    origin: process.env.NODE_ENV === "production" ? ["https://your-frontend-domain.com"] : true,
    credentials: true,
  })
}
