import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { registerPlugins } from "./plugins/index.js";
import { setupErrorHandler } from "./Error/index.js";
import { registerRoutes } from "./routes/index.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  // Setup validation/serialization
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Register plugins (cors, jwt, swagger, etc.)
  await registerPlugins(app);

  // Register centralized error handler
  setupErrorHandler(app);

  // Register routes
  await registerRoutes(app);

  // Health check
  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  return app;
}
