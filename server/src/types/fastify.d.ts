import "fastify"

declare module "fastify" {
  interface FastifyRequest {
    jwtPayload: AccessTokenPayload;
  }
}


export type AccessTokenPayload = {
  id: number
  email: string
  role: userRoleEnum.enumValues
  organizationId: number
  iat?: number
  exp?: number
}

