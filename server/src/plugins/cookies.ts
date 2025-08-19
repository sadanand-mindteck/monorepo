import { FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";

export async function registerCookies(app: FastifyInstance) {
  // First register cookie parser
  await app.register(cookie, {
    secret: process.env.COOKIE_SECRET || "a-very-secret-key", // for cookie signing
  });
}
