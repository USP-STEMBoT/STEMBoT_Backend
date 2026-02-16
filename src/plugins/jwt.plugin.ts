// FILE PATH: src/plugins/jwt.plugin.ts
// FILE DESCRIPTION: JWT authentication plugin for Fastify

import { FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { JWT } from "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      adminUserId: string;
      userName: string;
      userEmailAddress: string;
    };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
    jwt: JWT;
  }

  interface FastifyRequest {
    jwtVerify(): Promise<void>;
  }
}

async function jwtPlugin(fastify: any) {
  fastify.decorate(
    "authenticate",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({
          success: false,
          error: "Unauthorized",
          message: "Invalid or missing token",
        });
      }
    },
  );
}

export default fp(jwtPlugin);
