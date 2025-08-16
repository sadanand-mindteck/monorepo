import { FastifyInstance } from "fastify";
import { registerSwagger } from "./swagger.js";
import { registerStatic } from "./static.js";
import { registerMultipart } from "./multipart.js";
import { registerJwt } from "./jwt.js";
import { registerCors } from "./cors.js";

export async function registerPlugins(app: FastifyInstance) {
  await registerCors(app);
  //   //   await app.register(fastifyCookie, { secret: config.COOKIE_SECRET });
  await registerJwt(app);
  await registerMultipart(app);
  await registerStatic(app);
  await registerSwagger(app);
}
