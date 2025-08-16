import { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { config } from "../config/env.js";

export async function registerSwagger(app: FastifyInstance) {
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "JIMS API",
        description: "Jammer Installation Management System API Documentation",
        version: "1.0.0",
        contact: { name: "JIMS Support", email: "support@jims.com" },
      },
      servers: [
        {
          url: config.isProduction ? "https://api.jims.com" : `http://localhost:${config.PORT}`,
        },
      ],
      components: {
        securitySchemes: {
          Bearer: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Enter JWT token in format: Bearer <token>",
          },
        },
        schemas: {
          ErrorResponse: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          Pagination: {
            type: "object",
            properties: {
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 10 },
              total: { type: "integer", example: 100 },
              pages: { type: "integer", example: 10 },
            },
          },
        },
      },
      security: [{ Bearer: [] }],
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "none",
      deepLinking: true,
      defaultModelsExpandDepth: -1,
      displayRequestDuration: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => swaggerObject,
    transformSpecificationClone: true,
  });
}
