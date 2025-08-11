import { FastifyReply, FastifyRequest } from "fastify";
import { UserRole } from "@jims/shared/schema/user.js";
import { AccessTokenPayload } from "@jims/shared/schema/auth.js";

export const authorize = (roles: UserRole[]) => {
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
