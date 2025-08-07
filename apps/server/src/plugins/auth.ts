import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginOptions } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { authenticate } from "../Middleware/authenticate.middleware";

export default  function authPlugin(fastify: FastifyInstance, options:FastifyPluginOptions, ) {
  // Register JWT plugin
  
  

}
  