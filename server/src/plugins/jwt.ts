import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { config } from "../config/env.js";
import { authenticate } from "../Middleware/authenticate.middleware.js";

// Extend Fastify types so `app.authenticate` is known globally

export async function registerJwt(app: FastifyInstance) {
  // Register @fastify/jwt
  await app.register(fastifyJwt, {
    secret: config.JWT_SECRET,
    sign: { expiresIn: "24h" },
    cookie: {
      cookieName: "auth_token", // cookie name
      signed: false,
    },
  });

  // Define authenticate decorator
  // app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
  //   try {
  //     await request.jwtVerify();
  //   } catch {
  //     reply.code(401).send({ error: "Unauthorized" });
  //   }
  // });

  // Global onRequest hook to protect all routes except a few
  app.addHook("onRequest", async (request, reply) => {
    if (
      request.raw.url?.startsWith("/api/auth/login") ||
      request.raw.url?.startsWith("/api/auth/reset-password") ||
      request.raw.url?.startsWith("/docs")
    ) {
      return; // Skip auth for these
    }

    await authenticate(request, reply);
  });
}
