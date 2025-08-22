import { FastifyInstance } from "fastify";
import authRoutes from "./auth.js";
import dashboardRoutes from "./dashboard.js";
import examinationRoutes from "./examinations.js";
import jammerRoutes from "./jammers.js";
import organizationRoutes from "./organizations.js";
import shipmentRoutes from "./shipments.js";
import fileRoutes from "./files.js";
import userRoutes from "./user.js";
import examCenterRoutes from "./examCenterRoutes.js";

export async function registerRoutes(app: FastifyInstance) {
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(dashboardRoutes, { prefix: "/api/dashboard" });
  await app.register(examinationRoutes, { prefix: "/api/examinations" });
  await app.register(examCenterRoutes, { prefix: "/api/exam-center" });
  await app.register(jammerRoutes, { prefix: "/api/jammers" });
  await app.register(organizationRoutes, { prefix: "/api/organizations" });
  await app.register(shipmentRoutes, { prefix: "/api/shipments" });
  await app.register(fileRoutes, { prefix: "/api/files" });
  await app.register(userRoutes, { prefix: "/api/users" });
}
