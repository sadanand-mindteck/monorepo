import { FastifyReply, FastifyRequest } from "fastify";
import { AccessTokenPayload } from "../types/fastify";

const tokenBlacklist: Map<string, number> = new Map();
const cleanupBlacklist = () => {
  const now = Date.now();
  const oneDayInMs = 24 * 60 * 60 * 1000; // One day in milliseconds

  for (const [token, timestamp] of tokenBlacklist.entries()) {
    if (now - timestamp > oneDayInMs) {
      tokenBlacklist.delete(token); // Remove token from blacklist
    }
  }
};
setInterval(cleanupBlacklist, 60 * 60 * 1000); //one Day

export const addToBlacklist = (token: string) => {
  const timestamp = Date.now(); // Store the current timestamp
  tokenBlacklist.set(token, timestamp);
};

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const token = request.headers.authorization?.split(" ")[1];
    if (!token) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    // Check if the token is in the blacklist
    if (tokenBlacklist.has(token)) {
      return reply
        .status(401)
        .send({ message: "Token is invalidated. Please log in again." });
    }

    const decoded = await request.jwtVerify<AccessTokenPayload>();
    request.jwtPayload = decoded as AccessTokenPayload;
  } catch (error) {
    reply.status(401).send({ message: "Unauthorized" });
  }
};
