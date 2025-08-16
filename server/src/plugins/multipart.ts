import { FastifyInstance } from "fastify";
import multipart from "@fastify/multipart";
import { config } from "../config/env.js";

export async function registerMultipart(app: FastifyInstance) {
  await app.register(multipart, {
    limits: {
      fileSize: config.MAX_FILE_SIZE, // from .env
    },
  });
}
