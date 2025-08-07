import { FastifyReply, FastifyRequest } from "fastify";
import { AccessTokenPayload } from "../types/fastify";
import { userRoleEnum } from "../db/schema";

export const authorize = (roles: Array<(typeof userRoleEnum.enumValues)[number]>) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await request.jwtVerify<AccessTokenPayload>();

      if (!roles.includes(user.role)) {
        return reply.status(403).send({ message: "Forbidden" });
      }
    } catch (error) {
      reply.status(401).send({ message: "Unauthorized" });
    }
  };
};
