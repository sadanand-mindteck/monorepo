import { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";
// import { config } from "../config/env.js";

export async function registerStatic(app: FastifyInstance) {
  await app.register(fastifyStatic, {
    root: path.resolve(process.env.UPLOAD_PATH || "../../uploads"),
    prefix: "/uploads/",
  });
}
