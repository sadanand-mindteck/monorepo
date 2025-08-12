import Fastify, { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import dotenv from "dotenv";
import path from "path";
import fastifyStatic from "@fastify/static";
dotenv.config();
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import cors from "@fastify/cors";
import { ZodError } from "zod";
import { DrizzleError, DrizzleQueryError } from "drizzle-orm";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod"
//
import { authenticate } from "./Middleware/authenticate.middleware.js";
// Import routes
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import examinationRoutes from "./routes/examinations.js";
import jammerRoutes from "./routes/jammers.js";
import organizationRoutes from "./routes/organizations.js";
import shipmentRoutes from "./routes/shipments.js";
import fileRoutes from "./routes/files.js";

const fastify = Fastify({
  logger:true
});



fastify.setValidatorCompiler(validatorCompiler)
fastify.setSerializerCompiler(serializerCompiler)

async function setup (){
  // Register plugins


  //cors
  fastify.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  });

  fastify.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET, // Optional, for signed cookies
  });

  await fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET!,
    sign: {
      expiresIn: "24h",
    },
  });


  //
  fastify.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.code(401).send({ error: "Unauthorized" });
      }
    }
  );

  fastify.addHook("onRequest", async (request, reply) => {
    if (
      request.raw.url?.startsWith("/api/auth/login") ||
      request.raw.url?.startsWith("/api/auth/reset-password") ||
      request.raw.url?.startsWith("/docs")
    ) {
      return;
    }
    await authenticate(request, reply);
  });


  // swagger

  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "JIMS API",
        description: "Jammer Installation Management System API Documentation",
        version: "1.0.0",
        contact: {
          name: "JIMS Support",
          email: "support@jims.com",
        },
      },
      servers: [
        {
          url:
            process.env.NODE_ENV === "production"
              ? "https://api.jims.com"
              : "http://localhost:3001",
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
      tags: [
        {
          name: "Authentication",
          description: "Authentication and MFA endpoints",
        },
        {
          name: "Dashboard",
          description: "Dashboard and statistics endpoints",
        },
        {
          name: "Examinations",
          description: "Examination management endpoints",
        },
        { name: "Jammers", description: "Jammer inventory endpoints" },
        {
          name: "Organizations",
          description: "Organization management endpoints",
        },
        { name: "Shipments", description: "Shipment tracking endpoints" },
        { name: "Files", description: "File upload and management endpoints" },
        { name: "Users", description: "User management endpoints" },
      ],
    },
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "none",
      deepLinking: true,
      defaultModelsExpandDepth: -1,
      displayRequestDuration: true,
      showExtensions: true,
      showCommonExtensions: true,
    },

    uiHooks: {
      onRequest: function (_, __, next) {
        next();
      },
      preHandler: function (_, __, next) {
        next();
      },
    },

    staticCSP: true,

    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });

  // 

  await fastify.register(multipart, {
    limits: {
      fileSize: Number.parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB
    },
  });

  await fastify.register(fastifyStatic, {
    root: path.resolve(process.env.UPLOAD_PATH || "./uploads"),
    prefix: "/uploads/",
  });

  // Register routes
  await fastify.register(authRoutes, { prefix: "/api/auth" });
  await fastify.register(dashboardRoutes, { prefix: "/api/dashboard" });
  await fastify.register(examinationRoutes, { prefix: "/api/examinations" });
  await fastify.register(jammerRoutes, { prefix: "/api/jammers" });
  await fastify.register(organizationRoutes, { prefix: "/api/organizations" });
  await fastify.register(shipmentRoutes, { prefix: "/api/shipments" });
  await fastify.register(fileRoutes, { prefix: "/api/files" });




  // Health check endpoint
  fastify.get("/health", { schema: { tags: ["HEALTH"] } }, async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));




  // Error handler
fastify.setErrorHandler((error: any, request, reply) => {
  console.log(error,"==========================================Error occurred=============================================");

  // Zod validation error
  if (error instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      error: "Validation Error",
      message: "Invalid request data",
      issues: error.issues,
    });
  }

  // Fastify validation error
  if ((error as FastifyError).validation) {
    return reply.status(400).send({
      statusCode: 400,
      error: "Validation Error",
      message: "Invalid request parameters",
      details: (error as FastifyError).validation,
    });
  }

  // Drizzle or database error
  if (error instanceof DrizzleError || error.code === "23505" || error.code === "23503") {
    return reply.status(400).send({
      statusCode: 400,
      error: "Database Error",
      message: error.detail || error.message,
      code: error.code,
    });
  }

  if (error instanceof DrizzleQueryError) {
    return reply.status(400).send({
      statusCode: 400,
      error: "Drizzle Query Error",
      message: error.message,
    });
  }

  // File upload error
  if (error.code === "FST_FILES_LIMIT") {
    return reply.status(400).send({
      statusCode: 400,
      error: "File Upload Error",
      message: `File size limit exceeded. Max allowed: ${process.env.MAX_FILE_SIZE || 10485760} bytes`,
    });
  }

  // Fallback to generic 500
  return reply.status(500).send({
    statusCode: 500,
    error: "Internal Server Error....",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : error.message,
  });
});
};

// Start server
(async () => {
  try {
    await setup();

    const port = Number(process.env.PORT) || 3001;
    const host =
      process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";

    await fastify.listen({ port, host });

    console.log(`🚀 Server running on http://${host}:${port}`);
    console.log(
      `📚 API Documentation available at http://${host}:${port}/docs`
    );
    // console.log(`🔒 MFA Support: Email, SMS, TOTP`);
    console.log(
      `📁 File Upload: Enabled with ${process.env.MAX_FILE_SIZE || 10485760} bytes limit`
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
